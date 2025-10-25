import { useCallback, useEffect, useState } from "react";
import Layout from "./components/Layout";
import CitySearch from "./components/CitySearch";
import CurrentWeather from "./components/CurrentWeather";
import ForecastDisplay from "./components/ForecastDisplay";
import LoginRegister from "./components/LoginRegister";
import UserMenu from "./components/UserMenu";
import HistoryModal from "./components/HistoryModal";
import StatsModal from "./components/StatsModal";
import useWeather from "./hooks/useWeather";
import useAuthState from "./hooks/useAuthState";
import {
  getUserHistory,
  getTopCities,
  getTemperatureExtremes,
} from "./services/logService";

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

  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [statsModalOpen, setStatsModalOpen] = useState(false);
  const [historyState, setHistoryState] = useState({
    entries: [],
    loading: false,
    error: "",
  });
  const [statsState, setStatsState] = useState({
    topCities: [],
    extremes: null,
    loading: false,
    error: "",
  });

  const {
    cities,
    loading,
    selectedCity,
    currentWeather,
    forecast,
    mostViewedCities,
    handleCitySelect,
  } = useWeather();

  const loadHistory = useCallback(async () => {
    setHistoryState((prev) => ({ ...prev, loading: true, error: "" }));
    const result = await getUserHistory({ limit: 100 });

    if (result === null) {
      setHistoryState({
        entries: [],
        loading: false,
        error: "Unable to load history. Please try again.",
      });
      return;
    }

    setHistoryState({
      entries: result,
      loading: false,
      error: "",
    });
  }, []);

  const loadStats = useCallback(async () => {
    setStatsState((prev) => ({ ...prev, loading: true, error: "" }));

    const [topCitiesResult, extremesResult] = await Promise.all([
      getTopCities({ limit: 5 }),
      getTemperatureExtremes(),
    ]);

    if (topCitiesResult === null && extremesResult === null) {
      setStatsState({
        topCities: [],
        extremes: null,
        loading: false,
        error: "Unable to load stats. Please try again.",
      });
      return;
    }

    const errors = [];
    if (topCitiesResult === null) {
      errors.push("top cities");
    }
    if (extremesResult === null) {
      errors.push("temperature extremes");
    }

    setStatsState({
      topCities: topCitiesResult ?? [],
      extremes: extremesResult,
      loading: false,
      error:
        errors.length > 0
          ? `Unable to load ${errors.join(" & ")} right now.`
          : "",
    });
  }, []);

  const handleOpenHistory = () => {
    setHistoryModalOpen(true);
    loadHistory();
  };

  const handleOpenStats = () => {
    setStatsModalOpen(true);
    loadStats();
  };

  const handleCloseHistory = () => setHistoryModalOpen(false);
  const handleCloseStats = () => setStatsModalOpen(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setHistoryModalOpen(false);
      setStatsModalOpen(false);
      setHistoryState({ entries: [], loading: false, error: "" });
      setStatsState({ topCities: [], extremes: null, loading: false, error: "" });
    }
  }, [isAuthenticated]);

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
            onOpenHistory={handleOpenHistory}
            onOpenStats={handleOpenStats}
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

      <HistoryModal
        isOpen={historyModalOpen}
        onClose={handleCloseHistory}
        entries={historyState.entries}
        loading={historyState.loading}
        error={historyState.error}
        onRefresh={loadHistory}
      />
      <StatsModal
        isOpen={statsModalOpen}
        onClose={handleCloseStats}
        topCities={statsState.topCities}
        extremes={statsState.extremes}
        loading={statsState.loading}
        error={statsState.error}
        onRefresh={loadStats}
      />
    </Layout>
  );
}

export default App;
