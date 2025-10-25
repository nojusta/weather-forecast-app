import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { logCityView, getUserHistory } from "../logService";
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
    it("should fetch history when authenticated", async () => {
      const history = [{ city: "Vilnius" }];
      axios.get.mockResolvedValueOnce({ data: history });

      const result = await getUserHistory();

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining("/api/log/history"),
        expect.objectContaining({
          headers: {
            Authorization: "Bearer test-token",
          },
        })
      );
      expect(result).toEqual(history);
    });

    it("should return an empty array when not authenticated", async () => {
      localStorage.removeItem("authToken");

      const result = await getUserHistory();

      expect(result).toEqual([]);
      expect(axios.get).not.toHaveBeenCalled();
    });
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });
});
