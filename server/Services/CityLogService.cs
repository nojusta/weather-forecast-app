using Microsoft.EntityFrameworkCore;
using server.Data;
using server.Models;

namespace server.Services
{
    public class CityLogService
    {
        private readonly AppDbContext _context;

        public CityLogService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<CityLog> LogAsync(string userId, LogRequest request, CancellationToken cancellationToken)
        {
            if (request == null)
            {
                throw new ArgumentNullException(nameof(request));
            }

            if (string.IsNullOrWhiteSpace(userId))
            {
                throw new ArgumentException("User id is required", nameof(userId));
            }

            if (string.IsNullOrWhiteSpace(request.City))
            {
                throw new ArgumentException("City is required", nameof(request));
            }

            var log = new CityLog
            {
                UserId = userId,
                City = request.City.Trim(),
                Timestamp = request.ViewedAt?.ToUniversalTime() ?? DateTime.UtcNow,
                TemperatureC = request.TemperatureC,
                FeelsLikeC = request.FeelsLikeC,
                Conditions = string.IsNullOrWhiteSpace(request.Conditions) ? null : request.Conditions.Trim()
            };

            _context.CityLogs.Add(log);
            await _context.SaveChangesAsync(cancellationToken);

            return log;
        }

        public async Task<IReadOnlyList<CityLog>> GetHistoryAsync(string userId, LogHistoryQuery query, CancellationToken cancellationToken)
        {
            var records = _context.CityLogs
                .AsNoTracking()
                .Where(log => log.UserId == userId);

            if (query.From.HasValue)
            {
                records = records.Where(log => log.Timestamp >= query.From.Value);
            }

            if (query.To.HasValue)
            {
                records = records.Where(log => log.Timestamp <= query.To.Value);
            }

            if (!string.IsNullOrWhiteSpace(query.City))
            {
                var cityFilter = query.City.Trim();
                records = records.Where(log => log.City == cityFilter);
            }

            records = query.Sort switch
            {
                LogHistorySort.Oldest => records.OrderBy(log => log.Timestamp),
                LogHistorySort.City => records.OrderBy(log => log.City).ThenByDescending(log => log.Timestamp),
                _ => records.OrderByDescending(log => log.Timestamp)
            };

            if (query.Limit.HasValue)
            {
                records = records.Take(query.Limit.Value);
            }

            return await records.ToListAsync(cancellationToken);
        }

        public async Task<IReadOnlyList<CityLogSummary>> GetTopCitiesAsync(string userId, DateTime? from, DateTime? to, int take, CancellationToken cancellationToken)
        {
            if (take <= 0)
            {
                throw new ArgumentOutOfRangeException(nameof(take));
            }

            var records = _context.CityLogs
                .AsNoTracking()
                .Where(log => log.UserId == userId);

            if (from.HasValue)
            {
                records = records.Where(log => log.Timestamp >= from.Value);
            }

            if (to.HasValue)
            {
                records = records.Where(log => log.Timestamp <= to.Value);
            }

            return await records
                .GroupBy(log => log.City)
                .OrderByDescending(group => group.Count())
                .ThenBy(group => group.Key)
                .Take(take)
                .Select(group => new CityLogSummary(group.Key, group.Count()))
                .ToListAsync(cancellationToken);
        }

        public async Task<CityLogExtremes?> GetTemperatureExtremesAsync(string userId, DateTime? from, DateTime? to, CancellationToken cancellationToken)
        {
            var records = _context.CityLogs
                .AsNoTracking()
                .Where(log => log.UserId == userId && log.TemperatureC.HasValue);

            if (from.HasValue)
            {
                records = records.Where(log => log.Timestamp >= from.Value);
            }

            if (to.HasValue)
            {
                records = records.Where(log => log.Timestamp <= to.Value);
            }

            var hottest = await records
                .OrderByDescending(log => log.TemperatureC)
                .FirstOrDefaultAsync(cancellationToken);

            var coldest = await records
                .OrderBy(log => log.TemperatureC)
                .FirstOrDefaultAsync(cancellationToken);

            if (hottest == null && coldest == null)
            {
                return null;
            }

            return new CityLogExtremes
            {
                Hottest = hottest != null ? ToObservation(hottest) : null,
                Coldest = coldest != null ? ToObservation(coldest) : null
            };
        }

        private static TemperatureObservation ToObservation(CityLog log)
        {
            return new TemperatureObservation(
                log.City,
                log.TemperatureC ?? 0,
                log.FeelsLikeC,
                log.Timestamp);
        }
    }
}
