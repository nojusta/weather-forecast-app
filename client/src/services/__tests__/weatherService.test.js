import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getPlaces, getForecast, getCurrentWeather } from '../weatherService';
import axios from 'axios';

// Mock axios
vi.mock('axios');

describe('Weather Service', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('handles API errors gracefully', async () => {
    // Mock a network error
    axios.get.mockRejectedValueOnce(new Error('Network Error'));
    
    await expect(getForecast('vilnius')).rejects.toThrow('Network Error');
  });
  
  it('handles empty or malformed responses', async () => {
    axios.get.mockResolvedValueOnce({ 
      data: { 
        place: { code: 'vilnius', name: 'Vilnius' },
        forecastTimestamps: [] 
      } 
    });
    
    const result = await getCurrentWeather('vilnius');
    expect(result.place.name).toBe('Vilnius');
    expect(result.currentWeather).toBeUndefined();
  });
});