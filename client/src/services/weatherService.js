import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5053";

export const getPlaces = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/weather/places`);
    return response.data;
  } catch (error) {
    console.error("Error details:", error.response || error.message);
    throw error;
  }
};

export const getForecast = async (placeCode) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/weather/places/${placeCode}/forecasts/long-term`
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching forecast for ${placeCode}:`, error);
    throw error;
  }
};

// move-BE
export const getCurrentWeather = async (placeCode) => {
  try {
    const forecast = await getForecast(placeCode);

    const currentTime = new Date().toISOString();
    const forecastTimestamps = forecast.forecastTimestamps;

    const currentWeather = forecastTimestamps.reduce((closest, current) => {
      const closestDiff = Math.abs(
        new Date(closest.forecastTimeUtc) - new Date(currentTime)
      );
      const currentDiff = Math.abs(
        new Date(current.forecastTimeUtc) - new Date(currentTime)
      );
      return currentDiff < closestDiff ? current : closest;
    }, forecastTimestamps[0]);

    return {
      place: forecast.place,
      currentWeather,
    };
  } catch (error) {
    console.error(`Error fetching current weather for ${placeCode}:`, error);
    throw error;
  }
};
