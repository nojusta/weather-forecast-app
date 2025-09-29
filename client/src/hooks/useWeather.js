import { useState, useEffect } from "react";
import {
  getPlaces,
  getForecast,
  getCurrentWeather,
} from "../services/weatherService";
import { logCityView } from "../services/logService";

const useWeather = () => {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState(null);
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [mostViewedCities, setMostViewedCities] = useState([]);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        setLoading(true);
        const data = await getPlaces();
        setCities(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching cities:", error);
        setLoading(false);
      }
    };

    const loadMostViewedCities = () => {
      const savedCities = localStorage.getItem("mostViewedCities");
      if (savedCities) {
        setMostViewedCities(JSON.parse(savedCities));
      }
    };

    fetchCities();
    loadMostViewedCities();
  }, []);

  const handleCitySelect = async (city) => {
    setSelectedCity(city);

    logCityView(city.name);

    updateMostViewedCities(city);

    try {
      setLoading(true);
      const weatherData = await getCurrentWeather(city.code);
      setCurrentWeather(weatherData);

      const forecastData = await getForecast(city.code);
      setForecast(forecastData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching weather data:", error);
      setLoading(false);
    }
  };

  const updateMostViewedCities = (city) => {
    const updatedCities = [
      city,
      ...mostViewedCities.filter((c) => c.code !== city.code),
    ].slice(0, 3);

    setMostViewedCities(updatedCities);
    localStorage.setItem("mostViewedCities", JSON.stringify(updatedCities));
  };

  return {
    cities,
    loading,
    selectedCity,
    currentWeather,
    forecast,
    mostViewedCities,
    handleCitySelect,
  };
};

export default useWeather;
