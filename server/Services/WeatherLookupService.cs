using System.Text.Json;

namespace server.Services
{
    public class WeatherLookupService
    {
        private readonly HttpClient _httpClient;
        private const string BaseUrl = "https://api.meteo.lt/v1/places";
        private readonly JsonSerializerOptions _jsonOptions = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };

        public WeatherLookupService(IHttpClientFactory httpClientFactory)
        {
            _httpClient = httpClientFactory.CreateClient();
        }

        public async Task<double?> GetCurrentTemperatureAsync(string placeCode, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(placeCode))
            {
                return null;
            }

            try
            {
                var url = $"{BaseUrl}/{placeCode}/forecasts/long-term";
                await using var stream = await _httpClient.GetStreamAsync(url, cancellationToken);
                var forecast = await JsonSerializer.DeserializeAsync<ForecastResponse>(stream, _jsonOptions, cancellationToken);

                var currentTime = DateTime.UtcNow;
                var timestamps = forecast?.ForecastTimestamps;
                if (timestamps == null || timestamps.Count == 0)
                {
                    return null;
                }

                var closest = timestamps
                    .OrderBy(t => Math.Abs((t.ForecastTimeUtc - currentTime).TotalMinutes))
                    .FirstOrDefault();

                return closest?.AirTemperature;
            }
            catch
            {
                return null;
            }
        }

        private class ForecastResponse
        {
            public List<ForecastTimestamp> ForecastTimestamps { get; set; } = new();
        }

        private class ForecastTimestamp
        {
            public DateTime ForecastTimeUtc { get; set; }
            public double AirTemperature { get; set; }
        }
    }
}
