using System.Net;
using System.Net.Mail;

namespace server.Services
{
    public class EmailSender
    {
        private readonly string? _host;
        private readonly int _port;
        private readonly string? _username;
        private readonly string? _password;
        private readonly string? _from;
        private readonly string? _fromName;
        private readonly bool _enabled;

        public EmailSender(IConfiguration configuration)
        {
            _host = Environment.GetEnvironmentVariable("SMTP_HOST") ?? configuration["Smtp:Host"];
            _port = int.TryParse(Environment.GetEnvironmentVariable("SMTP_PORT") ?? configuration["Smtp:Port"], out var port) ? port : 587;
            _username = Environment.GetEnvironmentVariable("SMTP_USER") ?? configuration["Smtp:User"];
            _password = Environment.GetEnvironmentVariable("SMTP_PASS") ?? configuration["Smtp:Pass"];
            _from = Environment.GetEnvironmentVariable("SMTP_FROM") ?? configuration["Smtp:From"];
            _fromName = Environment.GetEnvironmentVariable("SMTP_FROM_NAME") ?? configuration["Smtp:FromName"];

            _enabled = !string.IsNullOrWhiteSpace(_host) && !string.IsNullOrWhiteSpace(_from);
        }

        public bool IsConfigured => _enabled;

        public async Task<(bool success, string? error)> SendAsync(string to, string subject, string body, bool isHtml, CancellationToken cancellationToken)
        {
            if (!_enabled)
            {
                return (false, "SMTP is not configured");
            }

            try
            {
                using var client = new SmtpClient(_host, _port)
                {
                    EnableSsl = true, // STARTTLS on port 587
                    DeliveryMethod = SmtpDeliveryMethod.Network,
                    UseDefaultCredentials = false,
                    Credentials = (!string.IsNullOrWhiteSpace(_username) && !string.IsNullOrWhiteSpace(_password))
                        ? new NetworkCredential(_username, _password)
                        : CredentialCache.DefaultNetworkCredentials
                };

                using var message = new MailMessage
                {
                    From = string.IsNullOrWhiteSpace(_fromName)
                        ? new MailAddress(_from!)
                        : new MailAddress(_from!, _fromName),
                    Subject = subject,
                    Body = body,
                    IsBodyHtml = isHtml
                };

                message.To.Add(to);

                // SmtpClient lacks native async cancel; wrap in Task.Run with token.
                await Task.Run(() => client.Send(message), cancellationToken);

                return (true, null);
            }
            catch (Exception ex)
            {
                return (false, ex.Message);
            }
        }
    }
}
