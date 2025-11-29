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
}) => {
  const [form, setForm] = useState(defaultForm);
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownVisible, setDropdownVisible] = useState(false);
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
          }
        : defaultForm
    );
    setSearchTerm("");
    setDropdownVisible(false);
  }, [selectedCity]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      city: form.city.trim(),
      placeCode: form.placeCode.trim(),
      conditionType: form.conditionType === "Above" ? 1 : 0,
      thresholdC: Number(form.thresholdC),
      active: form.active,
    };
    const ok = await onCreate(payload);
    if (ok) {
      resetForm();
    }
  };

  const groupedDeliveries = useMemo(
    () => deliveries?.slice(0, 10) ?? [],
    [deliveries]
  );

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen, resetForm]);

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
          {groupedDeliveries.length === 0 ? (
            <p className="text-sm text-slate-500">No attempts yet.</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-3">
              {groupedDeliveries.map((delivery) => (
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
                    {new Date(
                      delivery.attemptedAt ?? delivery.attemptedat
                    ).toLocaleString()}
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
};

AlertsModal.defaultProps = {
  stats: null,
  loading: false,
  error: "",
  selectedCity: null,
};

export default AlertsModal;
