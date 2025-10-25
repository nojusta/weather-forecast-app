using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Data;
using server.Models;
using System.Security.Claims;

[ApiController]
[Route("api/log")]
public class LogController : ControllerBase
{
    private readonly AppDbContext _dbContext;

    public LogController(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpPost]
    [Authorize]
    public IActionResult LogCityView([FromBody] LogRequest logRequest)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(logRequest.City))
        {
            return BadRequest(new { error = "Invalid log data" });
        }

        var log = new CityLog
        {
            UserId = userId,
            City = logRequest.City,
            Timestamp = DateTime.UtcNow
        };

        _dbContext.CityLogs.Add(log);
        _dbContext.SaveChanges();

        return Ok(new { success = true });
    }

    [HttpGet("history")]
    [Authorize]
    public async Task<IActionResult> GetHistory()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized(new { error = "User not authenticated" });
        }

        var history = await _dbContext.CityLogs
            .Where(log => log.UserId == userId)
            .OrderByDescending(log => log.Timestamp)
            .ToListAsync();

        return Ok(history);
    }
}