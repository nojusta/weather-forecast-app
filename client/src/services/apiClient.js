const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5053";

export const getApiUrl = () => API_URL;

export const getAuthToken = () => {
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

export const buildAuthConfig = () => {
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

export default API_URL;
