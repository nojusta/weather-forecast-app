using Microsoft.EntityFrameworkCore;
using server.Data;
using server.Models;

namespace server.Services
{
    public class InsightService
    {
        private readonly AppDbContext _context;

        public InsightService(AppDbContext context)
        {
            _context = context;
        }

        public async Task GenerateDailyInsightsAsync(DateTime fromDateUtc, CancellationToken cancellationToken)
        {
            var normalizedFrom = fromDateUtc.Date;

            var logs = await _context.CityLogs
                .AsNoTracking()
                .Where(log => log.Timestamp.Date >= normalizedFrom)
                .ToListAsync(cancellationToken);

            if (logs.Count == 0)
            {
                return;
            }

            var existingEntries = await _context.DailyCityInsights
                .Where(insight => insight.Date >= normalizedFrom)
                .ToListAsync(cancellationToken);

            var entryMap = existingEntries.ToDictionary(
                insight => (insight.UserId, insight.City, insight.Date.Date));

            var grouped = logs
                .GroupBy(log => (log.UserId, log.City, Date: log.Timestamp.Date));

            foreach (var group in grouped)
            {
                var key = (group.Key.UserId, group.Key.City, group.Key.Date);

                if (!entryMap.TryGetValue(key, out var entry))
                {
                    entry = new DailyCityInsight
                    {
                        UserId = group.Key.UserId,
                        City = group.Key.City,
                        Date = group.Key.Date,
                        GeneratedAt = DateTime.UtcNow
                    };

                    entryMap[key] = entry;
                    _context.DailyCityInsights.Add(entry);
                }

                entry.Views = group.Count();
                entry.GeneratedAt = DateTime.UtcNow;

                var temperatures = group
                    .Where(log => log.TemperatureC.HasValue)
                    .Select(log => log.TemperatureC!.Value)
                    .ToList();

                if (temperatures.Count > 0)
                {
                    entry.AverageTemperatureC = Math.Round(temperatures.Average(), 2);
                    entry.MaxTemperatureC = temperatures.Max();
                    entry.MinTemperatureC = temperatures.Min();
                }
                else
                {
                    entry.AverageTemperatureC = null;
                    entry.MaxTemperatureC = null;
                    entry.MinTemperatureC = null;
                }
            }

            await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task<IReadOnlyList<DailyCityInsight>> GetDailyInsightsAsync(
            string userId,
            DateTime fromDateUtc,
            CancellationToken cancellationToken)
        {
            var normalizedFrom = fromDateUtc.Date;

            return await _context.DailyCityInsights
                .AsNoTracking()
                .Where(insight => insight.UserId == userId && insight.Date >= normalizedFrom)
                .OrderByDescending(insight => insight.Date)
                .ThenBy(insight => insight.City)
                .ToListAsync(cancellationToken);
        }

        public async Task<InsightTrendResponse> GetTrendSnapshotAsync(
            string userId,
            CancellationToken cancellationToken)
        {
            var today = DateTime.UtcNow.Date;
            var yesterday = today.AddDays(-1);

            var recentEntries = await _context.DailyCityInsights
                .AsNoTracking()
                .Where(insight =>
                    insight.UserId == userId &&
                    (insight.Date == today || insight.Date == yesterday))
                .ToListAsync(cancellationToken);

            var todayEntries = recentEntries.Where(insight => insight.Date == today).ToList();
            var yesterdayEntries = recentEntries.Where(insight => insight.Date == yesterday).ToList();

            var todayViews = todayEntries.Sum(entry => entry.Views);
            var yesterdayViews = yesterdayEntries.Sum(entry => entry.Views);

            var cityTrends = todayEntries
                .Select(entry =>
                {
                    var previous = yesterdayEntries.FirstOrDefault(prev => prev.City == entry.City);
                    var delta = entry.Views - (previous?.Views ?? 0);

                    return new CityTrend
                    {
                        City = entry.City,
                        TodayViews = entry.Views,
                        YesterdayViews = previous?.Views ?? 0,
                        ViewDelta = delta,
                        AverageTemperatureC = entry.AverageTemperatureC
                    };
                })
                .OrderByDescending(trend => trend.TodayViews)
                .ToList();

            return new InsightTrendResponse
            {
                TodayViews = todayViews,
                YesterdayViews = yesterdayViews,
                CityTrends = cityTrends
            };
        }
    }

    public class InsightTrendResponse
    {
        public int TodayViews { get; set; }
        public int YesterdayViews { get; set; }
        public IReadOnlyList<CityTrend> CityTrends { get; set; } = Array.Empty<CityTrend>();
    }

    public class CityTrend
    {
        public string City { get; set; } = string.Empty;
        public int TodayViews { get; set; }
        public int YesterdayViews { get; set; }
        public int ViewDelta { get; set; }
        public double? AverageTemperatureC { get; set; }
    }
}
