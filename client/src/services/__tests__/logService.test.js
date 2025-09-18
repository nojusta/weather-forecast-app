import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { logCityView } from "../logService";
import axios from "axios";

vi.mock("axios");

describe("Log Service", () => {
  beforeEach(() => {
    vi.resetAllMocks();

    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "log").mockImplementation(() => {});
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
        })
      );
    });

    it("should handle errors gracefully", async () => {
      axios.post.mockRejectedValueOnce(new Error("Network Error"));

      await expect(logCityView("Vilnius")).resolves.not.toThrow();

      expect(console.error).toHaveBeenCalled();
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });
});
