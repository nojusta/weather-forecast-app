import PropTypes from 'prop-types';

const ForecastDisplay = ({ data }) => {
  if (!data || !data.forecastTimestamps) return null;
  
  // Group forecast by day, keeping only one forecast per day (noon)
  const dailyForecasts = groupForecastsByDay(data.forecastTimestamps);
  
  // Take only 5 days
  const fiveDayForecast = Object.values(dailyForecasts).slice(0, 5);
  
  return (
    <div className="max-w-4xl mx-auto mb-8">
      <h2 className="font-bold text-xl mb-4 text-gray-800">5-Day Forecast</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {fiveDayForecast.map((forecast, index) => (
          <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="bg-blue-50 py-2 px-4 border-b border-blue-100">
              <div className="text-center font-medium text-blue-800">{formatDate(forecast.forecastTimeUtc)}</div>
            </div>
            
            <div className="p-4 text-center">
              <div className="text-3xl font-bold mb-2 text-gray-800">{Math.round(forecast.airTemperature)}°C</div>
              <div className="text-gray-700 mb-3">{getConditionName(forecast.conditionCode)}</div>
              
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div className="bg-gray-50 p-1 rounded">
                  <span className="block text-gray-500">Wind</span>
                  <span className="font-medium">{forecast.windSpeed} m/s</span>
                </div>
                <div className="bg-gray-50 p-1 rounded">
                  <span className="block text-gray-500">Humidity</span>
                  <span className="font-medium">{forecast.relativeHumidity}%</span>
                </div>
                <div className="bg-gray-50 p-1 rounded col-span-2">
                  <span className="block text-gray-500">Precipitation</span>
                  <span className="font-medium">{forecast.totalPrecipitation} mm</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Helper function to format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
};

// Helper function to group forecasts by day
const groupForecastsByDay = (forecasts) => {
  const days = {};
  
  forecasts.forEach(forecast => {
    const date = new Date(forecast.forecastTimeUtc);
    const dayKey = date.toISOString().split('T')[0];
    const hour = date.getHours();
    
    // Prefer forecasts around noon (12-14h)
    if (!days[dayKey] || (hour >= 12 && hour <= 14)) {
      days[dayKey] = forecast;
    }
  });
  
  return days;
};

// Helper function to convert condition codes to readable names
const getConditionName = (code) => {
  const conditions = {
    'clear': 'Clear',
    'partly-cloudy': 'Partly Cloudy',
    'cloudy-with-sunny-intervals': 'Cloudy with Sunny Intervals',
    'cloudy': 'Cloudy',
    'light-rain': 'Light Rain',
    'rain': 'Rain',
    'heavy-rain': 'Heavy Rain',
    'thunder': 'Thunder',
    'isolated-thunderstorms': 'Isolated Thunderstorms',
    'thunderstorms': 'Thunderstorms',
    'heavy-rain-with-thunderstorms': 'Heavy Rain with Thunderstorms',
    'light-sleet': 'Light Sleet',
    'sleet': 'Sleet',
    'freezing-rain': 'Freezing Rain',
    'hail': 'Hail',
    'light-snow': 'Light Snow',
    'snow': 'Snow',
    'heavy-snow': 'Heavy Snow',
    'fog': 'Fog',
  };
  
  return conditions[code] || 'Unknown';
};

ForecastDisplay.propTypes = {
  data: PropTypes.shape({
    forecastTimestamps: PropTypes.array.isRequired
  }).isRequired
};

export default ForecastDisplay;