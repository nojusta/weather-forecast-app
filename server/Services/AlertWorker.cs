using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace server.Services
{
    public class AlertWorker : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly TimeSpan _interval = TimeSpan.FromMinutes(1);

        public AlertWorker(IServiceScopeFactory scopeFactory)
        {
            _scopeFactory = scopeFactory;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            Console.WriteLine("ALERT WORKER STARTED");
            await RunOnce(stoppingToken);

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await Task.Delay(_interval, stoppingToken);
                    await RunOnce(stoppingToken);
                }
                catch (TaskCanceledException)
                {
                    break;
                }
            }
        }

        private async Task RunOnce(CancellationToken cancellationToken)
        {
            using var scope = _scopeFactory.CreateScope();
            var alertService = scope.ServiceProvider.GetRequiredService<AlertService>();
            await alertService.EvaluateActiveRulesAsync(cancellationToken);
        }
    }
}
