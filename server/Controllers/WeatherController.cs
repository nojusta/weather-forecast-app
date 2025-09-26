using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/weather")]
public class WeatherController : ControllerBase
{
    private readonly HttpClient _httpClient;

    public WeatherController(IHttpClientFactory httpClientFactory)
    {
        _httpClient = httpClientFactory.CreateClient();
    }

    [HttpGet("places")]
    public async Task<IActionResult> GetPlaces()
    {
        const string METEO_API_BASE_URL = "https://api.meteo.lt/v1/places";

        try
        {
            var response = await _httpClient.GetAsync(METEO_API_BASE_URL);
            response.EnsureSuccessStatusCode();

            var data = await response.Content.ReadAsStringAsync();
            return Ok(data);
        }
        catch (HttpRequestException ex)
        {
            Console.Error.WriteLine($"Error fetching places: {ex.Message}");
            return StatusCode(500, new { error = "Failed to fetch places" });
        }
    }

    [HttpGet("places/{placeCode}/forecasts/long-term")]
    public async Task<IActionResult> GetForecast(string placeCode)
    {
        const string METEO_API_BASE_URL = "https://api.meteo.lt/v1/places";

        try
        {
            var url = $"{METEO_API_BASE_URL}/{placeCode}/forecasts/long-term";
            var response = await _httpClient.GetAsync(url);
            response.EnsureSuccessStatusCode();

            var data = await response.Content.ReadAsStringAsync();
            return Ok(data);
        }
        catch (HttpRequestException ex)
        {
            Console.Error.WriteLine($"Error fetching forecast for {placeCode}: {ex.Message}");
            return StatusCode(500, new { error = "Failed to fetch forecast" });
        }
    }
}