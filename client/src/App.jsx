import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import CitySearch from './components/CitySearch';
import CurrentWeather from './components/CurrentWeather';
import ForecastDisplay from './components/ForecastDisplay';
import { getPlaces, getCurrentWeather, getForecast } from './services/weatherService';
import { logCityView } from './services/logService';
import ApiDebug from './components/ApiDebug';

function App() {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState(null);
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [mostViewedCities, setMostViewedCities] = useState([]);

  // Fetch cities on component mount
  useEffect(() => {
    const fetchCities = async () => {
      try {
        setLoading(true);
        const data = await getPlaces();
        setCities(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching cities:', error);
        setLoading(false);
      }
    };

    // Load most viewed cities from localStorage
    const loadMostViewedCities = () => {
      const savedCities = localStorage.getItem('mostViewedCities');
      if (savedCities) {
        setMostViewedCities(JSON.parse(savedCities));
      }
    };

    fetchCities();
    loadMostViewedCities();
  }, []);

  const handleCitySelect = async (city) => {
    setSelectedCity(city);
    
    // Log city selection
    logCityView(city.name);
    
    // Update most viewed cities
    updateMostViewedCities(city);
    
    // Fetch weather data
    try {
      setLoading(true);
      const weatherData = await getCurrentWeather(city.code);
      setCurrentWeather(weatherData);
      
      const forecastData = await getForecast(city.code);
      setForecast(forecastData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      setLoading(false);
    }
  };
  
  const updateMostViewedCities = (city) => {
    // Add current city to most viewed, keep only top 3
    const updatedCities = [
      city,
      ...mostViewedCities.filter(c => c.code !== city.code),
    ].slice(0, 3);
    
    setMostViewedCities(updatedCities);
    localStorage.setItem('mostViewedCities', JSON.stringify(updatedCities));
  };

  return (
    <Layout>
      {//<ApiDebug />
      }
      <CitySearch 
        cities={cities} 
        loading={loading}
        onSelectCity={handleCitySelect} 
        mostViewedCities={mostViewedCities} 
      />
      
      {selectedCity && currentWeather && (
        <CurrentWeather data={currentWeather} />
      )}
      
      {selectedCity && forecast && (
        <ForecastDisplay data={forecast} />
      )}
    </Layout>
  );
}

export default App;