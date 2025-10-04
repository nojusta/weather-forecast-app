namespace server.Models
{
    public class CityLog
    {
        public int Id { get; set; }
        public string UserId { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}