const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const axios = require('axios');

const app = express();
// Try different ports if the default is in use
const PORT = process.env.PORT || 50001;
const METEO_API_BASE_URL = 'https://api.meteo.lt/v1';

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Proxy routes for weather API
app.get('/api/weather/places', async (req, res) => {
  try {
    const response = await axios.get(`${METEO_API_BASE_URL}/places`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching places:', error);
    res.status(500).json({ error: 'Failed to fetch places' });
  }
});

app.get('/api/weather/places/:placeCode/forecasts/long-term', async (req, res) => {
  try {
    const { placeCode } = req.params;
    const response = await axios.get(`${METEO_API_BASE_URL}/places/${placeCode}/forecasts/long-term`);
    res.json(response.data);
  } catch (error) {
    console.error(`Error fetching forecast for ${req.params.placeCode}:`, error);
    res.status(500).json({ error: 'Failed to fetch forecast' });
  }
});

// Log user actions
app.post('/api/log', (req, res) => {
  const { city, timestamp } = req.body;
  console.log(`[${new Date(timestamp).toLocaleString()}] User viewed weather for: ${city}`);
  res.json({ success: true });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Find an available port
const startServer = (port) => {
  try {
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    })
    .on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`Port ${port} is busy, trying ${port + 1}...`);
        startServer(port + 1);
      } else {
        console.error('Server error:', err);
      }
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
};

// Start the server with port fallback
startServer(PORT);