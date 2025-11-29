using System.Text.Json;

namespace server.Services
{
    public class WeatherLookupService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<WeatherLookupService> _logger;
        private const string BaseUrl = "https://api.meteo.lt/v1/places";
        private readonly JsonSerializerOptions _jsonOptions = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };

        public WeatherLookupService(IHttpClientFactory httpClientFactory, ILogger<WeatherLookupService> logger)
        {
            _httpClient = httpClientFactory.CreateClient();
            _logger = logger;
        }

        public async Task<double?> GetCurrentTemperatureAsync(string placeCode, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(placeCode))
            {
                return null;
            }

            var url = $"{BaseUrl}/{placeCode}/forecasts/long-term";

            try
            {
                using var response = await _httpClient.GetAsync(url, cancellationToken);
                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogWarning("Weather lookup failed for {PlaceCode} with status {Status}", placeCode, response.StatusCode);
                    return null;
                }

                var payload = await response.Content.ReadAsStringAsync(cancellationToken);
                var forecast = JsonSerializer.Deserialize<ForecastResponse>(payload, _jsonOptions);

                var timestamps = forecast?.ForecastTimestamps;
                if (timestamps == null || timestamps.Count == 0)
                {
                    _logger.LogWarning("Weather lookup for {PlaceCode} returned no timestamps", placeCode);
                    return null;
                }

                var parsed = timestamps
                    .Select(t => new { Time = t.ParsedTime, t.AirTemperature })
                    .Where(t => t.Time.HasValue)
                    .ToList();

                if (parsed.Count == 0)
                {
                    _logger.LogWarning("Weather lookup for {PlaceCode} had no parsable timestamps", placeCode);
                    return null;
                }

                var currentTime = DateTime.UtcNow;
                var closest = parsed
                    .OrderBy(t => Math.Abs((t.Time!.Value - currentTime).TotalMinutes))
                    .FirstOrDefault();

                return closest?.AirTemperature;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Weather lookup failed for {PlaceCode}", placeCode);
                return null;
            }
        }

        private class ForecastResponse
        {
            public List<ForecastTimestamp> ForecastTimestamps { get; set; } = new();
        }

        private class ForecastTimestamp
        {
            public string ForecastTimeUtc { get; set; } = string.Empty;
            public double AirTemperature { get; set; }

            public DateTime? ParsedTime
            {
                get
                {
                    if (string.IsNullOrWhiteSpace(ForecastTimeUtc))
                    {
                        return null;
                    }

                    // API returns "yyyy-MM-dd HH:mm:ss"
                    var normalized = ForecastTimeUtc.Contains('T')
                        ? ForecastTimeUtc
                        : ForecastTimeUtc.Replace(" ", "T");

                    if (DateTime.TryParse(normalized, null, System.Globalization.DateTimeStyles.AssumeUniversal, out var dt))
                    {
                        return dt.ToUniversalTime();
                    }

                    return null;
                }
            }
        }
    }
}
