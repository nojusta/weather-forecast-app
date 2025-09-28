export const getWindDirection = (degrees) => {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
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