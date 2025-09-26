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
