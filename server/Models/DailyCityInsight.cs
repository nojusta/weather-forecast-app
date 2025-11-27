namespace server.Models
{
    public class DailyCityInsight
    {
        public int Id { get; set; }
        public string UserId { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public int Views { get; set; }
        public double? AverageTemperatureC { get; set; }
        public double? MaxTemperatureC { get; set; }
        public double? MinTemperatureC { get; set; }
        public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
    }
}
