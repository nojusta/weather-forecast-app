using server.Models;

namespace server.Services
{
    internal class DeliveryPayload
    {
        public string City { get; set; } = string.Empty;
        public string PlaceCode { get; set; } = string.Empty;
        public double Temperature { get; set; }
        public AlertConditionType ConditionType { get; set; }
        public double ThresholdC { get; set; }
        public DateTime TriggeredAt { get; set; }

        public string TriggeredAtLocal
        {
            get
            {
                var local = AlertTime.ToVilnius(TriggeredAt);
                return $"{local:yyyy-MM-dd HH:mm:ss}";
            }
        }
    }
}
