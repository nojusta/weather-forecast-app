import { useCallback, useEffect, useState } from "react";
import {
  getAlerts,
  createAlert,
  updateAlert,
  deleteAlert,
  getAlertDeliveries,
  getAlertStats,
  runDigestNow,
} from "../services/alertService";

const initialState = {
  items: [],
  deliveries: [],
  stats: null,
  loading: false,
  error: "",
};

const useAlerts = (isAuthenticated) => {
  const [state, setState] = useState(initialState);

  const loadAlerts = useCallback(async () => {
    if (!isAuthenticated) return;
    setState((prev) => ({ ...prev, loading: true, error: "" }));

    const [alerts, deliveries, stats] = await Promise.all([
      getAlerts(),
      getAlertDeliveries(),
      getAlertStats(),
    ]);

    if (alerts === null && deliveries === null) {
      setState({
        items: [],
        deliveries: [],
        stats: null,
        loading: false,
        error: "Unable to load alerts right now.",
      });
      return;
    }

    setState({
      items: alerts ?? [],
      deliveries: deliveries ?? [],
      stats: stats ?? null,
      loading: false,
      error: "",
    });
  }, [isAuthenticated]);

  const create = useCallback(
    async (payload) => {
      if (!isAuthenticated) return false;
      const created = await createAlert(payload);
      if (created) {
        await loadAlerts();
        return true;
      }
      return false;
    },
    [isAuthenticated, loadAlerts]
  );

  const update = useCallback(
    async (id, payload) => {
      if (!isAuthenticated) return false;
      const ok = await updateAlert(id, payload);
      if (ok) {
        await loadAlerts();
      }
      return ok;
    },
    [isAuthenticated, loadAlerts]
  );

  const remove = useCallback(
    async (id) => {
      if (!isAuthenticated) return false;
      const ok = await deleteAlert(id);
      if (ok) {
        await loadAlerts();
      }
      return ok;
    },
    [isAuthenticated, loadAlerts]
  );

  const triggerDigest = useCallback(
    async () => {
      if (!isAuthenticated) return false;
      const sent = await runDigestNow();
      await loadAlerts();
      return sent;
    },
    [isAuthenticated, loadAlerts]
  );

  useEffect(() => {
    if (isAuthenticated) {
      loadAlerts();
    } else {
      setState(initialState);
    }
  }, [isAuthenticated, loadAlerts]);

  return {
    ...state,
    create,
    update,
    remove,
    reload: loadAlerts,
    runDigestNow: triggerDigest,
  };
};

export default useAlerts;
