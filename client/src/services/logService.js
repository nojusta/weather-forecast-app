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

export const logCityView = async ({
  city,
  timestamp,
  temperatureC,
  feelsLikeC,
  conditions,
}) => {
  const authConfig = buildAuthConfig();

  if (!authConfig) {
    return;
  }

  try {
    await axios.post(
      `${API_URL}/api/log`,
      {
        city,
        timestamp: timestamp ?? new Date().toISOString(),
        temperatureC,
        feelsLikeC,
        conditions,
      },
      authConfig
    );
  } catch (error) {
    console.error("Failed to log city view:", error);
  }
};

export const getUserHistory = async (options = {}) => {
  const authConfig = buildAuthConfig();

  if (!authConfig) {
    return null;
  }

  try {
    const response = await axios.get(`${API_URL}/api/log/history`, {
      ...authConfig,
      params: {
        limit: options.limit,
        sort: options.sort,
        from: options.from,
        to: options.to,
        city: options.city,
      },
    });
    return response.data ?? [];
  } catch (error) {
    console.error("Failed to fetch user history:", error);
    return null;
  }
};

export const getTopCities = async ({ limit = 5, from, to } = {}) => {
  const authConfig = buildAuthConfig();

  if (!authConfig) {
    return null;
  }

  try {
    const response = await axios.get(`${API_URL}/api/log/top-cities`, {
      ...authConfig,
      params: {
        take: limit,
        from,
        to,
      },
    });

    return response.data ?? [];
  } catch (error) {
    console.error("Failed to fetch top cities:", error);
    return null;
  }
};

export const getTemperatureExtremes = async ({ from, to } = {}) => {
  const authConfig = buildAuthConfig();

  if (!authConfig) {
    return null;
  }

  try {
    const response = await axios.get(`${API_URL}/api/log/extremes`, {
      ...authConfig,
      params: {
        from,
        to,
      },
    });

    if (!response.data || Object.keys(response.data).length === 0) {
      return null;
    }

    return response.data;
  } catch (error) {
    if (error.response?.status === 204) {
      return null;
    }

    console.error("Failed to fetch temperature extremes:", error);
    return null;
  }
};
