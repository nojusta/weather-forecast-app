import PropTypes from "prop-types";
import Modal from "./Modal";

const HistoryModal = ({
  isOpen,
  onClose,
  entries,
  loading,
  error,
  onRefresh,
}) => {
  const hasEntries = Array.isArray(entries) && entries.length > 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Viewing History">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-slate-500">
            Track of every city you&apos;ve explored.
          </p>
          <button
            onClick={onRefresh}
            className="self-start md:self-auto inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 transition"
          >
            Refresh
          </button>
        </div>

        {loading && (
          <p className="text-center text-slate-500">Loading history...</p>
        )}

        {!loading && error && (
          <p className="text-center text-red-500">{error}</p>
        )}

        {!loading && !error && !hasEntries && (
          <p className="text-center text-slate-500">
            No history yet. View a city to start your timeline.
          </p>
        )}

        {!loading && !error && hasEntries && (
          <ul className="divide-y divide-slate-100 rounded-xl border border-slate-100 overflow-hidden">
            {entries.map((entry) => (
              <li key={entry.id ?? `${entry.city}-${entry.timestamp}`}>
                <div className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-base font-semibold text-slate-800">
                      {entry.city}
                    </p>
                    <p className="text-sm text-slate-500">
                      {formatTimestamp(entry.timestamp)}
                    </p>
                  </div>
                  <div className="text-sm text-slate-600 flex flex-wrap gap-x-4 gap-y-1">
                    {typeof entry.temperatureC === "number" && (
                      <span>{entry.temperatureC.toFixed(1)}°C</span>
                    )}
                    {typeof entry.feelsLikeC === "number" && (
                      <span>Feels like {entry.feelsLikeC.toFixed(1)}°C</span>
                    )}
                    {entry.conditions && (
                      <span className="text-slate-500">{entry.conditions}</span>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Modal>
  );
};

const formatTimestamp = (timestamp) => {
  if (!timestamp) {
    return "Unknown time";
  }

  try {
    return new Intl.DateTimeFormat("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Europe/Vilnius",
    }).format(new Date(timestamp));
  } catch {
    return timestamp;
  }
};

HistoryModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  entries: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      city: PropTypes.string.isRequired,
      timestamp: PropTypes.string,
      temperatureC: PropTypes.number,
      feelsLikeC: PropTypes.number,
      conditions: PropTypes.string,
    })
  ),
  loading: PropTypes.bool,
  error: PropTypes.string,
  onRefresh: PropTypes.func.isRequired,
};

HistoryModal.defaultProps = {
  entries: [],
  loading: false,
  error: "",
};

export default HistoryModal;
