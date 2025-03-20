import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import CitySearch from '../CitySearch';

describe('CitySearch Component', () => {
  const mockCities = [
    { code: 'vilnius', name: 'Vilnius', administrativeDivision: 'Vilniaus miesto savivaldybė' },
    { code: 'kaunas', name: 'Kaunas', administrativeDivision: 'Kaunas miesto savivaldybė' },
    { code: 'klaipeda', name: 'Klaipėda', administrativeDivision: 'Klaipėdos miesto savivaldybė' },
  ];
  
  const mockMostViewed = [
    { code: 'vilnius', name: 'Vilnius', administrativeDivision: 'Vilniaus miesto savivaldybė' },
    { code: 'palanga', name: 'Palanga', administrativeDivision: 'Palangos miesto savivaldybė' },
  ];
  
  const mockOnSelectCity = vi.fn();
  
  beforeEach(() => {
    mockOnSelectCity.mockClear();
  });
  
  it('renders the search input with correct label', () => {
    render(
      <CitySearch 
        cities={mockCities}
        loading={false}
        onSelectCity={mockOnSelectCity}
        mostViewedCities={[]}
      />
    );
    
    const searchInput = screen.getByPlaceholderText(/Type to search/i);
    expect(searchInput).toBeInTheDocument();
    
    const label = screen.getByText(/Search for a location/i);
    expect(label).toBeInTheDocument();
    expect(label.getAttribute('for')).toBe(searchInput.id);
  });
  
  it('shows loading indicator when loading is true', () => {
    render(
      <CitySearch 
        cities={mockCities}
        loading={true}
        onSelectCity={mockOnSelectCity}
        mostViewedCities={[]}
      />
    );
    
    const input = screen.getByPlaceholderText(/Type to search/i);
    expect(input).toBeDisabled();
    
    // Look for loading spinner element 
    const loadingIndicator = screen.getByRole('status');
    expect(loadingIndicator).toBeInTheDocument();
  });
  
  it('displays filtered cities when typing', () => {
    render(
      <CitySearch 
        cities={mockCities}
        loading={false}
        onSelectCity={mockOnSelectCity}
        mostViewedCities={[]}
      />
    );
    
    const input = screen.getByPlaceholderText(/Type to search/i);
    fireEvent.change(input, { target: { value: 'k' } });
    
    // Should show Kaunas and Klaipėda but not Vilnius
    expect(screen.getByText('Kaunas')).toBeInTheDocument();
    expect(screen.getByText('Klaipėda')).toBeInTheDocument();
    expect(screen.queryByText('Vilnius')).not.toBeInTheDocument();
  });
  
  it('limits the number of displayed cities', () => {
    // Create a large array of mock cities
    const manyCities = Array.from({ length: 20 }, (_, i) => ({
      code: `city-${i}`,
      name: `City ${i}`,
      administrativeDivision: 'Test County'
    }));
    
    render(
      <CitySearch 
        cities={manyCities}
        loading={false}
        onSelectCity={mockOnSelectCity}
        mostViewedCities={[]}
      />
    );
    
    const input = screen.getByPlaceholderText(/Type to search/i);
    fireEvent.change(input, { target: { value: 'city' } });
    
    // Should show maximum 10 cities
    const cityButtons = screen.getAllByRole('button', { name: /City \d/ });
    expect(cityButtons.length).toBeLessThanOrEqual(10);
  });
  
  it('calls onSelectCity with correct city when a city is clicked', () => {
    render(
      <CitySearch 
        cities={mockCities}
        loading={false}
        onSelectCity={mockOnSelectCity}
        mostViewedCities={[]}
      />
    );
    
    const input = screen.getByPlaceholderText(/Type to search/i);
    fireEvent.change(input, { target: { value: 'kau' } });
    
    const cityItem = screen.getByText('Kaunas');
    fireEvent.click(cityItem);
    
    expect(mockOnSelectCity).toHaveBeenCalledWith(mockCities[1]);
    expect(mockOnSelectCity).toHaveBeenCalledTimes(1);
  });
  
  it('clears search input and results after city selection', () => {
    render(
      <CitySearch 
        cities={mockCities}
        loading={false}
        onSelectCity={mockOnSelectCity}
        mostViewedCities={[]}
      />
    );
    
    const input = screen.getByPlaceholderText(/Type to search/i);
    fireEvent.change(input, { target: { value: 'kau' } });
    
    // Verify dropdown appears
    expect(screen.getByText('Kaunas')).toBeInTheDocument();
    
    // Click the city
    fireEvent.click(screen.getByText('Kaunas'));
    
    // Input should be cleared
    expect(input.value).toBe('');
    
    // Dropdown should disappear
    expect(screen.queryByText('Kaunas')).not.toBeInTheDocument();
  });
  
  it('displays most viewed cities when provided', () => {
    render(
      <CitySearch 
        cities={mockCities}
        loading={false}
        onSelectCity={mockOnSelectCity}
        mostViewedCities={mockMostViewed}
      />
    );
    
    expect(screen.getByText('Most viewed locations:')).toBeInTheDocument();
    
    // Should show both most viewed cities
    const mostViewedSection = screen.getByText('Most viewed locations:').parentElement;
    expect(within(mostViewedSection).getByText('Vilnius')).toBeInTheDocument();
    expect(within(mostViewedSection).getByText('Palanga')).toBeInTheDocument();
  });
  
  it('selects city when clicking on most viewed city', () => {
    render(
      <CitySearch 
        cities={mockCities}
        loading={false}
        onSelectCity={mockOnSelectCity}
        mostViewedCities={mockMostViewed}
      />
    );
    
    // Click on a most viewed city
    fireEvent.click(screen.getByText('Palanga'));
    
    expect(mockOnSelectCity).toHaveBeenCalledWith(mockMostViewed[1]);
    expect(mockOnSelectCity).toHaveBeenCalledTimes(1);
  });
});