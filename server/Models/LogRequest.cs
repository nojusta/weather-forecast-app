using System.Text.Json.Serialization;

namespace server.Models
{
    public class LogRequest
    {
        public string? City { get; set; }

        [JsonPropertyName("timestamp")]
        public DateTime? ViewedAt { get; set; }

        public double? TemperatureC { get; set; }
        public double? FeelsLikeC { get; set; }
        public string? Conditions { get; set; }
    }
}