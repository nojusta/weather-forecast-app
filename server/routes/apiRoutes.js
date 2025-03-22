const express = require('express');
const axios = require('axios');
const router = express.Router();

const METEO_API_BASE_URL = 'https://api.meteo.lt/v1';

// Weather API routes
router.get('/weather/places', async (req, res) => {
  try {
    const response = await axios.get(`${METEO_API_BASE_URL}/places`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching places:', error);
    res.status(500).json({ error: 'Failed to fetch places' });
  }
});

router.get('/weather/places/:placeCode/forecasts/long-term', async (req, res) => {
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
router.post('/log', (req, res) => {
  const { city, timestamp } = req.body;
  console.log(`[${new Date(timestamp).toLocaleString()}] User viewed weather for: ${city}`);
  res.json({ success: true });
});

module.exports = router;