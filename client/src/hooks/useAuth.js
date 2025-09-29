import { useState } from "react";

const useAuth = (onLoginSuccess) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const endpoint = isLogin
      ? "http://localhost:5053/api/auth/login"
      : "http://localhost:5053/api/auth/register";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      if (isLogin) {
        onLoginSuccess(data.token, data.username, data.email);
      } else {
        alert("Registration successful! Please log in.");
        setIsLogin(true);
      }
    } catch {
      setError("Failed to connect to the server.");
    }
  };

  return {
    isLogin,
    setIsLogin,
    formData,
    error,
    handleInputChange,
    handleSubmit,
  };
};

export default useAuth;
