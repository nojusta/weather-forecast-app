import Layout from "./components/Layout";
import CitySearch from "./components/CitySearch";
import CurrentWeather from "./components/CurrentWeather";
import ForecastDisplay from "./components/ForecastDisplay";
import useWeather from "./hooks/useWeather";

function App() {
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
    </Layout>
  );
}

export default App;
