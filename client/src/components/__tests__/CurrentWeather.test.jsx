import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CurrentWeather from '../CurrentWeather';

describe('CurrentWeather Component', () => {
  const mockWeatherData = {
    place: {
      name: 'Test City',
      administrativeDivision: 'Test County'
    },
    currentWeather: {
      forecastTimeUtc: '2025-03-20T12:00:00Z',
      airTemperature: 15.5,
      feelsLikeTemperature: 14.0,
      windSpeed: 5.2,
      windDirection: 180, // South
      relativeHumidity: 65,
      seaLevelPressure: 1013,
      cloudCover: 25,
      conditionCode: 'partly-cloudy'
    }
  };
  
  it('renders city name and administrative division', () => {
    render(<CurrentWeather data={mockWeatherData} />);
    
    expect(screen.getByText('Test City')).toBeInTheDocument();
    expect(screen.getByText('Test County')).toBeInTheDocument();
  });
  
  it('displays current temperature correctly', () => {
    render(<CurrentWeather data={mockWeatherData} />);
    
    expect(screen.getByText('16°C')).toBeInTheDocument();
    expect(screen.getByText(/Feels like 14°C/i)).toBeInTheDocument();
  });
  
  it('shows weather condition name', () => {
    render(<CurrentWeather data={mockWeatherData} />);
    
    expect(screen.getByText('Partly Cloudy')).toBeInTheDocument();
  });
  
  it('displays weather details correctly', () => {
    render(<CurrentWeather data={mockWeatherData} />);
    
    expect(screen.getByText('5.2 m/s')).toBeInTheDocument();
    expect(screen.getByText('65%')).toBeInTheDocument();
    expect(screen.getByText('1013 hPa')).toBeInTheDocument();
    expect(screen.getByText('25%')).toBeInTheDocument();
  });
  
  it('shows correct wind direction', () => {
    render(<CurrentWeather data={mockWeatherData} />);
    
    expect(screen.getByText(/Direction: S/i)).toBeInTheDocument();
  });
  
  it('returns null when data is missing', () => {
    const { container } = render(<CurrentWeather data={null} />);
    expect(container.firstChild).toBeNull();
    
    const { container: container2 } = render(<CurrentWeather data={{}} />);
    expect(container2.firstChild).toBeNull();
  });
});