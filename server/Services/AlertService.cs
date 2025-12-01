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
        private readonly EmailThrottle _throttle;

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
            _throttle = new EmailThrottle(EmailThrottleMilliseconds);
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

                if (AlertTime.IsInQuietHours(now, rule.QuietHoursStart, rule.QuietHoursEnd))
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
                        DigestBatchDate = AlertTime.ToVilnius(now).Date,
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
                var body = AlertEmailFormatter.BuildEmailBody(rule, temp.Value, now);

                if (!_emailSender.IsConfigured)
                {
                    immediateDelivery.Status = AlertDeliveryStatus.Failed;
                    immediateDelivery.ErrorMessage = "SMTP not configured";
                    rule.LastTriggeredAt = now;
                    continue;
                }

                await _throttle.WaitAsync(cancellationToken);

                var (success, error) = await _emailSender.SendAsync(user.Email, subject, body, true, cancellationToken);
                immediateDelivery.Status = success ? AlertDeliveryStatus.Sent : AlertDeliveryStatus.Failed;
                immediateDelivery.ErrorMessage = error;
                rule.LastTriggeredAt = now;
            }

            await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task<int> ProcessDigestsAsync(CancellationToken cancellationToken, bool forceRun = false)
        {
            if (!_emailSender.IsConfigured)
            {
                return 0;
            }

            var now = DateTime.UtcNow;
            var vilniusNow = AlertTime.ToVilnius(now);
            var windowStart = vilniusNow.Date.AddDays(-1); // last 24h window
            var today = vilniusNow.Date;

            var candidates = await _context.AlertDeliveries
                .Include(d => d.AlertRule)
                .Where(d =>
                    d.AlertRule!.DigestEnabled
                    && d.DigestBatchDate.HasValue
                    && d.DigestBatchDate.Value >= windowStart
                    && d.DigestBatchDate.Value <= today)
                .ToListAsync(cancellationToken);

            var pending = candidates.Where(d => d.Status == AlertDeliveryStatus.Pending).ToList();
            var workSet = forceRun ? candidates : pending;

            if (workSet.Count == 0)
            {
                return 0;
            }

            var groups = workSet.GroupBy(d => d.AlertRule!.UserId);
            var sentCount = 0;

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
                var body = AlertEmailFormatter.BuildDigestEmail(items, vilniusNow);

                await _throttle.WaitAsync(cancellationToken);

                var (success, error) = await _emailSender.SendAsync(user.Email, subject, body, true, cancellationToken);

                foreach (var d in group.Where(d => d.Status == AlertDeliveryStatus.Pending))
                {
                    d.Status = success ? AlertDeliveryStatus.Sent : AlertDeliveryStatus.Failed;
                    d.ErrorMessage = error;
                }

                if (forceRun && group.Any())
                {
                    // Log a manual digest send so it appears in recent deliveries
                    var markerRuleId = group.First().AlertRule!.Id;
                    _context.AlertDeliveries.Add(new AlertDelivery
                    {
                        AlertRuleId = markerRuleId,
                        Status = success ? AlertDeliveryStatus.Sent : AlertDeliveryStatus.Failed,
                        AttemptedAt = now,
                        DigestBatchDate = today,
                        ErrorMessage = error,
                        Payload = JsonSerializer.Serialize(new
                        {
                            Manual = true,
                            Count = items.Count,
                            WindowStart = windowStart,
                            WindowEnd = today
                        })
                    });
                }

                if (success)
                {
                    sentCount++;
                }
            }

            await _context.SaveChangesAsync(cancellationToken);

            return sentCount;
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

    }

    public class AlertStats
    {
        public int TotalRules { get; set; }
        public int ActiveRules { get; set; }
        public int SentCount { get; set; }
        public int FailedCount { get; set; }
    }
}
