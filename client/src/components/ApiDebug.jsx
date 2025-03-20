// Unused component for testing the API
import { useState } from 'react';
import { getPlaces } from '../services/weatherService';

const ApiDebug = () => {
  const [cities, setCities] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const testApi = async () => {
    try {
      setLoading(true);
      console.log('Testing API...');
      const data = await getPlaces();
      console.log('Got data:', data);
      setCities(data.slice(0, 5));
      setError(null);
      setLoading(false);
    } catch (err) {
      console.error('API error:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mb-8 p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
      <h2 className="font-bold text-lg mb-4">API Testing</h2>
      
      <button 
        onClick={testApi}
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
        disabled={loading}
      >
        {loading ? 'Loading...' : 'Test Weather API'}
      </button>
      
      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-100">
          Error: {error}
        </div>
      )}
      
      {cities && (
        <div className="mt-4">
          <h3 className="font-semibold mb-2">First 5 cities:</h3>
          <ul className="list-disc pl-5 space-y-1">
            {cities.map(city => (
              <li key={city.code} className="text-gray-700">
                {city.name} - {city.administrativeDivision}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ApiDebug;