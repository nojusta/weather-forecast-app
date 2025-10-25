namespace server.Models
{
    public class CityLog
    {
        public int Id { get; set; }
        public string UserId { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public double? TemperatureC { get; set; }
        public double? FeelsLikeC { get; set; }
        public string? Conditions { get; set; }
    }
}