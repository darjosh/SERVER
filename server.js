const express = require('express');
const axios = require('axios');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = 3000;

const IP_DB_FILE = './ip-db.json';

// middleware to parse the request body as JSON
app.use(express.json());

// Create an IPLocation object in the json file
app.post('/api/locations', async (req, res) => {
  try {
    const domain = req.body.domain;

    // Check if the domain already exists in the database
    const existingLocations = JSON.parse(fs.readFileSync(IP_DB_FILE));
    const existingLocation = existingLocations.find(
      (location) => location.domain === domain
    );
    if (existingLocation) {
      return res.status(400).json({ error: 'Location already exists' });
    }

    // Call ipgeolocation.io API to get the location data
    const response = await axios.get(
      `https://api.ipgeolocation.io/ipgeo?apiKey=YOUR_API_KEY&domain=${domain}`
    );
    const locationData = response.data;

    // Create a new IPLocation object
    const newLocation = {
      id: uuidv4(),
      domain,
      long: locationData.longitude,
      lat: locationData.latitude,
      geoname_id: locationData.geoname_id,
      isActive: true,
    };

    // Add the new location to the database
    existingLocations.push(newLocation);
    fs.writeFileSync(IP_DB_FILE, JSON.stringify(existingLocations));

    res.status(201).json(newLocation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Read single or multiple active IPLocation objects from the json array
app.get('/api/locations/:id?', async (req, res) => {
  try {
    const id = req.params.id;
    const locations = JSON.parse(fs.readFileSync(IP_DB_FILE));

    if (id) {
      // Return a single location by id
      const location = locations.find((loc) => loc.id === id && loc.isActive);
      if (!location) {
        return res.status(404).json({ error: 'Location not found' });
      }
      res.json(location);
    } else {
      // Return all active locations
      const activeLocations = locations.filter((loc) => loc.isActive);
      res.json(activeLocations);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update the info of the IPLocation by id
app.put('/api/locations/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const updateData = req.body;

    const locations = JSON.parse(fs.readFileSync(IP_DB_FILE));
    const locationIndex = locations.findIndex(
      (loc) => loc.id === id && loc.isActive
    );
    if (locationIndex === -1) {
      return res.status(404).json({ error: 'Location not found' });
    }

    // Update the location data
    locations[locationIndex] = { ...locations[locationIndex], ...updateData };
    fs.writeFileSync(IP_DB_FILE, JSON.stringify(locations));

    res.json(locations[locationIndex]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete: renders an object inactive
app
.delete('/api/locations/:id', async (req, res) => { try { const id = req.params.id;
const locations = JSON.parse(fs.readFileSync(IP_DB_FILE));
const locationIndex = locations.findIndex(
  (loc) => loc.id === id && loc.isActive
);
if (locationIndex === -1) {
  return res.status(404).json({ error: 'Location not found' });
}

// Mark the location as inactive
locations[locationIndex].isActive = false;
fs.writeFileSync(IP_DB_FILE, JSON.stringify(locations));

res.sendStatus(204);
const locations = JSON.parse(fs.readFileSync(IP_DB_FILE));
const locationIndex = locations.findIndex(
  (loc) => loc.id === id && loc.isActive
);
if (locationIndex === -1) {
  return res.status(404).json({ error: 'Location not found' });
}

// Mark the location as inactive
locations[locationIndex].isActive = false;
fs.writeFileSync(IP_DB_FILE, JSON.stringify(locations));

res.sendStatus(204);

