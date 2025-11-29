namespace server.Models
{
    public enum AlertConditionType
    {
        Below = 0,
        Above = 1
    }

    public class AlertRule
    {
        public int Id { get; set; }
        public string UserId { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string PlaceCode { get; set; } = string.Empty;
        public AlertConditionType ConditionType { get; set; }
        public double ThresholdC { get; set; }
        public bool Active { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? LastTriggeredAt { get; set; }
    }

    public enum AlertDeliveryStatus
    {
        Pending = 0,
        Sent = 1,
        Failed = 2
    }

    public class AlertDelivery
    {
        public int Id { get; set; }
        public int AlertRuleId { get; set; }
        public AlertRule? AlertRule { get; set; }
        public AlertDeliveryStatus Status { get; set; }
        public DateTime AttemptedAt { get; set; } = DateTime.UtcNow;
        public string? ErrorMessage { get; set; }
        public string? Payload { get; set; }
    }

    public class AlertRuleRequest
    {
        public string City { get; set; } = string.Empty;
        public string PlaceCode { get; set; } = string.Empty;
        public AlertConditionType ConditionType { get; set; }
        public double ThresholdC { get; set; }
        public bool Active { get; set; } = true;
    }
}
