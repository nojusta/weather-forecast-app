import { useState } from "react";
import Layout from "./components/Layout";
import CitySearch from "./components/CitySearch";
import CurrentWeather from "./components/CurrentWeather";
import ForecastDisplay from "./components/ForecastDisplay";
import LoginRegister from "./components/LoginRegister";
import UserMenu from "./components/UserMenu";
import HistoryModal from "./components/HistoryModal";
import StatsModal from "./components/StatsModal";
import AlertsModal from "./components/AlertsModal";
import useWeather from "./hooks/useWeather";
import useAuthState from "./hooks/useAuthState";
import useUserInsights from "./hooks/useUserInsights";
import useAlerts from "./hooks/useAlerts";

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
  const {
    historyModalOpen,
    statsModalOpen,
    historyState,
    statsState,
    openHistory,
    openStats,
    closeHistory,
    closeStats,
    refreshHistory,
    refreshStats,
  } = useUserInsights(isAuthenticated);
  const {
    items: alertItems,
    deliveries: alertDeliveries,
    stats: alertStats,
    loading: alertsLoading,
    error: alertsError,
    create: createAlert,
    update: updateAlert,
    remove: deleteAlert,
    reload: reloadAlerts,
  } = useAlerts(isAuthenticated);
  const [alertsModalOpen, setAlertsModalOpen] = useState(false);

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
            onOpenHistory={openHistory}
            onOpenStats={openStats}
            onOpenAlerts={() => setAlertsModalOpen(true)}
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
        onClose={closeHistory}
        entries={historyState.entries}
        loading={historyState.loading}
        error={historyState.error}
        onRefresh={refreshHistory}
      />
      <StatsModal
        isOpen={statsModalOpen}
        onClose={closeStats}
        topCities={statsState.topCities}
        extremes={statsState.extremes}
        loading={statsState.loading}
        error={statsState.error}
        onRefresh={refreshStats}
      />
      <AlertsModal
        isOpen={alertsModalOpen}
        onClose={() => setAlertsModalOpen(false)}
        alerts={alertItems}
        deliveries={alertDeliveries}
        stats={alertStats}
        loading={alertsLoading}
        error={alertsError}
        cities={cities}
        onCreate={createAlert}
        onUpdate={(id, payload) =>
          updateAlert(id, {
            city: payload.city,
            placeCode: payload.placeCode,
            conditionType: payload.conditionType,
            thresholdC: payload.thresholdC,
            active: payload.active,
          })
        }
        onDelete={deleteAlert}
        onRefresh={reloadAlerts}
        selectedCity={selectedCity}
      />
    </Layout>
  );
}

export default App;
