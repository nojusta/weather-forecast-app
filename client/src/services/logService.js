import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5053";

export const logCityView = async (cityName) => {
  try {
    await axios.post(`${API_URL}/api/log`, {
      city: cityName,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to log city view:", error);
  }
};

export const getUserHistory = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/log/history`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch user history:", error);
    return [];
  }
};
