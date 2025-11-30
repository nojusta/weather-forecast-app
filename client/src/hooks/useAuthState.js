import { useState, useEffect, useCallback } from "react";
import { getApiUrl, getAuthToken } from "../services/apiClient";

const API_URL = getApiUrl();

const useAuthState = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [user, setUser] = useState(null);
  const [showLoginRegister, setShowLoginRegister] = useState(false);

  const verifyToken = useCallback(async () => {
    const token = getAuthToken();
    if (!token) return false;

    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Invalid token");
      }

      const data = await response.json();
      setIsAuthenticated(true);
      setIsGuest(false);
      setUser({ username: data.username, email: data.email });
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("user", JSON.stringify({ username: data.username, email: data.email }));
      setShowLoginRegister(false);
      return true;
    } catch {
      setIsAuthenticated(false);
      setIsGuest(false);
      setUser(null);
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("user");
      localStorage.removeItem("authToken");
      return false;
    }
  }, []);

  useEffect(() => {
    (async () => {
      const verified = await verifyToken();
      if (verified) return;

      const storedGuest = localStorage.getItem("isGuest") === "true";
      if (storedGuest) {
        setIsGuest(true);
        setIsAuthenticated(false);
        setShowLoginRegister(false);
        return;
      }
      setShowLoginRegister(true);
    })();
  }, [verifyToken]);

  const handleLoginSuccess = (token, username, email) => {
    setIsAuthenticated(true);
    setIsGuest(false);
    setUser({ username, email });
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("isGuest", "false");
    localStorage.setItem("user", JSON.stringify({ username, email }));
    localStorage.setItem("authToken", token);
    setShowLoginRegister(false);
  };

  const handleGuestAccess = () => {
    setIsGuest(true);
    setIsAuthenticated(false);
    localStorage.setItem("isGuest", "true");
    localStorage.setItem("isAuthenticated", "false");
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
    setShowLoginRegister(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsGuest(false);
    setUser(null);
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("isGuest");
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
  };

  const toggleLoginRegister = () => {
    setShowLoginRegister((prev) => !prev);
  };

  return {
    isAuthenticated,
    isGuest,
    user,
    showLoginRegister,
    handleLoginSuccess,
    handleGuestAccess,
    handleLogout,
    toggleLoginRegister,
  };
};

export default useAuthState;
