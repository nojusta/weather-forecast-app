import { useState, useEffect } from "react";
import useDebounce from "./useDebounce";

interface City {
  name: string;
  code: string;
}

const useFilteredCities = (cities: City[], searchTerm: string): City[] => {
  const [filteredCities, setFilteredCities] = useState<City[]>([]);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    if (debouncedSearchTerm.trim() === "") {
      setFilteredCities([]);
      return;
    }

    const filtered = cities
      .filter((city) =>
        city.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      )
      .slice(0, 10);

    setFilteredCities(filtered);
  }, [debouncedSearchTerm, cities]);

  return filteredCities;
};

export default useFilteredCities;
