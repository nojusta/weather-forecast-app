import { useState, useEffect } from "react";

const useAuthState = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [user, setUser] = useState(null);
  const [showLoginRegister, setShowLoginRegister] = useState(false);

  useEffect(() => {
    const storedAuth = localStorage.getItem("isAuthenticated") === "true";
    const storedGuest = localStorage.getItem("isGuest") === "true";
    const storedUser = JSON.parse(localStorage.getItem("user"));

    setIsAuthenticated(storedAuth);
    setIsGuest(storedGuest);
    setUser(storedUser);

    if (!storedAuth && !storedGuest) {
      setShowLoginRegister(true);
    }
  }, []);

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
