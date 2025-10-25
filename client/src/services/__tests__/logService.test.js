import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  logCityView,
  getUserHistory,
  getTopCities,
  getTemperatureExtremes,
} from "../logService";
import axios from "axios";

vi.mock("axios");

describe("Log Service", () => {
  beforeEach(() => {
    vi.resetAllMocks();

    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "log").mockImplementation(() => {});

    localStorage.setItem("authToken", "test-token");
  });

  describe("logCityView", () => {
    it("should log city view successfully", async () => {
      axios.post.mockResolvedValueOnce({ data: { success: true } });

      await logCityView("Vilnius");

      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining("/api/log"),
        expect.objectContaining({
          city: "Vilnius",
          timestamp: expect.any(String),
        }),
        expect.objectContaining({
          headers: {
            Authorization: "Bearer test-token",
          },
        })
      );
    });

    it("should handle errors gracefully", async () => {
      axios.post.mockRejectedValueOnce(new Error("Network Error"));

      await expect(logCityView("Vilnius")).resolves.not.toThrow();

      expect(console.error).toHaveBeenCalled();
    });

    it("should skip logging when the user is not authenticated", async () => {
      localStorage.removeItem("authToken");

      await logCityView("Vilnius");

      expect(axios.post).not.toHaveBeenCalled();
    });
  });

  describe("getUserHistory", () => {
    it("should fetch history with params when authenticated", async () => {
      const history = [{ city: "Vilnius" }];
      axios.get.mockResolvedValueOnce({ data: history });

      const result = await getUserHistory({ limit: 10, sort: "recent" });

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining("/api/log/history"),
        expect.objectContaining({
          headers: {
            Authorization: "Bearer test-token",
          },
          params: expect.objectContaining({
            limit: 10,
            sort: "recent",
          }),
        })
      );
      expect(result).toEqual(history);
    });

    it("should return null when not authenticated", async () => {
      localStorage.removeItem("authToken");

      const result = await getUserHistory();

      expect(result).toBeNull();
      expect(axios.get).not.toHaveBeenCalled();
    });

    it("should return null on request failure", async () => {
      axios.get.mockRejectedValueOnce(new Error("Network Error"));

      const result = await getUserHistory();

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe("getTopCities", () => {
    it("should fetch top cities with default params", async () => {
      const topCities = [{ city: "Vilnius", views: 3 }];
      axios.get.mockResolvedValueOnce({ data: topCities });

      const result = await getTopCities();

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining("/api/log/top-cities"),
        expect.objectContaining({
          headers: {
            Authorization: "Bearer test-token",
          },
          params: expect.objectContaining({
            take: 5,
          }),
        })
      );
      expect(result).toEqual(topCities);
    });

    it("should return null when not authenticated", async () => {
      localStorage.removeItem("authToken");

      const result = await getTopCities();

      expect(result).toBeNull();
      expect(axios.get).not.toHaveBeenCalled();
    });

    it("should return null on failure", async () => {
      axios.get.mockRejectedValueOnce(new Error("Network Error"));

      const result = await getTopCities();

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe("getTemperatureExtremes", () => {
    it("should fetch extremes", async () => {
      const extremes = { hottest: { city: "Vilnius", temperatureC: 25 } };
      axios.get.mockResolvedValueOnce({ data: extremes });

      const result = await getTemperatureExtremes();

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining("/api/log/extremes"),
        expect.objectContaining({
          headers: {
            Authorization: "Bearer test-token",
          },
        })
      );
      expect(result).toEqual(extremes);
    });

    it("should return null when response is empty", async () => {
      axios.get.mockResolvedValueOnce({ data: null });

      const result = await getTemperatureExtremes();

      expect(result).toBeNull();
    });

    it("should return null when not authenticated", async () => {
      localStorage.removeItem("authToken");

      const result = await getTemperatureExtremes();

      expect(result).toBeNull();
      expect(axios.get).not.toHaveBeenCalled();
    });

    it("should handle 204 responses", async () => {
      const error = new Error("No Content");
      error.response = { status: 204 };
      axios.get.mockRejectedValueOnce(error);

      const result = await getTemperatureExtremes();

      expect(result).toBeNull();
    });
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });
});
