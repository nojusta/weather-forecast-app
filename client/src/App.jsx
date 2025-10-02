import { useState, useEffect } from "react";
import Layout from "./components/Layout";
import CitySearch from "./components/CitySearch";
import CurrentWeather from "./components/CurrentWeather";
import ForecastDisplay from "./components/ForecastDisplay";
import LoginRegister from "./components/LoginRegister";
import useWeather from "./hooks/useWeather";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [user, setUser] = useState(null);
  const {
    cities,
    loading,
    selectedCity,
    currentWeather,
    forecast,
    mostViewedCities,
    handleCitySelect,
  } = useWeather();

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
    5e80;
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

  return (
    <Layout>
      {!isAuthenticated && !isGuest ? (
        <LoginRegister
          onLoginSuccess={handleLoginSuccess}
          onGuestAccess={handleGuestAccess}
        />
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            {isAuthenticated && (
              <>
                <h2 className="text-xl font-bold text-blue-500">
                  Welcome, {user?.username}!
                </h2>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Logout
                </button>
              </>
            )}
          </div>
          <CitySearch
            cities={cities}
            loading={loading}
            onSelectCity={handleCitySelect}
            mostViewedCities={mostViewedCities}
          />
          {selectedCity && currentWeather && (
            <CurrentWeather data={currentWeather} />
          )}
          {selectedCity && forecast && <ForecastDisplay data={forecast} />}
          {isGuest && (
            <div className="mt-6 text-center text-gray-600">
              <p>
                You are using the app as a guest. Log in to save your favorite
                cities and access more features.
              </p>
            </div>
          )}
        </>
      )}
    </Layout>
  );
}

export default App;
