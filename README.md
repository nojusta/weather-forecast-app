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
VITE_API_URL=http://localhost:5000
VITE_METEO_API_BASE_URL=https://api.meteo.lt/v1
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/weather-app
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
├── client/                 # Frontend React app
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── context/        # React Context for state management
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service calls
│   │   ├── styles/         # SCSS styles
│   │   └── App.jsx         # Main App component
├── server/                 # Backend Node.js app
│   ├── controllers/        # Route controllers
│   ├── routes/             # Express routes
│   └── index.js            # Entry point for the server
└── .env                    # Environment variables
```