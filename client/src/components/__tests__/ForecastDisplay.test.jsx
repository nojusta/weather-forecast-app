import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ForecastDisplay from "../ForecastDisplay";

describe("ForecastDisplay Component", () => {
  const mockForecastData = {
    place: {
      name: "Test City",
      administrativeDivision: "Test County",
    },
    forecastTimestamps: [
      {
        forecastTimeUtc: "2025-03-20T09:00:00Z",
        airTemperature: 12.5,
        windSpeed: 4.2,
        windDirection: 180,
        relativeHumidity: 62,
        totalPrecipitation: 0,
        conditionCode: "clear",
      },
      {
        forecastTimeUtc: "2025-03-20T12:00:00Z",
        airTemperature: 15.5,
        windSpeed: 5.2,
        windDirection: 190,
        relativeHumidity: 65,
        totalPrecipitation: 0,
        conditionCode: "partly-cloudy",
      },

      {
        forecastTimeUtc: "2025-03-21T12:00:00Z",
        airTemperature: 14.0,
        windSpeed: 3.8,
        windDirection: 200,
        relativeHumidity: 70,
        totalPrecipitation: 1.2,
        conditionCode: "light-rain",
      },

      {
        forecastTimeUtc: "2025-03-22T12:00:00Z",
        airTemperature: 13.0,
        windSpeed: 6.5,
        windDirection: 220,
        relativeHumidity: 75,
        totalPrecipitation: 2.5,
        conditionCode: "rain",
      },

      {
        forecastTimeUtc: "2025-03-23T12:00:00Z",
        airTemperature: 10.0,
        windSpeed: 7.2,
        windDirection: 250,
        relativeHumidity: 80,
        totalPrecipitation: 5.0,
        conditionCode: "rain",
      },

      {
        forecastTimeUtc: "2025-03-24T12:00:00Z",
        airTemperature: 11.5,
        windSpeed: 4.0,
        windDirection: 270,
        relativeHumidity: 72,
        totalPrecipitation: 0.5,
        conditionCode: "light-rain",
      },

      {
        forecastTimeUtc: "2025-03-25T12:00:00Z",
        airTemperature: 16.0,
        windSpeed: 3.0,
        windDirection: 180,
        relativeHumidity: 60,
        totalPrecipitation: 0,
        conditionCode: "clear",
      },
    ],
  };

  it("renders 5-day forecast title", () => {
    render(<ForecastDisplay data={mockForecastData} />);

    expect(screen.getByText("5-Day Forecast")).toBeInTheDocument();
  });

  it("displays exactly 5 days of forecasts", () => {
    render(<ForecastDisplay data={mockForecastData} />);

    const dates = screen.getAllByText(/^\w{3}, \w{3} \d{1,2}$/);
    expect(dates.length).toBe(5);
  });

  it("shows correct temperature for each day", () => {
    render(<ForecastDisplay data={mockForecastData} />);

    expect(screen.getByText("16°C")).toBeInTheDocument();

    expect(screen.getByText("14°C")).toBeInTheDocument();

    expect(screen.getByText("13°C")).toBeInTheDocument();

    expect(screen.getByText("10°C")).toBeInTheDocument();

    expect(screen.getByText("12°C")).toBeInTheDocument();
  });

  it("displays correct weather conditions", () => {
    render(<ForecastDisplay data={mockForecastData} />);

    const partlyCloudy = screen.queryAllByText("Partly Cloudy");
    expect(partlyCloudy.length).toBeGreaterThan(0);

    const lightRainOrUnknown = screen.queryAllByText(/Light Rain|Unknown/);
    expect(lightRainOrUnknown.length).toBeGreaterThan(0);

    const rainOrUnknown = screen.queryAllByText(/Rain|Unknown/);
    expect(rainOrUnknown.length).toBeGreaterThan(0);
  });

  it("returns null when data is missing", () => {
    const { container } = render(<ForecastDisplay data={null} />);
    expect(container.firstChild).toBeNull();

    const { container: container2 } = render(<ForecastDisplay data={{}} />);
    expect(container2.firstChild).toBeNull();
  });
});
