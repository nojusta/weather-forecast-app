# Weather Forecast App

A responsive web application for displaying weather forecasts with user action logging.

![Weather Forecast App](client/src/assets/FrontPage.png)

## Features

- Responsive layout for all device sizes
- Searchable dropdown to select cities for weather forecasts
- Browser storage of 3 most viewed cities
- Backend logging of user actions
- Display of current weather conditions and 5-day forecasts (implementation shown below)

![5-day forecast](client/src/assets/5DayForecast.png)
_5-day forecast_

## Tech Stack

### Frontend

- React 18 with Vite
- Axios for API requests
- Tailwind CSS (as a PostCSS plugin) for utility-based styling

### Backend

- .NET

### APIs

- api.meteo.lt for weather data

## Setup Instructions

### Prerequisites

- Node.js (v16+)
- npm or yarn

### Installation

1. Clone the repository

```bash
git clone https://github.com/nojusta/weather-forecast-app
cd weather-forecast-app
```

2. Install dependencies for both frontend and backend

```bash
# Frontend
cd client
npm install

# Backend
cd ../server
npm install
```

3. Create `.env` files for both frontend and backend:

- **Root directory (`.env`)** – for server configuration:

  ```ini
  PORT=50001
  NODE_ENV=development
  ```

- **Client directory (`client/.env`)** – for frontend configuration:
  ```ini
  VITE_API_URL=http://localhost:50001
  ```

⚠️ **These `.env` files are not included in the repository for security practices** but are required for the application to function properly. Make sure to create both files before starting the development servers.

4. Start the development servers

```bash
# Backend
cd server
npm run dev

# Frontend (in a new terminal)
cd client
npm run dev
```

5. Open `http://localhost:5173` in your browser. (Port may vary depending on your system).

💡 _To create a production build, use `npm run build`, and preview it with `npm run preview`._

## Project Structure

```
weather-forecast-app/
├── client/                      # Frontend
│   ├── public/                  # Static assets
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── services/            # API calls and logging
│   │   ├── test/                # Test configurations
│   │   ├── App.jsx              # Main App component
│   │   ├── main.jsx             # Entry point
│   │   ├── index.css            # Global styles
│   ├── tailwind.config.js       # Tailwind config
│   ├── vite.config.js           # Vite config
├── server/                      # Backend
│   ├── routes/                  # API endpoints
│   ├── index.js                 # Server entry point
│   └── package.json             # Dependencies
└── README.md                    # Documentation
```

## Testing and Quality Assurance

### Testing Stack

- **Vitest** (test runner)
- **React Testing Library** (component testing)
- **Jest DOM** (DOM matchers)
- **Axios & LocalStorage mocking** for isolated tests

### Component Tests

Tests that verify UI components render and behave correctly:

- **Layout Component**

  - Renders header with application title
  - Includes navigation structure
  - Correctly renders child components

- **CitySearch Component**

  - Filters cities based on user input
  - Displays loading state appropriately
  - Shows most viewed cities section
  - Handles empty search and selection events

- **CurrentWeather Component**

  - Displays location name and region
  - Shows temperature and "feels like" values
  - Renders weather conditions and metadata
  - Gracefully handles missing data

- **ForecastDisplay Component**
  - Renders exactly 5 days of forecast data
  - Groups forecasts correctly by day
  - Shows temperature and conditions for each day
  - Returns null when data is missing

### Service Tests

Tests that verify API communication and data handling:

- **Weather Service**

  - Handles API errors with proper error propagation
  - Manages empty or malformed API responses

- **Log Service**
  - Successfully logs city view events
  - Handles network failures without crashing

### Integration Tests

- **App Component**
  - Loads and stores most viewed cities in localStorage
  - Updates localStorage when a city is selected
  - Maintains a maximum of 3 most viewed cities

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Watch mode
npm run test:watch
```

## Performance Optimization

A Lighthouse audit of the deployed application shows excellent performance metrics.

![Lighthouse Results](client/src/assets/LightHouseResults.png)
_Lighthouse audit results_

### Performance Metrics

| Metric                   | Score   | Description             |
| ------------------------ | ------- | ----------------------- |
| Performance              | 100/100 | Optimized performance   |
| First Contentful Paint   | 0.4s    | Initial content load    |
| Largest Contentful Paint | 0.4s    | Main content load       |
| Total Blocking Time      | 0ms     | Minimal thread blocking |
| Cumulative Layout Shift  | 0       | Stable layout           |
| Speed Index              | 0.4s    | Fast content display    |
