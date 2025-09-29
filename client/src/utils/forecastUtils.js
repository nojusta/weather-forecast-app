// move-BE

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

export const groupForecastsByDay = (forecasts) => {
  const days = {};

  forecasts.forEach((forecast) => {
    const date = new Date(forecast.forecastTimeUtc);
    const dayKey = date.toISOString().split("T")[0];
    const hour = date.getHours();

    if (!days[dayKey] || (hour >= 12 && hour <= 14)) {
      days[dayKey] = forecast;
    }
  });

  return days;
};

export const getConditionName = (code) => {
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
