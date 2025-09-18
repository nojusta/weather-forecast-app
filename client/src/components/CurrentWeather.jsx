import PropTypes from "prop-types";

const CurrentWeather = ({ data }) => {
  if (!data || !data.currentWeather) return null;

  const { place, currentWeather } = data;

  const dateTime = new Date(currentWeather.forecastTimeUtc);
  const formattedTime = dateTime.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const formattedDate = dateTime.toLocaleDateString([], {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="max-w-md mx-auto mb-8">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-sky-500 text-white px-6 py-5">
          <h2 className="font-bold text-2xl">{place.name}</h2>
          <p className="text-white opacity-90">
            {place.administrativeDivision}
          </p>
          <p className="text-sm mt-1 text-white opacity-85">
            {formattedDate} • {formattedTime}
          </p>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-5xl font-bold">
                {Math.round(currentWeather.airTemperature)}°C
              </div>
              <div className="text-gray-600 mt-1">
                Feels like {Math.round(currentWeather.feelsLikeTemperature)}°C
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-medium mb-1">
                {getConditionName(currentWeather.conditionCode)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-100 p-3 rounded-lg">
              <p className="text-gray-600 text-sm mb-1">Wind</p>
              <p className="font-medium text-gray-900">
                {currentWeather.windSpeed} m/s
              </p>
              <p className="text-sm text-gray-600">
                Direction: {getWindDirection(currentWeather.windDirection)}
              </p>
            </div>
            <div className="bg-gray-100 p-3 rounded-lg">
              <p className="text-gray-600 text-sm mb-1">Humidity</p>
              <p className="font-medium text-gray-900">
                {currentWeather.relativeHumidity}%
              </p>
            </div>
            <div className="bg-gray-100 p-3 rounded-lg">
              <p className="text-gray-600 text-sm mb-1">Pressure</p>
              <p className="font-medium text-gray-900">
                {currentWeather.seaLevelPressure} hPa
              </p>
            </div>
            <div className="bg-gray-100 p-3 rounded-lg">
              <p className="text-gray-600 text-sm mb-1">Cloud Cover</p>
              <p className="font-medium text-gray-900">
                {currentWeather.cloudCover}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const getWindDirection = (degrees) => {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
};

const getConditionName = (code) => {
  const conditions = {
    clear: "Clear",
    "partly-cloudy": "Partly Cloudy",
    "cloudy-with-sunny-intervals": "Cloudy with Sunny Intervals",
    cloudy: "Cloudy",
    "light-rain": "Light Rain",
    rain: "Rain",
    "heavy-rain": "Heavy Rain",
    thunder: "Thunder",
    "isolated-thunderstorms": "Isolated Thunderstorms",
    thunderstorms: "Thunderstorms",
    "heavy-rain-with-thunderstorms": "Heavy Rain with Thunderstorms",
    "light-sleet": "Light Sleet",
    sleet: "Sleet",
    "freezing-rain": "Freezing Rain",
    hail: "Hail",
    "light-snow": "Light Snow",
    snow: "Snow",
    "heavy-snow": "Heavy Snow",
    fog: "Fog",
  };

  return conditions[code] || "Unknown";
};

CurrentWeather.propTypes = {
  data: PropTypes.shape({
    place: PropTypes.object.isRequired,
    currentWeather: PropTypes.object.isRequired,
  }).isRequired,
};

export default CurrentWeather;
