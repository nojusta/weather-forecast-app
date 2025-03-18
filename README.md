# Weather Forecast App

A responsive web application for displaying weather forecasts with user action logging.

## Features

- Responsive layout for all device sizes
- Searchable dropdown to select cities for weather forecasts
- Browser storage of 3 most viewed cities
- Display of current weather conditions and 5-day forecasts
- Backend logging of user actions

## Technology Stack

### Frontend
- React (Vite)
- Tailwind CSS with PostCSS
- Axios for API requests
- React Context API for state management

### Backend
- Node.js with Express
- Winston for logging
- MongoDB (optional for storing user actions)

### APIs
- api.meteo.lt for weather data

## Setup Instructions

### Prerequisites
- Node.js (v14+)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/nojusta/weather-forecast-app
cd weather-forecast-app
```

2. Install dependencies
```bash
# Install frontend dependencies
cd client
npm install

# Install backend dependencies
cd ../server
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
VITE_API_URL=http://localhost:50001
PORT=50001
NODE_ENV=development
```

4. Start the development servers
```bash
# Start backend server
cd server
npm run dev

# In a new terminal, start frontend server
cd client
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173` (the port may vary)
## Project Structure

```
weather-forecast-app/
├── client/                      # Frontend React app
│   ├── public/                  # Static assets
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── ApiDebug.jsx     # API testing component (for debugging)
│   │   │   ├── CitySearch.jsx   # City search dropdown
│   │   │   ├── CurrentWeather.jsx # Current weather display
│   │   │   ├── ForecastDisplay.jsx # 5-day forecast 
│   │   │   └── Layout.jsx       # Page layout component
│   │   ├── services/            # API service calls
│   │   │   ├── weatherService.js # Weather API calls
│   │   │   └── logService.js    # Logging service
│   │   ├── App.jsx              # Main App component
│   │   ├── main.jsx             # Entry point
│   │   └── index.css            # Global styles with Tailwind
│   ├── tailwind.config.js       # Tailwind configuration
│   ├── postcss.config.js        # PostCSS configuration
│   └── vite.config.js           # Vite configuration
├── server/                      # Backend Node.js app
│   ├── index.js                 # Server entry point & API routes
│   └── package.json             # Backend dependencies
└── README.md                    # Project documentation
```