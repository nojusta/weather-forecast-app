using Microsoft.EntityFrameworkCore;
using server.Data;
using server.Models;
using System.Text.Json;

namespace server.Services
{
    public class AlertService
    {
        private readonly AppDbContext _context;
        private readonly AuthService _authService;
        private readonly EmailSender _emailSender;
        private readonly WeatherLookupService _weatherLookup;
        private readonly ILogger<AlertService> _logger;
        private const int MinMinutesBetweenTriggers = 60;
        private const int DefaultDigestSendHourLocal = 7; // 07:00 Europe/Vilnius
        private const int EmailThrottleMilliseconds = 2000; // space out sends to avoid rate limits (Mailtrap friendly)

        private readonly object _sendLock = new();
        private DateTime _nextSendUtc = DateTime.MinValue;

        public AlertService(
            AppDbContext context,
            AuthService authService,
            EmailSender emailSender,
            WeatherLookupService weatherLookup,
            ILogger<AlertService> logger)
        {
            _context = context;
            _authService = authService;
            _emailSender = emailSender;
            _weatherLookup = weatherLookup;
            _logger = logger;
        }

        public async Task<AlertRule?> CreateAsync(string userId, AlertRuleRequest request, CancellationToken cancellationToken)
        {
            ValidateRequest(request);

            var rule = new AlertRule
            {
                UserId = userId,
                City = request.City.Trim(),
                PlaceCode = request.PlaceCode.Trim(),
                ConditionType = request.ConditionType,
                ThresholdC = request.ThresholdC,
                Active = request.Active,
                QuietHoursStart = request.QuietHoursStart,
                QuietHoursEnd = request.QuietHoursEnd,
                DigestEnabled = request.DigestEnabled
            };

            _context.AlertRules.Add(rule);
            await _context.SaveChangesAsync(cancellationToken);
            return rule;
        }

        public async Task<IReadOnlyList<AlertRule>> GetAsync(string userId, CancellationToken cancellationToken)
        {
            return await _context.AlertRules
                .AsNoTracking()
                .Where(rule => rule.UserId == userId)
                .OrderByDescending(rule => rule.CreatedAt)
                .ToListAsync(cancellationToken);
        }

        public async Task<AlertRule?> UpdateAsync(string userId, int id, AlertRuleRequest request, CancellationToken cancellationToken)
        {
            ValidateRequest(request);

            var rule = await _context.AlertRules
                .FirstOrDefaultAsync(r => r.Id == id && r.UserId == userId, cancellationToken);

            if (rule == null)
            {
                return null;
            }

            rule.City = request.City.Trim();
            rule.PlaceCode = request.PlaceCode.Trim();
            rule.ConditionType = request.ConditionType;
            rule.ThresholdC = request.ThresholdC;
            rule.Active = request.Active;
            rule.QuietHoursStart = request.QuietHoursStart;
            rule.QuietHoursEnd = request.QuietHoursEnd;
            rule.DigestEnabled = request.DigestEnabled;

            await _context.SaveChangesAsync(cancellationToken);
            return rule;
        }

        public async Task<bool> DeleteAsync(string userId, int id, CancellationToken cancellationToken)
        {
            var rule = await _context.AlertRules
                .FirstOrDefaultAsync(r => r.Id == id && r.UserId == userId, cancellationToken);

            if (rule == null)
            {
                return false;
            }

            _context.AlertRules.Remove(rule);
            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }

        public async Task<IReadOnlyList<AlertDelivery>> GetDeliveriesAsync(string userId, int take, CancellationToken cancellationToken)
        {
            var ruleIds = await _context.AlertRules
                .Where(r => r.UserId == userId)
                .Select(r => r.Id)
                .ToListAsync(cancellationToken);

            return await _context.AlertDeliveries
                .AsNoTracking()
                .Where(d => ruleIds.Contains(d.AlertRuleId))
                .OrderByDescending(d => d.AttemptedAt)
                .Take(take)
                .Include(d => d.AlertRule)
                .ToListAsync(cancellationToken);
        }

        public async Task<AlertStats> GetStatsAsync(string userId, CancellationToken cancellationToken)
        {
            var ruleIds = await _context.AlertRules
                .Where(r => r.UserId == userId)
                .Select(r => r.Id)
                .ToListAsync(cancellationToken);

            var totalRules = ruleIds.Count;
            var activeRules = await _context.AlertRules.CountAsync(r => r.UserId == userId && r.Active, cancellationToken);

            var deliveries = await _context.AlertDeliveries
                .Where(d => ruleIds.Contains(d.AlertRuleId))
                .GroupBy(d => d.Status)
                .Select(g => new { Status = g.Key, Count = g.Count() })
                .ToListAsync(cancellationToken);

            var sent = deliveries.FirstOrDefault(d => d.Status == AlertDeliveryStatus.Sent)?.Count ?? 0;
            var failed = deliveries.FirstOrDefault(d => d.Status == AlertDeliveryStatus.Failed)?.Count ?? 0;

            return new AlertStats
            {
                TotalRules = totalRules,
                ActiveRules = activeRules,
                SentCount = sent,
                FailedCount = failed
            };
        }

        public async Task EvaluateActiveRulesAsync(CancellationToken cancellationToken)
        {
            var rules = await _context.AlertRules
                .Where(r => r.Active)
                .ToListAsync(cancellationToken);

            if (rules.Count == 0)
            {
                return;
            }

            var now = DateTime.UtcNow;
            var temps = new Dictionary<string, double?>();

            var distinctPlaces = rules.Select(r => r.PlaceCode).Distinct().ToList();
            foreach (var place in distinctPlaces)
            {
                temps[place] = await _weatherLookup.GetCurrentTemperatureAsync(place, cancellationToken);
            }

            foreach (var rule in rules)
            {
                var temp = temps.GetValueOrDefault(rule.PlaceCode);

                // _logger.LogWarning(
                //     "DEBUG | City={City}, PlaceCode={Code}, Temp={Temp}, Threshold={Threshold}, Type={Type}, LastTriggered={Last}",
                //     rule.City,
                //     rule.PlaceCode,
                //     temp,
                //     rule.ThresholdC,
                //     rule.ConditionType,
                //     rule.LastTriggeredAt
                // );

                if (!temp.HasValue)
                {
                    _logger.LogWarning("DEBUG | Skipping rule {Id} — temp is null", rule.Id);
                    continue;
                }

                if (IsInQuietHours(now, rule.QuietHoursStart, rule.QuietHoursEnd))
                {
                    _logger.LogWarning("DEBUG | Rule {Id} deferred due to quiet hours", rule.Id);
                    continue;
                }

                var shouldTrigger = ShouldTrigger(rule, temp.Value, now);

                _logger.LogWarning("DEBUG | Rule {Id} shouldTrigger={ShouldTrigger}", rule.Id, shouldTrigger);

                if (!shouldTrigger)
                {
                    continue;
                }

                // Always log a delivery; if digest is on, also queue a digest record
                var immediateDelivery = new AlertDelivery
                {
                    AlertRuleId = rule.Id,
                    Status = AlertDeliveryStatus.Pending,
                    AttemptedAt = now,
                    Payload = JsonSerializer.Serialize(new
                    {
                        rule.City,
                        rule.PlaceCode,
                        Temperature = temp.Value,
                        rule.ConditionType,
                        rule.ThresholdC,
                        TriggeredAt = now
                    })
                };
                _context.AlertDeliveries.Add(immediateDelivery);

                if (rule.DigestEnabled)
                {
                    var digestDelivery = new AlertDelivery
                    {
                        AlertRuleId = rule.Id,
                        Status = AlertDeliveryStatus.Pending,
                        AttemptedAt = now,
                        DigestBatchDate = ToVilnius(now).Date,
                        Payload = immediateDelivery.Payload
                    };
                    _context.AlertDeliveries.Add(digestDelivery);
                }

                var user = await _authService.GetUserByIdAsync(rule.UserId);
                if (user == null)
                {
                    immediateDelivery.Status = AlertDeliveryStatus.Failed;
                    immediateDelivery.ErrorMessage = "User not found";
                    rule.LastTriggeredAt = now;
                    continue;
                }

                var subject = $"Weather alert for {rule.City}";
                var body = BuildEmailBody(rule, temp.Value, now);

                if (!_emailSender.IsConfigured)
                {
                    immediateDelivery.Status = AlertDeliveryStatus.Failed;
                    immediateDelivery.ErrorMessage = "SMTP not configured";
                    rule.LastTriggeredAt = now;
                    continue;
                }

                await ThrottleAsync(cancellationToken);

                var (success, error) = await _emailSender.SendAsync(user.Email, subject, body, true, cancellationToken);
                immediateDelivery.Status = success ? AlertDeliveryStatus.Sent : AlertDeliveryStatus.Failed;
                immediateDelivery.ErrorMessage = error;
                rule.LastTriggeredAt = now;
            }

            await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task ProcessDigestsAsync(CancellationToken cancellationToken, bool forceRun = false)
        {
            if (!_emailSender.IsConfigured)
            {
                return;
            }

            var now = DateTime.UtcNow;
            var vilniusNow = ToVilnius(now);
            var windowStart = vilniusNow.Date.AddDays(-1); // last 24h window
            var today = vilniusNow.Date;

            var pending = await _context.AlertDeliveries
                .Include(d => d.AlertRule)
                .Where(d =>
                    d.Status == AlertDeliveryStatus.Pending
                    && d.AlertRule!.DigestEnabled
                    && (
                        forceRun
                            ? true
                            : (d.DigestBatchDate.HasValue
                               && d.DigestBatchDate.Value >= windowStart
                               && d.DigestBatchDate.Value <= today)
                       ))
                .ToListAsync(cancellationToken);

            if (pending.Count == 0)
            {
                return;
            }

            var groups = pending.GroupBy(d => d.AlertRule!.UserId);

            foreach (var group in groups)
            {
                var sendHour = group.First().AlertRule?.DigestSendHourLocal ?? DefaultDigestSendHourLocal;
                if (!forceRun && vilniusNow.Hour < sendHour)
                {
                    continue;
                }

                var user = await _authService.GetUserByIdAsync(group.Key);
                if (user == null)
                {
                    foreach (var d in group)
                    {
                        d.Status = AlertDeliveryStatus.Failed;
                        d.ErrorMessage = "User not found";
                    }
                    continue;
                }

                var items = group
                    .Select(d => JsonSerializer.Deserialize<DeliveryPayload>(d.Payload ?? "{}"))
                    .Where(p => p != null)
                    .Select(p => p!)
                    .ToList();

                var subject = "Dienos orų įspėjimų santrauka";
                var body = BuildDigestEmail(items, vilniusNow);

                await ThrottleAsync(cancellationToken);

                var (success, error) = await _emailSender.SendAsync(user.Email, subject, body, true, cancellationToken);

                foreach (var d in group)
                {
                    d.Status = success ? AlertDeliveryStatus.Sent : AlertDeliveryStatus.Failed;
                    d.ErrorMessage = error;
                }
            }

            await _context.SaveChangesAsync(cancellationToken);
        }

        private static bool ShouldTrigger(AlertRule rule, double temp, DateTime now)
        {
            var conditionMet = rule.ConditionType == AlertConditionType.Below
                ? temp < rule.ThresholdC
                : temp > rule.ThresholdC;

            if (!conditionMet)
            {
                return false;
            }

            if (!rule.LastTriggeredAt.HasValue)
            {
                return true;
            }

            return rule.LastTriggeredAt.Value <= now.AddMinutes(-MinMinutesBetweenTriggers);
        }

        private static bool IsInQuietHours(DateTime nowUtc, int? startHour, int? endHour)
        {
            if (!startHour.HasValue || !endHour.HasValue)
            {
                return false;
            }

            var local = ToVilnius(nowUtc);
            var hour = local.Hour;

            if (startHour == endHour)
            {
                return false;
            }

            if (startHour < endHour)
            {
                return hour >= startHour && hour < endHour;
            }

            return hour >= startHour || hour < endHour;
        }

        private static DateTime ToVilnius(DateTime utcNow)
        {
            try
            {
                var tz = TimeZoneInfo.FindSystemTimeZoneById("Europe/Vilnius");
                return TimeZoneInfo.ConvertTimeFromUtc(utcNow, tz);
            }
            catch
            {
                return utcNow;
            }
        }

        private Task ThrottleAsync(CancellationToken cancellationToken)
        {
            if (EmailThrottleMilliseconds <= 0)
            {
                return Task.CompletedTask;
            }

            int delayMs = 0;
            lock (_sendLock)
            {
                var now = DateTime.UtcNow;
                if (now < _nextSendUtc)
                {
                    delayMs = (int)Math.Ceiling((_nextSendUtc - now).TotalMilliseconds);
                }

                _nextSendUtc = now.AddMilliseconds(EmailThrottleMilliseconds);
            }

            return delayMs > 0
                ? Task.Delay(delayMs, cancellationToken)
                : Task.CompletedTask;
        }

        private static string BuildEmailBody(AlertRule rule, double temp, DateTime now)
        {
            var condition = rule.ConditionType == AlertConditionType.Below ? "žemiau" : "aukščiau";
            var localNow = ToVilnius(now);

            return $@"
<html>
  <body style=""font-family: Arial, sans-serif; background: #f7fafc; padding: 24px;"">
    <div style=""max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); overflow: hidden;"">
      <div style=""background: linear-gradient(120deg, #2563eb, #38bdf8); padding: 18px 24px; color: #fff;"">
        <h2 style=""margin:0; font-size: 20px;"">Weather Alert</h2>
        <p style=""margin:6px 0 0 0; font-size: 14px;"">{rule.City}</p>
      </div>
      <div style=""padding: 20px 24px; color: #1f2937;"">
        <p style=""margin-top:0;"">Buvo suaktyvintas orų perspėjimas.</p>
        <table style=""width:100%; border-collapse: collapse; margin: 12px 0;"">
          <tr>
            <td style=""padding:8px; font-weight:600; color:#4b5563;"">Dabartinė temperatūra</td>
            <td style=""padding:8px; text-align:right; color:#111827;"">{temp:F1}°C</td>
          </tr>
          <tr>
            <td style=""padding:8px; font-weight:600; color:#4b5563;"">Sąlyga</td>
            <td style=""padding:8px; text-align:right; color:#111827;"">{condition} {rule.ThresholdC:F1}°C</td>
          </tr>
          <tr>
            <td style=""padding:8px; font-weight:600; color:#4b5563;"">Laikas</td>
            <td style=""padding:8px; text-align:right; color:#111827;"">{localNow:yyyy-MM-dd HH:mm:ss} (Europe/Vilnius)</td>
          </tr>
        </table>
        <p style=""margin:12px 0 0 0; font-size: 14px; color:#4b5563;"">
          Galite koreguoti arba išjungti taisyklę prisijungę prie savo paskyros.
        </p>
      </div>
      <div style=""background:#f3f4f6; padding:12px 24px; font-size:12px; color:#6b7280;"">
        Weather Alerts · Automatizuotas pranešimas
      </div>
    </div>
  </body>
</html>";
        }

        private static string BuildDigestEmail(IEnumerable<DeliveryPayload> items, DateTime localNow)
        {
            var rows = string.Join("\n", items.Select(item => $@"
              <tr>
                <td style=""padding:8px; border-bottom:1px solid #e5e7eb;"">{item.City}</td>
                <td style=""padding:8px; border-bottom:1px solid #e5e7eb;"">{item.ConditionType}</td>
                <td style=""padding:8px; border-bottom:1px solid #e5e7eb;"">{item.ThresholdC:F1}°C</td>
                <td style=""padding:8px; border-bottom:1px solid #e5e7eb;"">{item.Temperature:F1}°C</td>
                <td style=""padding:8px; border-bottom:1px solid #e5e7eb;"">{item.TriggeredAtLocal}</td>
              </tr>"));

            return $@"
<html>
  <body style=""font-family: Arial, sans-serif; background: #f7fafc; padding: 24px;"">
    <div style=""max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); overflow: hidden;"">
      <div style=""background: linear-gradient(120deg, #2563eb, #38bdf8); padding: 18px 24px; color: #fff;"">
        <h2 style=""margin:0; font-size: 20px;"">Dienos orų įspėjimų santrauka</h2>
        <p style=""margin:6px 0 0 0; font-size: 14px;"">{localNow:yyyy-MM-dd} (Europe/Vilnius)</p>
      </div>
      <div style=""padding: 20px 24px; color: #1f2937;"">
        <p style=""margin-top:0;"">Šiandien suveikė šios taisyklės:</p>
        <table style=""width:100%; border-collapse: collapse; font-size: 14px;"">
          <thead>
            <tr>
              <th style=""text-align:left; padding:8px; border-bottom:1px solid #e5e7eb;"">Miestas</th>
              <th style=""text-align:left; padding:8px; border-bottom:1px solid #e5e7eb;"">Sąlyga</th>
              <th style=""text-align:left; padding:8px; border-bottom:1px solid #e5e7eb;"">Slenkstis</th>
              <th style=""text-align:left; padding:8px; border-bottom:1px solid #e5e7eb;"">Temp</th>
              <th style=""text-align:left; padding:8px; border-bottom:1px solid #e5e7eb;"">Laikas</th>
            </tr>
          </thead>
          <tbody>
            {rows}
          </tbody>
        </table>
      </div>
      <div style=""background:#f3f4f6; padding:12px 24px; font-size:12px; color:#6b7280;"">
        Weather Alerts · Automatizuotas pranešimas
      </div>
    </div>
  </body>
</html>";
        }

        private static void ValidateRequest(AlertRuleRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.City) || string.IsNullOrWhiteSpace(request.PlaceCode))
            {
                throw new ArgumentException("City and place code are required");
            }

            if (request.QuietHoursStart.HasValue && (request.QuietHoursStart < 0 || request.QuietHoursStart > 23))
            {
                throw new ArgumentException("QuietHoursStart must be between 0 and 23");
            }

            if (request.QuietHoursEnd.HasValue && (request.QuietHoursEnd < 0 || request.QuietHoursEnd > 23))
            {
                throw new ArgumentException("QuietHoursEnd must be between 0 and 23");
            }
        }

        private class DeliveryPayload
        {
            public string City { get; set; } = string.Empty;
            public string PlaceCode { get; set; } = string.Empty;
            public double Temperature { get; set; }
            public AlertConditionType ConditionType { get; set; }
            public double ThresholdC { get; set; }
            public DateTime TriggeredAt { get; set; }

            public string TriggeredAtLocal
            {
                get
                {
                    var local = ToVilnius(TriggeredAt);
                    return $"{local:yyyy-MM-dd HH:mm:ss}";
                }
            }
        }
    }

    public class AlertStats
    {
        public int TotalRules { get; set; }
        public int ActiveRules { get; set; }
        public int SentCount { get; set; }
        public int FailedCount { get; set; }
    }
}
