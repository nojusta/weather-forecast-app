using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace server.Services
{
    public class InsightAggregationService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly TimeSpan _interval = TimeSpan.FromMinutes(30);
        private readonly int _lookbackDays = 7;

        public InsightAggregationService(IServiceScopeFactory scopeFactory)
        {
            _scopeFactory = scopeFactory;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            await GenerateAsync(stoppingToken);

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await Task.Delay(_interval, stoppingToken);
                    await GenerateAsync(stoppingToken);
                }
                catch (TaskCanceledException)
                {
                    break;
                }
            }
        }

        private async Task GenerateAsync(CancellationToken cancellationToken)
        {
            using var scope = _scopeFactory.CreateScope();
            var insightService = scope.ServiceProvider.GetRequiredService<InsightService>();

            var fromDate = DateTime.UtcNow.Date.AddDays(-_lookbackDays);
            await insightService.GenerateDailyInsightsAsync(fromDate, cancellationToken);
        }
    }
}
