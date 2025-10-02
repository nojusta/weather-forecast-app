import Layout from "./components/Layout";
import CitySearch from "./components/CitySearch";
import CurrentWeather from "./components/CurrentWeather";
import ForecastDisplay from "./components/ForecastDisplay";
import LoginRegister from "./components/LoginRegister";
import useWeather from "./hooks/useWeather";
import useAuthState from "./hooks/useAuthState";

function App() {
  const {
    isAuthenticated,
    isGuest,
    handleLoginSuccess,
    handleGuestAccess,
    handleLogout,
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
      {!isAuthenticated && !isGuest ? (
        <LoginRegister
          onLoginSuccess={handleLoginSuccess}
          onGuestAccess={handleGuestAccess}
        />
      ) : (
        <>
          <div className="flex justify-end mb-4">
            <button
              onClick={handleLogout}
              className="bg-gradient-to-r from-blue-500 to-sky-500 text-white px-6 py-2 rounded-full font-medium hover:from-blue-600 hover:to-sky-600 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Logout
            </button>
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
