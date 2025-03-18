import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const CitySearch = ({ cities, loading, onSelectCity, mostViewedCities }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCities, setFilteredCities] = useState([]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCities([]);
      return;
    }

    const filtered = cities.filter(city => 
      city.name.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 10); // Limit results
    
    setFilteredCities(filtered);
  }, [searchTerm, cities]);

  return (
    <div className="max-w-md mx-auto mb-8">
      <div className="relative">
        <label htmlFor="city-search" className="block text-sm font-medium text-gray-700 mb-2">
          Search for a location
        </label>
        <div className="relative">
          <input
            id="city-search"
            type="text"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            placeholder="Type to search for a city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={loading}
          />
          {loading && (
            <div className="absolute right-3 top-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>
        
        {/* Search results dropdown */}
        {filteredCities.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
            {filteredCities.map(city => (
              <button
                key={city.code}
                className="block w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-100 last:border-b-0"
                onClick={() => {
                  onSelectCity(city);
                  setSearchTerm('');
                  setFilteredCities([]);
                }}
              >
                <span className="font-medium">{city.name}</span>
                <span className="text-gray-500 text-sm ml-2">({city.administrativeDivision})</span>
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Most viewed cities */}
      {mostViewedCities.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Most viewed locations:</h3>
          <div className="flex flex-wrap gap-2">
            {mostViewedCities.map(city => (
              <button
                key={city.code}
                className="px-3 py-1.5 bg-blue-100 text-blue-800 hover:bg-blue-200 rounded-full text-sm transition-colors"
                onClick={() => onSelectCity(city)}
              >
                {city.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

CitySearch.propTypes = {
  cities: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
  onSelectCity: PropTypes.func.isRequired,
  mostViewedCities: PropTypes.array.isRequired
};

export default CitySearch;