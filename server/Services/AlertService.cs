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
                Active = request.Active
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

            // Cache temperatures per place
            var distinctPlaces = rules.Select(r => r.PlaceCode).Distinct().ToList();
            foreach (var place in distinctPlaces)
            {
                temps[place] = await _weatherLookup.GetCurrentTemperatureAsync(place, cancellationToken);
            }

            foreach (var rule in rules)
            {
               var temp = temps.GetValueOrDefault(rule.PlaceCode);

                _logger.LogWarning(
                    "DEBUG | City={City}, PlaceCode={Code}, Temp={Temp}, Threshold={Threshold}, Type={Type}, LastTriggered={Last}",
                    rule.City,
                    rule.PlaceCode,
                    temp,
                    rule.ThresholdC,
                    rule.ConditionType,
                    rule.LastTriggeredAt
                );

                if (!temp.HasValue)
                {
                    _logger.LogWarning("DEBUG | Skipping rule {Id} — temp is null", rule.Id);
                    continue;
                }

                var shouldTrigger = ShouldTrigger(rule, temp.Value, now);

                _logger.LogWarning(
                    "DEBUG | Rule {Id} shouldTrigger={ShouldTrigger}",
                    rule.Id,
                    shouldTrigger
                );

                if (!shouldTrigger)
                {
                    continue;
                }

                var delivery = new AlertDelivery
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

                _context.AlertDeliveries.Add(delivery);

                var user = await _authService.GetUserByIdAsync(rule.UserId);
                if (user == null)
                {
                    delivery.Status = AlertDeliveryStatus.Failed;
                    delivery.ErrorMessage = "User not found";
                    rule.LastTriggeredAt = now;
                    continue;
                }

                var subject = $"Weather alert for {rule.City}";
                var body = BuildEmailBody(rule, temp.Value, now);

                if (!_emailSender.IsConfigured)
                {
                    delivery.Status = AlertDeliveryStatus.Failed;
                    delivery.ErrorMessage = "SMTP not configured";
                    rule.LastTriggeredAt = now;
                    continue;
                }

                var (success, error) = await _emailSender.SendAsync(user.Email, subject, body, true, cancellationToken);
                delivery.Status = success ? AlertDeliveryStatus.Sent : AlertDeliveryStatus.Failed;
                delivery.ErrorMessage = error;
                rule.LastTriggeredAt = now;
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

        private static string BuildEmailBody(AlertRule rule, double temp, DateTime now)
        {
            var condition = rule.ConditionType == AlertConditionType.Below ? "žemiau" : "aukščiau";

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
            <td style=""padding:8px; text-align:right; color:#111827;"">{now:yyyy-MM-dd HH:mm:ss} UTC</td>
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

        private static void ValidateRequest(AlertRuleRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.City) || string.IsNullOrWhiteSpace(request.PlaceCode))
            {
                throw new ArgumentException("City and place code are required");
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
