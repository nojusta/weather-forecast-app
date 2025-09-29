import PropTypes from "prop-types";
import {
  getConditionName,
  groupForecastsByDay,
  formatDate,
} from "../utils/forecastUtils";

const ForecastDisplay = ({ data }) => {
  if (!data || !data.forecastTimestamps) return null;

  const dailyForecasts = groupForecastsByDay(data.forecastTimestamps);

  const fiveDayForecast = Object.values(dailyForecasts).slice(0, 5);

  return (
    <div className="max-w-4xl mx-auto mb-8">
      <h2 className="font-bold text-xl mb-4 text-gray-900">5-Day Forecast</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {fiveDayForecast.map((forecast, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-md overflow-hidden"
          >
            <div className="bg-blue-200 py-2 px-4 border-b border-blue-200">
              <div className="text-center font-semibold text-blue-900">
                {formatDate(forecast.forecastTimeUtc)}
              </div>
            </div>

            <div className="p-4 text-center">
              <div className="text-3xl font-bold mb-2 text-gray-900">
                {Math.round(forecast.airTemperature)}°C
              </div>
              <div className="text-gray-800 mb-3 font-medium">
                {getConditionName(forecast.conditionCode)}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-gray-100 p-2 rounded">
                  <span className="block text-gray-700 mb-1">Wind</span>
                  <span className="font-semibold text-gray-900">
                    {forecast.windSpeed} m/s
                  </span>
                </div>
                <div className="bg-gray-100 p-2 rounded">
                  <span className="block text-gray-700 mb-1">Humidity</span>
                  <span className="font-semibold text-gray-900">
                    {forecast.relativeHumidity}%
                  </span>
                </div>
                <div className="bg-gray-100 p-2 rounded col-span-2">
                  <span className="block text-gray-700 mb-1">
                    Precipitation
                  </span>
                  <span className="font-semibold text-gray-900">
                    {forecast.totalPrecipitation} mm
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

ForecastDisplay.propTypes = {
  data: PropTypes.shape({
    forecastTimestamps: PropTypes.array.isRequired,
  }).isRequired,
};

export default ForecastDisplay;
