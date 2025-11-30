import { useEffect, useMemo, useState, useCallback } from "react";
import PropTypes from "prop-types";
import Modal from "./Modal";
import useFilteredCities from "../hooks/useFilteredCities";

const defaultForm = {
  city: "",
  placeCode: "",
  conditionType: "Below",
  thresholdC: "",
  active: true,
  quietHoursStart: "",
  quietHoursEnd: "",
  digestEnabled: false,
};

const AlertsModal = ({
  isOpen,
  onClose,
  alerts,
  deliveries,
  stats,
  loading,
  error,
  onCreate,
  onUpdate,
  onDelete,
  onRefresh,
  selectedCity,
  cities,
  onRunDigest,
}) => {
  const [form, setForm] = useState(defaultForm);
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [digestLoading, setDigestLoading] = useState(false);
  const [digestLocked, setDigestLocked] = useState(false);
  const [digestHour, setDigestHour] = useState("7");
  const [digestHourUpdating, setDigestHourUpdating] = useState(false);
  const [digestHourSaved, setDigestHourSaved] = useState("");
  const [digestRunStatus, setDigestRunStatus] = useState("");
  const filteredCities = useFilteredCities(cities, searchTerm);

  const resetForm = useCallback(() => {
    setForm(
      selectedCity
        ? {
            city: selectedCity.name,
            placeCode: selectedCity.code,
            conditionType: "Below",
            thresholdC: "",
            active: true,
            quietHoursStart: "",
            quietHoursEnd: "",
            digestEnabled: false,
          }
        : defaultForm
    );
    setSearchTerm("");
    setDropdownVisible(false);
  }, [selectedCity]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const digestEnabled = !!form.digestEnabled;
    const payload = {
      city: form.city.trim(),
      placeCode: form.placeCode.trim(),
      conditionType: form.conditionType === "Above" ? 1 : 0,
      thresholdC: Number(form.thresholdC),
      active: form.active,
      quietHoursStart:
        form.quietHoursStart === "" ? null : Number(form.quietHoursStart),
      quietHoursEnd:
        form.quietHoursEnd === "" ? null : Number(form.quietHoursEnd),
      digestEnabled,
      digestSendHourLocal: digestEnabled ? Number(digestHour) : null,
    };
    const ok = await onCreate(payload);
    if (ok) {
      resetForm();
    }
  };

  const { immediateDeliveries, digestDeliveries } = useMemo(() => {
    const sorted =
      deliveries?.sort(
        (a, b) =>
          new Date(b.attemptedAt ?? b.attemptedat).getTime() -
          new Date(a.attemptedAt ?? a.attemptedat).getTime()
      ) ?? [];

    return {
      immediateDeliveries: sorted
        .filter((d) => !d.digestBatchDate)
        .slice(0, 10),
      digestDeliveries: sorted.filter((d) => d.digestBatchDate).slice(0, 5),
    };
  }, [deliveries]);

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen, resetForm]);

  useEffect(() => {
    const firstWithHour = alerts.find(
      (a) => a.digestEnabled && a.digestSendHourLocal !== null
    );
    if (firstWithHour && firstWithHour.digestSendHourLocal !== null) {
      setDigestHour(String(firstWithHour.digestSendHourLocal));
    }
  }, [alerts]);

  const formatVilnius = (value) => {
    if (!value) return "";
    const str = typeof value === "string" ? value : String(value);
    const normalized =
      str.includes("Z") || str.includes("+") ? str : `${str}Z`; // treat server timestamps as UTC
    return new Date(normalized).toLocaleString("lt-LT", {
      timeZone: "Europe/Vilnius",
    });
  };

  const applyDigestHourToAll = async () => {
    const hourNumber = Number(digestHour);
    const targets = alerts.filter((a) => a.digestEnabled);
    if (targets.length === 0) return;
    setDigestHourUpdating(true);
    for (const alert of targets) {
      await onUpdate(alert.id, { ...alert, digestSendHourLocal: hourNumber });
    }
    setDigestHourUpdating(false);
    setDigestHourSaved(`Saved (${hourNumber}:00)`);
    setTimeout(() => setDigestHourSaved(""), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Weather Alerts"
      maxWidth="max-w-4xl"
    >
      <div className="flex flex-col gap-6">
        <section className="grid gap-4 md:grid-cols-3">
          <StatCard label="Rules" value={stats?.totalRules ?? alerts.length} />
          <StatCard
            label="Active"
            value={stats?.activeRules ?? alerts.filter((a) => a.active).length}
          />
          <StatCard label="Sent" value={stats?.sentCount ?? 0} />
        </section>

        {/* Digest summary moved to bottom */}

        <section className="grid md:grid-cols-2 gap-6">
          <div className="border border-slate-100 rounded-2xl p-4 bg-gradient-to-br from-blue-50 to-white">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-800">New Rule</h3>
              <button
                onClick={resetForm}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Reset Form
              </button>
            </div>
            <form className="space-y-3" onSubmit={handleSubmit}>
              <div>
                <label className="text-sm text-slate-600">Select a City</label>

                {/* positioning context */}
                <div className="relative">
                  <input
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="Start typing..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setDropdownVisible(true);
                    }}
                  />

                  {dropdownVisible && filteredCities.length > 0 && (
                    <div className="absolute left-0 right-0 mt-1 border border-slate-200 rounded-lg max-h-48 overflow-y-auto bg-white shadow-lg z-50">
                      {filteredCities.map((city) => (
                        <button
                          key={city.code}
                          type="button"
                          className="block w-full text-left px-3 py-2 hover:bg-blue-50"
                          onClick={() => {
                            setForm((prev) => ({
                              ...prev,
                              city: city.name,
                              placeCode: city.code,
                            }));
                            setSearchTerm(city.name);
                            setDropdownVisible(false);
                          }}
                        >
                          <span className="font-medium text-slate-800">
                            {city.name}
                          </span>
                          <span className="text-xs text-slate-500 ml-2">
                            {city.administrativeDivision}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {form.city && form.placeCode && (
                  <p className="text-xs text-emerald-700 mt-1">
                    Selected: {form.city} ({form.placeCode})
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-slate-600">Condition</label>
                  <select
                    className="w-full border rounded-lg px-3 py-2"
                    value={form.conditionType}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        conditionType: e.target.value,
                      }))
                    }
                  >
                    <option value="Below">Below</option>
                    <option value="Above">Above</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-slate-600">
                    Threshold (°C)
                  </label>
                  <input
                    type="number"
                    className="w-full border rounded-lg px-3 py-2"
                    value={form.thresholdC}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        thresholdC: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
              </div>
              <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, active: e.target.checked }))
                  }
                />
                Active
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-slate-600">
                    Quiet hours start (local)
                  </label>
                  <select
                    className="w-full border rounded-lg px-3 py-2"
                    value={form.quietHoursStart}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        quietHoursStart: e.target.value,
                      }))
                    }
                  >
                    <option value="">None</option>
                    {Array.from({ length: 24 }).map((_, i) => (
                      <option key={i} value={i}>
                        {i}:00
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-slate-600">
                    Quiet hours end (local)
                  </label>
                  <select
                    className="w-full border rounded-lg px-3 py-2"
                    value={form.quietHoursEnd}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        quietHoursEnd: e.target.value,
                      }))
                    }
                  >
                    <option value="">None</option>
                    {Array.from({ length: 24 }).map((_, i) => (
                      <option key={i} value={i}>
                        {i}:00
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.digestEnabled}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      digestEnabled: e.target.checked,
                    }))
                  }
                />
                Include in daily digest
              </label>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white rounded-lg py-2 hover:bg-blue-700 transition"
                disabled={loading || !form.placeCode}
              >
                Create
              </button>
            </form>
          </div>

          <div className="border border-slate-100 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-800">My Rules</h3>
              <button
                onClick={onRefresh}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Refresh
              </button>
            </div>
            <button
              onClick={async () => {
                if (digestLocked) return;
                setDigestLoading(true);
                setDigestLocked(true);
                setDigestRunStatus("");
                const sent = await onRunDigest();
                setDigestRunStatus(
                  sent > 0
                    ? `Digest sent (${sent} email${sent > 1 ? "s" : ""})`
                    : "No pending digest to send"
                );
                setDigestLoading(false);
                setTimeout(() => setDigestLocked(false), 60000); // 60s lock to avoid spamming
              }}
              disabled={digestLoading || digestLocked}
              className={`mb-3 inline-flex items-center justify-center rounded-lg bg-emerald-600 text-white text-sm px-3 py-2 transition ${
                digestLoading || digestLocked
                  ? "opacity-60 cursor-not-allowed"
                  : "hover:bg-emerald-700"
              }`}
            >
              {digestLoading
                ? "Sending..."
                : digestLocked
                ? "On cooldown"
                : "Send digest now"}
            </button>
            <div className="flex flex-wrap items-center gap-3 mb-4 p-3 bg-slate-50 border border-slate-100 rounded-lg">
              <div className="flex items-center gap-2">
                <label className="text-sm text-slate-700">
                  Digest send hour:
                </label>
                <select
                  className="border rounded-lg py-1.5 text-sm bg-white"
                  value={digestHour}
                  onChange={(e) => setDigestHour(e.target.value)}
                >
                  {Array.from({ length: 24 }).map((_, i) => (
                    <option key={i} value={i}>
                      {i}:00
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={applyDigestHourToAll}
                disabled={digestHourUpdating}
                className={`text-sm px-3 py-1.5 rounded-lg border ${
                  digestHourUpdating
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                    : "bg-white text-slate-700 hover:bg-slate-100"
                }`}
              >
                {digestHourUpdating ? "Saving..." : "Apply to digest alerts"}
              </button>
              <div className="flex items-center gap-2">
                {digestHourSaved && (
                  <span className="text-xs text-emerald-600">
                    {digestHourSaved}
                  </span>
                )}
                {digestRunStatus && (
                  <span className="text-xs text-slate-600">
                    {digestRunStatus}
                  </span>
                )}
              </div>
              <span className="text-xs text-slate-500">
                Sets the daily send time for alerts marked “Include in daily
                digest”.
              </span>
            </div>
            {loading && <p className="text-sm text-slate-500">Loading...</p>}
            {error && <p className="text-sm text-red-500">{error}</p>}
            {!loading && alerts.length === 0 && (
              <p className="text-sm text-slate-500">No rules yet.</p>
            )}
            <ul className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {alerts.map((alert) => (
                <li
                  key={alert.id}
                  className="border border-slate-100 rounded-xl px-3 py-2 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white"
                >
                  <div>
                    <p className="font-semibold text-slate-800">{alert.city}</p>
                    <p className="text-xs text-slate-500">
                      {alert.conditionType === 0 ? "Below" : "Above"}{" "}
                      {alert.thresholdC}°C
                    </p>
                    <p className="text-xs text-slate-500">
                      Code: {alert.placeCode}
                    </p>
                    {(alert.quietHoursStart !== null ||
                      alert.quietHoursEnd !== null) && (
                      <p className="text-xs text-slate-500">
                        Quiet:{" "}
                        {alert.quietHoursStart !== null
                          ? `${alert.quietHoursStart}:00`
                          : "-"}{" "}
                        →{" "}
                        {alert.quietHoursEnd !== null
                          ? `${alert.quietHoursEnd}:00`
                          : "-"}
                      </p>
                    )}
                    {alert.digestEnabled && (
                      <p className="text-xs text-amber-600 font-semibold">
                        Digest mode
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1 text-xs text-slate-600">
                      <input
                        type="checkbox"
                        checked={alert.active}
                        onChange={(e) =>
                          onUpdate(alert.id, {
                            ...alert,
                            active: e.target.checked,
                          })
                        }
                      />
                      Active
                    </label>
                    <button
                      onClick={() => onDelete(alert.id)}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section>
          <h3 className="font-semibold text-slate-800 mb-2">
            Recent Deliveries
          </h3>
          {immediateDeliveries.length === 0 ? (
            <p className="text-sm text-slate-500">No attempts yet.</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-3">
              {immediateDeliveries.map((delivery) => (
                <div
                  key={delivery.id}
                  className="border border-slate-100 rounded-xl p-3 bg-white shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-slate-800">
                      {delivery.alertRule?.city ?? "N/A"}
                    </p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        delivery.status === 1
                          ? "bg-emerald-100 text-emerald-700"
                          : delivery.status === 2
                          ? "bg-rose-100 text-rose-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {statusLabel(delivery.status)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {formatVilnius(
                      delivery.attemptedAt ?? delivery.attemptedat
                    )}
                  </p>
                  {delivery.errorMessage && (
                    <p className="text-xs text-rose-600 mt-1">
                      {delivery.errorMessage}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="flex flex-col gap-2 mt-2">
        <h3 className="font-semibold text-slate-800">Digest Emails</h3>
        {digestDeliveries.length === 0 ? (
          <p className="text-sm text-slate-500">No digest emails yet.</p>
        ) : (
          <ul className="space-y-2">
            {digestDeliveries.map((delivery) => (
              <li
                key={delivery.id}
                className="border border-slate-100 rounded-xl p-3 bg-white shadow-sm flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold text-slate-800">
                    Digest email sent
                  </p>
                  <p className="text-xs text-slate-500">
                    Sent at:{" "}
                    {formatVilnius(
                      delivery.attemptedAt ?? delivery.attemptedat
                    )}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    delivery.status === 1
                      ? "bg-emerald-100 text-emerald-700"
                      : delivery.status === 2
                      ? "bg-rose-100 text-rose-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {statusLabel(delivery.status)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Modal>
  );
};

const StatCard = ({ label, value }) => (
  <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-slate-50 p-4 border border-slate-100">
    <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
    <p className="text-2xl font-bold text-slate-800">{value}</p>
  </div>
);

const statusLabel = (status) => {
  if (status === 1) return "Sent";
  if (status === 2) return "Error";
  return "Pending";
};

AlertsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  alerts: PropTypes.array.isRequired,
  deliveries: PropTypes.array.isRequired,
  stats: PropTypes.object,
  loading: PropTypes.bool,
  error: PropTypes.string,
  onCreate: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onRefresh: PropTypes.func.isRequired,
  selectedCity: PropTypes.object,
  cities: PropTypes.array.isRequired,
  onRunDigest: PropTypes.func.isRequired,
};

AlertsModal.defaultProps = {
  stats: null,
  loading: false,
  error: "",
  selectedCity: null,
};

export default AlertsModal;
