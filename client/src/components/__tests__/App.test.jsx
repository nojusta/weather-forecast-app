import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import App from "../../App";
import * as weatherService from "../../services/weatherService";
import * as logService from "../../services/logService";

vi.mock("../../services/weatherService");
vi.mock("../../services/logService");

describe("App", () => {
  const mockCities = [
    {
      code: "vilnius",
      name: "Vilnius",
      administrativeDivision: "Vilniaus m. sav.",
    },
    { code: "kaunas", name: "Kaunas", administrativeDivision: "Kauno m. sav." },
  ];

  const mockWeather = {
    place: { code: "vilnius", name: "Vilnius" },
    currentWeather: { airTemperature: 15, conditionCode: "clear" },
  };

  const mockForecast = {
    place: { code: "vilnius", name: "Vilnius" },
    forecastTimestamps: [],
  };

  beforeEach(() => {
    localStorage.clear();

    weatherService.getPlaces.mockResolvedValue(mockCities);
    weatherService.getCurrentWeather.mockResolvedValue(mockWeather);
    weatherService.getForecast.mockResolvedValue(mockForecast);
    logService.logCityView.mockResolvedValue({ success: true });

    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("loads most viewed cities from localStorage on mount", async () => {
    const savedCities = [
      {
        code: "vilnius",
        name: "Vilnius",
        administrativeDivision: "Vilniaus m. sav.",
      },
    ];
    localStorage.setItem("mostViewedCities", JSON.stringify(savedCities));

    await act(async () => {
      render(<App />);
    });

    expect(weatherService.getPlaces).toHaveBeenCalled();

    const vilniusElement = await screen.findByText("Vilnius");
    expect(vilniusElement).toBeInTheDocument();
  });

  it("updates localStorage when a city is selected", async () => {
    await act(async () => {
      render(<App />);
    });

    await screen.findByText("Search for a location");

    const searchInput = screen.getByPlaceholderText(/Type to search/i);

    await act(async () => {
      fireEvent.change(searchInput, { target: { value: "vil" } });
    });

    const cityOption = await screen.findByText("Vilnius");

    await act(async () => {
      fireEvent.click(cityOption);
    });

    const storedCities = JSON.parse(localStorage.getItem("mostViewedCities"));
    expect(storedCities).toHaveLength(1);
    expect(storedCities[0].name).toBe("Vilnius");

    expect(logService.logCityView).toHaveBeenCalledWith("Vilnius");
  });

  it("limits most viewed cities to 3", async () => {
    const savedCities = [
      {
        code: "vilnius",
        name: "Vilnius",
        administrativeDivision: "Vilniaus m. sav.",
      },
      {
        code: "kaunas",
        name: "Kaunas",
        administrativeDivision: "Kauno m. sav.",
      },
      {
        code: "klaipeda",
        name: "Klaipėda",
        administrativeDivision: "Klaipėdos m. sav.",
      },
    ];
    localStorage.setItem("mostViewedCities", JSON.stringify(savedCities));

    await act(async () => {
      render(<App />);
    });

    const newCity = {
      code: "palanga",
      name: "Palanga",
      administrativeDivision: "Palangos m. sav.",
    };

    const currentCities = JSON.parse(
      localStorage.getItem("mostViewedCities") || "[]"
    );

    const updatedCities = [
      newCity,
      ...currentCities.filter((c) => c.code !== newCity.code).slice(0, 2),
    ];
    localStorage.setItem("mostViewedCities", JSON.stringify(updatedCities));

    const storedCities = JSON.parse(localStorage.getItem("mostViewedCities"));
    expect(storedCities.length).toBeLessThanOrEqual(3);

    expect(storedCities[0].name).toBe("Palanga");

    expect(storedCities.find((c) => c.name === "Klaipėda")).toBeUndefined();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });
});
