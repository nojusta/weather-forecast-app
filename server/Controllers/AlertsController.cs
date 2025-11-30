using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using server.Models;
using server.Services;
using System.Security.Claims;

namespace server.Controllers
{
    [ApiController]
    [Route("api/alerts")]
    [Authorize]
    public class AlertsController : ControllerBase
    {
        private readonly AlertService _alertService;

        public AlertsController(AlertService alertService)
        {
            _alertService = alertService;
        }

        [HttpGet]
        public async Task<IActionResult> GetMyAlerts(CancellationToken cancellationToken)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            var alerts = await _alertService.GetAsync(userId, cancellationToken);
            return Ok(alerts);
        }

        [HttpPost]
        public async Task<IActionResult> CreateAlert([FromBody] AlertRuleRequest request, CancellationToken cancellationToken)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            try
            {
                var alert = await _alertService.CreateAsync(userId, request, cancellationToken);
                return CreatedAtAction(nameof(GetMyAlerts), new { id = alert!.Id }, alert);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateAlert(int id, [FromBody] AlertRuleRequest request, CancellationToken cancellationToken)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            try
            {
                var alert = await _alertService.UpdateAsync(userId, id, request, cancellationToken);
                if (alert == null) return NotFound();
                return Ok(alert);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteAlert(int id, CancellationToken cancellationToken)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            var deleted = await _alertService.DeleteAsync(userId, id, cancellationToken);
            return deleted ? NoContent() : NotFound();
        }

        [HttpGet("deliveries")]
        public async Task<IActionResult> GetDeliveries([FromQuery] int take = 50, CancellationToken cancellationToken = default)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            var deliveries = await _alertService.GetDeliveriesAsync(userId, Math.Clamp(take, 1, 200), cancellationToken);
            return Ok(deliveries);
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetStats(CancellationToken cancellationToken)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            var stats = await _alertService.GetStatsAsync(userId, cancellationToken);
            return Ok(stats);
        }

        [HttpPost("digest/run-now")]
        public async Task<IActionResult> RunDigestNow(CancellationToken cancellationToken)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            var sent = await _alertService.ProcessDigestsAsync(cancellationToken, forceRun: true);
            return Ok(new { sent });
        }

        private string? GetUserId()
        {
            return User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        }
    }
}
