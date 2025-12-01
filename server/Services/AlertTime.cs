namespace server.Services
{
    internal static class AlertTime
    {
        public static DateTime ToVilnius(DateTime utcNow)
        {
            try
            {
                var tz = TimeZoneInfo.FindSystemTimeZoneById("Europe/Vilnius");
                return TimeZoneInfo.ConvertTimeFromUtc(utcNow, tz);
            }
            catch
            {
                return utcNow;
            }
        }

        public static bool IsInQuietHours(DateTime nowUtc, int? startHour, int? endHour)
        {
            if (!startHour.HasValue || !endHour.HasValue)
            {
                return false;
            }

            var local = ToVilnius(nowUtc);
            var hour = local.Hour;

            if (startHour == endHour)
            {
                return false;
            }

            if (startHour < endHour)
            {
                return hour >= startHour && hour < endHour;
            }

            return hour >= startHour || hour < endHour;
        }
    }
}
