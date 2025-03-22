import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logCityView } from '../logService';
import axios from 'axios';

// Mock axios
vi.mock('axios');

describe('Log Service', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // Mock console.error to prevent test output clutter
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  describe('logCityView', () => {
    it('should log city view successfully', async () => {
      // Mock successful response
      axios.post.mockResolvedValueOnce({ data: { success: true } });
      
      await logCityView('Vilnius');
      
      // Verify axios was called with correct arguments
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/log'),
        expect.objectContaining({
          city: 'Vilnius',
          timestamp: expect.any(String)
        })
      );
    });

    it('should handle errors gracefully', async () => {
      // Mock network error
      axios.post.mockRejectedValueOnce(new Error('Network Error'));
      
      // Function should not throw but handle error internally
      await expect(logCityView('Vilnius')).resolves.not.toThrow();
      
      // Verify error was logged
      expect(console.error).toHaveBeenCalled();
    });
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });
});