namespace server.Models
{
    public record CityLogSummary(string City, int Views);

    public record TemperatureObservation(string City, double TemperatureC, double? FeelsLikeC, DateTime Timestamp);

    public class CityLogExtremes
    {
        public TemperatureObservation? Hottest { get; init; }
        public TemperatureObservation? Coldest { get; init; }
    }

    public enum LogHistorySort
    {
        Recent,
        Oldest,
        City
    }

    public class LogHistoryQuery
    {
        public DateTime? From { get; init; }
        public DateTime? To { get; init; }
        public string? City { get; init; }
        public int? Limit { get; init; }
        public LogHistorySort Sort { get; init; } = LogHistorySort.Recent;
    }
}
