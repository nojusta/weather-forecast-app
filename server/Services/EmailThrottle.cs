namespace server.Services
{
    internal class EmailThrottle
    {
        private readonly int _delayMs;
        private readonly object _sendLock = new();
        private DateTime _nextSendUtc = DateTime.MinValue;

        public EmailThrottle(int delayMs)
        {
            _delayMs = delayMs;
        }

        public Task WaitAsync(CancellationToken cancellationToken)
        {
            int delayMs = 0;
            lock (_sendLock)
            {
                var now = DateTime.UtcNow;
                if (now < _nextSendUtc)
                {
                    delayMs = (int)Math.Ceiling((_nextSendUtc - now).TotalMilliseconds);
                }

                _nextSendUtc = now.AddMilliseconds(_delayMs);
            }

            return delayMs > 0
                ? Task.Delay(delayMs, cancellationToken)
                : Task.CompletedTask;
        }
    }
}
