import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5053";

const getAuthToken = () => {
  try {
    if (typeof localStorage === "undefined") {
      return null;
    }

    return localStorage.getItem("authToken");
  } catch (error) {
    console.error("Unable to access auth token:", error);
    return null;
  }
};

const buildAuthConfig = () => {
  const token = getAuthToken();

  if (!token) {
    return null;
  }

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const logCityView = async (cityName) => {
  const authConfig = buildAuthConfig();

  if (!authConfig) {
    return;
  }

  try {
    await axios.post(
      `${API_URL}/api/log`,
      {
        city: cityName,
        timestamp: new Date().toISOString(),
      },
      authConfig
    );
  } catch (error) {
    console.error("Failed to log city view:", error);
  }
};

export const getUserHistory = async () => {
  const authConfig = buildAuthConfig();

  if (!authConfig) {
    return [];
  }

  try {
    const response = await axios.get(`${API_URL}/api/log/history`, authConfig);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch user history:", error);
    return [];
  }
};
