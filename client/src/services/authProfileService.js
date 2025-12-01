import axios from "axios";
import { buildAuthConfig, getApiUrl } from "./apiClient";

const API_URL = getApiUrl();

export const changePassword = async ({ currentPassword, newPassword }) => {
  const config = buildAuthConfig();
  if (!config) return { ok: false, error: "Not authenticated" };

  try {
    await axios.post(
      `${API_URL}/api/auth/change-password`,
      { currentPassword, newPassword },
      config
    );
    return { ok: true };
  } catch (error) {
    const message =
      error.response?.data?.error || "Unable to change password";
    return { ok: false, error: message };
  }
};
