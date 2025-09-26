using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/log")]
public class LogController : ControllerBase
{
    [HttpPost]
    public IActionResult LogCityView([FromBody] LogRequest logRequest)
    {
        if (logRequest == null || string.IsNullOrEmpty(logRequest.City))
        {
            return BadRequest(new { error = "Invalid log data" });
        }

        Console.WriteLine($"[{logRequest.Timestamp}] User viewed weather for: {logRequest.City}");
        return Ok(new { success = true });
    }
}

public class LogRequest
{
    public string? City { get; set; }
    public string? Timestamp { get; set; }
}