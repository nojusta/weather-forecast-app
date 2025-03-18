import axios from 'axios';

const API_BASE_URL = 'https://api.meteo.lt/v1';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:50001';


// Get all available places/cities
export const getPlaces = async () => {
  try {
    console.log('Fetching places from API...');
    const response = await axios.get(`${API_URL}/api/weather/places`);
    console.log('API response status:', response.status);
    return response.data;
  } catch (error) {
    console.error('Error details:', error.response || error.message);
    throw error;
  }
};

// Get weather forecast for a specific place
export const getForecast = async (placeCode) => {
  try {
    const response = await axios.get(`${API_URL}/api/weather/places/${placeCode}/forecasts/long-term`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching forecast for ${placeCode}:`, error);
    throw error;
  }
};

// Get current weather conditions (latest timestamp from forecast data)
export const getCurrentWeather = async (placeCode) => {
  try {
      const forecast = await getForecast(placeCode);
    // Get current/nearest timestamp data
    const currentTime = new Date().toISOString();
    const forecastTimestamps = forecast.forecastTimestamps;
    
    // Find the closest timestamp to current time
    const currentWeather = forecastTimestamps.reduce((closest, current) => {
      const closestDiff = Math.abs(new Date(closest.forecastTimeUtc) - new Date(currentTime));
      const currentDiff = Math.abs(new Date(current.forecastTimeUtc) - new Date(currentTime));
      return currentDiff < closestDiff ? current : closest;
    }, forecastTimestamps[0]);
    
    return {
      place: forecast.place,
      currentWeather
    };
  } catch (error) {
    console.error(`Error fetching current weather for ${placeCode}:`, error);
    throw error;
  }
};