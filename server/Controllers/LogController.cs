using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using server.Models;
using server.Services;
using System.Security.Claims;

[ApiController]
[Route("api/log")]
[Authorize]
public class LogController : ControllerBase
{
    private readonly CityLogService _logService;

    public LogController(CityLogService logService)
    {
        _logService = logService;
    }

    [HttpPost]
    public async Task<IActionResult> LogCityView([FromBody] LogRequest logRequest, CancellationToken cancellationToken)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized(new { error = "User not authenticated" });
        }

        if (logRequest == null || string.IsNullOrWhiteSpace(logRequest.City))
        {
            return BadRequest(new { error = "Invalid log data" });
        }

        var log = await _logService.LogAsync(userId, logRequest, cancellationToken);

        return Ok(log);
    }

    [HttpGet("history")]
    public async Task<IActionResult> GetHistory([FromQuery] string? city, [FromQuery] DateTime? from, [FromQuery] DateTime? to, [FromQuery] int? limit, [FromQuery] string? sort, CancellationToken cancellationToken)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized(new { error = "User not authenticated" });
        }

        var history = await _logService.GetHistoryAsync(
            userId,
            new LogHistoryQuery
            {
                City = city,
                From = from,
                To = to,
                Limit = NormalizeLimit(limit),
                Sort = ParseSort(sort)
            },
            cancellationToken);

        return Ok(history);
    }

    [HttpGet("top-cities")]
    public async Task<IActionResult> GetTopCities([FromQuery] DateTime? from, [FromQuery] DateTime? to, [FromQuery] int? take, CancellationToken cancellationToken)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized(new { error = "User not authenticated" });
        }

        var size = take.HasValue && take.Value > 0 ? Math.Min(take.Value, 50) : 5;
        var result = await _logService.GetTopCitiesAsync(userId, from, to, size, cancellationToken);
        return Ok(result);
    }

    [HttpGet("extremes")]
    public async Task<IActionResult> GetExtremes([FromQuery] DateTime? from, [FromQuery] DateTime? to, CancellationToken cancellationToken)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized(new { error = "User not authenticated" });
        }

        var extremes = await _logService.GetTemperatureExtremesAsync(userId, from, to, cancellationToken);
        if (extremes == null)
        {
            return NoContent();
        }

        return Ok(extremes);
    }

    private static LogHistorySort ParseSort(string? sort)
    {
        return sort?.ToLowerInvariant() switch
        {
            "oldest" => LogHistorySort.Oldest,
            "city" => LogHistorySort.City,
            _ => LogHistorySort.Recent
        };
    }

    private static int? NormalizeLimit(int? limit)
    {
        if (!limit.HasValue || limit.Value <= 0)
        {
            return null;
        }

        return Math.Min(limit.Value, 200);
    }
}