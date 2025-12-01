using server.Models;
using System.Text;

namespace server.Services
{
    internal static class AlertEmailFormatter
    {
        public static string BuildEmailBody(AlertRule rule, double temp, DateTime now)
        {
            var condition = rule.ConditionType == AlertConditionType.Below ? "žemiau" : "aukščiau";
            var localNow = AlertTime.ToVilnius(now);

            return $@"
<html>
  <body style=""font-family: Arial, sans-serif; background: #f7fafc; padding: 24px;"">
    <div style=""max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); overflow: hidden;"">
      <div style=""background: linear-gradient(120deg, #2563eb, #38bdf8); padding: 18px 24px; color: #fff;"">
        <h2 style=""margin:0; font-size: 20px;"">Weather Alert</h2>
        <p style=""margin:6px 0 0 0; font-size: 14px;"">{rule.City}</p>
      </div>
      <div style=""padding: 20px 24px; color: #1f2937;"">
        <p style=""margin-top:0;"">Buvo suaktyvintas orų perspėjimas.</p>
        <table style=""width:100%; border-collapse: collapse; margin: 12px 0;"">
          <tr>
            <td style=""padding:8px; font-weight:600; color:#4b5563;"">Dabartinė temperatūra</td>
            <td style=""padding:8px; text-align:right; color:#111827;"">{temp:F1}°C</td>
          </tr>
          <tr>
            <td style=""padding:8px; font-weight:600; color:#4b5563;"">Sąlyga</td>
            <td style=""padding:8px; text-align:right; color:#111827;"">{condition} {rule.ThresholdC:F1}°C</td>
          </tr>
          <tr>
            <td style=""padding:8px; font-weight:600; color:#4b5563;"">Laikas</td>
            <td style=""padding:8px; text-align:right; color:#111827;"">{localNow:yyyy-MM-dd HH:mm:ss} (Europe/Vilnius)</td>
          </tr>
        </table>
        <p style=""margin:12px 0 0 0; font-size: 14px; color:#4b5563;"">
          Galite koreguoti arba išjungti taisyklę prisijungę prie savo paskyros.
        </p>
      </div>
      <div style=""background:#f3f4f6; padding:12px 24px; font-size:12px; color:#6b7280;"">
        Weather Alerts · Automatizuotas pranešimas
      </div>
    </div>
  </body>
</html>";
        }

        public static string BuildDigestEmail(IEnumerable<DeliveryPayload> items, DateTime localNow)
        {
            var rowsBuilder = new StringBuilder();
            foreach (var item in items)
            {
                rowsBuilder.AppendLine($@"
              <tr>
                <td style=""padding:8px; border-bottom:1px solid #e5e7eb;"">{item.City}</td>
                <td style=""padding:8px; border-bottom:1px solid #e5e7eb;"">{item.ConditionType}</td>
                <td style=""padding:8px; border-bottom:1px solid #e5e7eb;"">{item.ThresholdC:F1}°C</td>
                <td style=""padding:8px; border-bottom:1px solid #e5e7eb;"">{item.Temperature:F1}°C</td>
                <td style=""padding:8px; border-bottom:1px solid #e5e7eb;"">{item.TriggeredAtLocal}</td>
              </tr>");
            }

            var rows = rowsBuilder.ToString();

            return $@"
<html>
  <body style=""font-family: Arial, sans-serif; background: #f7fafc; padding: 24px;"">
    <div style=""max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); overflow: hidden;"">
      <div style=""background: linear-gradient(120deg, #2563eb, #38bdf8); padding: 18px 24px; color: #fff;"">
        <h2 style=""margin:0; font-size: 20px;"">Dienos orų įspėjimų santrauka</h2>
        <p style=""margin:6px 0 0 0; font-size: 14px;"">{localNow:yyyy-MM-dd} (Europe/Vilnius)</p>
      </div>
      <div style=""padding: 20px 24px; color: #1f2937;"">
        <p style=""margin-top:0;"">Šiandien suveikė šios taisyklės:</p>
        <table style=""width:100%; border-collapse: collapse; font-size: 14px;"">
          <thead>
            <tr>
              <th style=""text-align:left; padding:8px; border-bottom:1px solid #e5e7eb;"">Miestas</th>
              <th style=""text-align:left; padding:8px; border-bottom:1px solid #e5e7eb;"">Sąlyga</th>
              <th style=""text-align:left; padding:8px; border-bottom:1px solid #e5e7eb;"">Slenkstis</th>
              <th style=""text-align:left; padding:8px; border-bottom:1px solid #e5e7eb;"">Temp</th>
              <th style=""text-align:left; padding:8px; border-bottom:1px solid #e5e7eb;"">Laikas</th>
            </tr>
          </thead>
          <tbody>
            {rows}
          </tbody>
        </table>
      </div>
      <div style=""background:#f3f4f6; padding:12px 24px; font-size:12px; color:#6b7280;"">
        Weather Alerts · Automatizuotas pranešimas
      </div>
    </div>
  </body>
</html>";
        }
    }
}
