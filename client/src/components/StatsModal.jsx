import PropTypes from "prop-types";
import Modal from "./Modal";

const StatsModal = ({
  isOpen,
  onClose,
  topCities,
  extremes,
  loading,
  error,
  onRefresh,
}) => {
  const hasTopCities = Array.isArray(topCities) && topCities.length > 0;
  const { hottest, coldest } = extremes || {};

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Insights & Stats">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-slate-500">
            See what you track the most and where temperatures peaked.
          </p>
          <button
            onClick={onRefresh}
            className="self-start md:self-auto inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-100 transition"
          >
            Refresh
          </button>
        </div>

        {loading && (
          <p className="text-center text-slate-500">Crunching stats...</p>
        )}

        {!loading && error && (
          <p className="text-center text-red-500">{error}</p>
        )}

        {!loading && !error && (
          <>
            <section>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-3">
                Most Viewed Cities
              </h3>
              {hasTopCities ? (
                <ul className="space-y-3">
                  {topCities.map((city, index) => (
                    <li
                      key={city.city}
                      className="flex items-center justify-between rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 text-slate-800"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-blue-500">
                          #{index + 1}
                        </span>
                        <span className="font-medium">{city.city}</span>
                      </div>
                      <span className="text-sm text-slate-500">
                        {city.views} {city.views === 1 ? "view" : "views"}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-slate-500">
                  View some cities to populate this list.
                </p>
              )}
            </section>

            <section className="grid gap-4 md:grid-cols-2">
              <ExtremeCard
                label="Hottest"
                highlight="from-orange-400 to-rose-500"
                icon="🔥"
                observation={hottest}
              />
              <ExtremeCard
                label="Coldest"
                highlight="from-sky-500 to-indigo-600"
                icon="❄️"
                observation={coldest}
              />
            </section>
          </>
        )}
      </div>
    </Modal>
  );
};

const ExtremeCard = ({ label, highlight, icon, observation }) => {
  return (
    <div
      className={`rounded-2xl bg-gradient-to-br ${highlight} text-white p-4 shadow-lg min-h-[150px] flex flex-col justify-between`}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold uppercase tracking-wide">{label}</p>
        <span className="text-2xl" role="img" aria-label={label}>
          {icon}
        </span>
      </div>
      {observation ? (
        <>
          <p className="text-3xl font-bold">
            {typeof observation.temperatureC === "number"
              ? observation.temperatureC.toFixed(1)
              : "--"}
            °C
          </p>
          <div className="text-sm text-white/90 space-y-1">
            <p className="font-medium">{observation.city}</p>
            <p>{formatTimestamp(observation.timestamp)}</p>
            {typeof observation.feelsLikeC === "number" && (
              <p>Feels like {observation.feelsLikeC.toFixed(1)}°C</p>
            )}
          </div>
        </>
      ) : (
        <p className="text-base text-white/80">
          No temperature data available yet.
        </p>
      )}
    </div>
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
    }).format(new Date(timestamp));
  } catch {
    return timestamp;
  }
};

ExtremeCard.propTypes = {
  label: PropTypes.string.isRequired,
  highlight: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  observation: PropTypes.shape({
    city: PropTypes.string,
    temperatureC: PropTypes.number,
    feelsLikeC: PropTypes.number,
    timestamp: PropTypes.string,
  }),
};

ExtremeCard.defaultProps = {
  observation: null,
};

StatsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  topCities: PropTypes.arrayOf(
    PropTypes.shape({
      city: PropTypes.string.isRequired,
      views: PropTypes.number.isRequired,
    })
  ),
  extremes: PropTypes.shape({
    hottest: PropTypes.shape({
      city: PropTypes.string,
      temperatureC: PropTypes.number,
      feelsLikeC: PropTypes.number,
      timestamp: PropTypes.string,
    }),
    coldest: PropTypes.shape({
      city: PropTypes.string,
      temperatureC: PropTypes.number,
      feelsLikeC: PropTypes.number,
      timestamp: PropTypes.string,
    }),
  }),
  loading: PropTypes.bool,
  error: PropTypes.string,
  onRefresh: PropTypes.func.isRequired,
};

StatsModal.defaultProps = {
  topCities: [],
  extremes: null,
  loading: false,
  error: "",
};

export default StatsModal;
