import { useCallback, useEffect, useState } from "react";
import {
  getUserHistory,
  getTopCities,
  getTemperatureExtremes,
} from "../services/logService";

const initialHistoryState = {
  entries: [],
  loading: false,
  error: "",
};

const initialStatsState = {
  topCities: [],
  extremes: null,
  loading: false,
  error: "",
};

const useUserInsights = (isAuthenticated) => {
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [statsModalOpen, setStatsModalOpen] = useState(false);
  const [historyState, setHistoryState] = useState(initialHistoryState);
  const [statsState, setStatsState] = useState(initialStatsState);

  const resetState = useCallback(() => {
    setHistoryModalOpen(false);
    setStatsModalOpen(false);
    setHistoryState(initialHistoryState);
    setStatsState(initialStatsState);
  }, []);

  const loadHistory = useCallback(async () => {
    setHistoryState((prev) => ({ ...prev, loading: true, error: "" }));
    const result = await getUserHistory({ limit: 100 });

    if (result === null) {
      setHistoryState({
        entries: [],
        loading: false,
        error: "Unable to load history. Please try again.",
      });
      return;
    }

    setHistoryState({
      entries: result,
      loading: false,
      error: "",
    });
  }, []);

  const loadStats = useCallback(async () => {
    setStatsState((prev) => ({ ...prev, loading: true, error: "" }));

    const [topCitiesResult, extremesResult] = await Promise.all([
      getTopCities({ limit: 5 }),
      getTemperatureExtremes(),
    ]);

    if (topCitiesResult === null && extremesResult === null) {
      setStatsState({
        topCities: [],
        extremes: null,
        loading: false,
        error: "Unable to load stats. Please try again.",
      });
      return;
    }

    const segments = [];
    if (topCitiesResult === null) {
      segments.push("top cities");
    }
    if (extremesResult === null) {
      segments.push("temperature extremes");
    }

    setStatsState({
      topCities: topCitiesResult ?? [],
      extremes: extremesResult,
      loading: false,
      error:
        segments.length > 0
          ? `Unable to load ${segments.join(" & ")} right now.`
          : "",
    });
  }, []);

  const openHistory = useCallback(() => {
    setHistoryModalOpen(true);
    loadHistory();
  }, [loadHistory]);

  const openStats = useCallback(() => {
    setStatsModalOpen(true);
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    if (!isAuthenticated) {
      resetState();
    }
  }, [isAuthenticated, resetState]);

  return {
    historyModalOpen,
    statsModalOpen,
    historyState,
    statsState,
    openHistory,
    openStats,
    closeHistory: () => setHistoryModalOpen(false),
    closeStats: () => setStatsModalOpen(false),
    refreshHistory: loadHistory,
    refreshStats: loadStats,
  };
};

export default useUserInsights;
