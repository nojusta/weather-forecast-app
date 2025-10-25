import Layout from "./components/Layout";
import CitySearch from "./components/CitySearch";
import CurrentWeather from "./components/CurrentWeather";
import ForecastDisplay from "./components/ForecastDisplay";
import LoginRegister from "./components/LoginRegister";
import UserMenu from "./components/UserMenu";
import useWeather from "./hooks/useWeather";
import useAuthState from "./hooks/useAuthState";

function App() {
  const {
    isAuthenticated,
    isGuest,
    showLoginRegister,
    handleLoginSuccess,
    handleGuestAccess,
    handleLogout,
    toggleLoginRegister,
  } = useAuthState();

  const {
    cities,
    loading,
    selectedCity,
    currentWeather,
    forecast,
    mostViewedCities,
    handleCitySelect,
  } = useWeather();

  return (
    <Layout>
      {!showLoginRegister && (
        <div className="absolute top-4 right-4">
          <UserMenu
            isAuthenticated={isAuthenticated}
            isGuest={isGuest}
            onLogout={() => {
              handleLogout();
              toggleLoginRegister();
            }}
            onLogin={toggleLoginRegister}
          />
        </div>
      )}

      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-blue-800">Weather Forecast</h1>
        <p className="text-gray-600 mt-2">
          Check current conditions and forecasts
        </p>
      </div>

      {showLoginRegister ? (
        <LoginRegister
          onLoginSuccess={handleLoginSuccess}
          onGuestAccess={handleGuestAccess}
        />
      ) : (
        <>
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
            <div className="mt-8 text-center text-gray-600">
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
