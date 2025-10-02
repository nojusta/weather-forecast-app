import { useState, useEffect } from "react";

const useAuthState = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedAuth = localStorage.getItem("isAuthenticated") === "true";
    const storedGuest = localStorage.getItem("isGuest") === "true";
    const storedUser = JSON.parse(localStorage.getItem("user"));

    setIsAuthenticated(storedAuth);
    setIsGuest(storedGuest);
    setUser(storedUser);
  }, []);

  const handleLoginSuccess = (token, username, email) => {
    setIsAuthenticated(true);
    setIsGuest(false);
    setUser({ username, email });
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("isGuest", "false");
    localStorage.setItem("user", JSON.stringify({ username, email }));
    localStorage.setItem("authToken", token);
  };

  const handleGuestAccess = () => {
    setIsGuest(true);
    setIsAuthenticated(false);
    localStorage.setItem("isGuest", "true");
    localStorage.setItem("isAuthenticated", "false");
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
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

  return {
    isAuthenticated,
    isGuest,
    user,
    handleLoginSuccess,
    handleGuestAccess,
    handleLogout,
  };
};

export default useAuthState;
