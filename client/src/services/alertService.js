import axios from "axios";
import { buildAuthConfig, getApiUrl } from "./apiClient";

const API_URL = getApiUrl();

const authConfigOrNull = () => {
  const config = buildAuthConfig();
  if (!config) {
    return null;
  }
  return config;
};

export const getAlerts = async () => {
  const config = authConfigOrNull();
  if (!config) return null;

  try {
    const response = await axios.get(`${API_URL}/api/alerts`, config);
    return response.data ?? [];
  } catch (error) {
    console.error("Failed to fetch alerts:", error);
    return null;
  }
};

export const createAlert = async (payload) => {
  const config = authConfigOrNull();
  if (!config) return null;

  try {
    const response = await axios.post(`${API_URL}/api/alerts`, payload, config);
    return response.data;
  } catch (error) {
    console.error("Failed to create alert:", error);
    return null;
  }
};

export const updateAlert = async (id, payload) => {
  const config = authConfigOrNull();
  if (!config) return false;

  try {
    await axios.put(`${API_URL}/api/alerts/${id}`, payload, config);
    return true;
  } catch (error) {
    console.error("Failed to update alert:", error);
    return false;
  }
};

export const deleteAlert = async (id) => {
  const config = authConfigOrNull();
  if (!config) return false;

  try {
    await axios.delete(`${API_URL}/api/alerts/${id}`, config);
    return true;
  } catch (error) {
    console.error("Failed to delete alert:", error);
    return false;
  }
};

export const getAlertDeliveries = async (take = 20) => {
  const config = authConfigOrNull();
  if (!config) return null;

  try {
    const response = await axios.get(`${API_URL}/api/alerts/deliveries`, {
      ...config,
      params: { take },
    });
    return response.data ?? [];
  } catch (error) {
    console.error("Failed to fetch alert deliveries:", error);
    return null;
  }
};

export const getAlertStats = async () => {
  const config = authConfigOrNull();
  if (!config) return null;

  try {
    const response = await axios.get(`${API_URL}/api/alerts/stats`, config);
    return response.data ?? null;
  } catch (error) {
    console.error("Failed to fetch alert stats:", error);
    return null;
  }
};

export const runDigestNow = async () => {
  const config = authConfigOrNull();
  if (!config) return false;

  try {
    await axios.post(`${API_URL}/api/alerts/digest/run-now`, {}, config);
    return true;
  } catch (error) {
    console.error("Failed to run digest now:", error);
    return false;
  }
};
