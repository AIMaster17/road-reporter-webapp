// Final version with User Account routes
const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;

// Middleware to handle JSON data and serve the public folder
app.use(express.json());
app.use(express.static('public'));

// Read secret variables from the deployment environment
const mongoURI = process.env.MONGO_URI;
const locationIqKey = process.env.LOCATIONIQ_API_KEY;

// Connect to the MongoDB database
mongoose.connect(mongoURI)
  .then(() => console.log('WebApp successfully connected to MongoDB Atlas!'))
  .catch(err => console.error('WebApp Connection error:', err));

// Define the data structure for a report
const reportSchema = new mongoose.Schema({
  latitude: Number,
  longitude: Number,
  locationName: String,
  road_condition_type: String,
  severity: String,
  comments: String,
  timestamp: { type: Date, default: Date.now }
});
const Report = mongoose.model('Report', reportSchema);


// --- API ROUTES ---

// NEW: Use the user routes from the routes/users.js file
app.use('/api/users', require('./routes/users'));

// API endpoint for submitting a new report
app.post('/api/reports', async (req, res) => {
  try {
    const { latitude, longitude, road_condition_type, severity, comments } = req.body;
    let locationName = 'Unknown Location';
    
    try {
        if (latitude && longitude && locationIqKey) {
            const geoRes = await axios.get(`https://us1.locationiq.com/v1/reverse.php?key=${locationIqKey}&lat=${latitude}&lon=${longitude}&format=json`);
            if (geoRes.data && geoRes.data.display_name) {
                locationName = geoRes.data.display_name;
            }
        }
    } catch (geoError) {
        console.error("Geocoding Error:", geoError.response ? geoError.response.data : geoError.message);
    }

    const newReport = new Report({
        latitude, longitude, locationName,
        road_condition_type, severity, comments
    });
    
    await newReport.save();
    res.status(201).send({ message: 'Report saved successfully!', data: newReport });
  } catch (error) {
    console.error('Error in POST /api/reports:', error.message);
    res.status(500).send({ message: 'Error saving report' });
  }
});

// API endpoint for fetching reports
app.get('/api/reports', async (req, res) => {
  try {
    const filter = {};
    if (req.query.type) {
      filter.road_condition_type = req.query.type;
    }
    if (req.query.severity) {
      filter.severity = req.query.severity;
    }

    const reports = await Report.find(filter).sort({_id: -1});
    
    console.log(`Found ${reports.length} reports in the database with filter:`, filter);
    
    res.status(200).send(reports);
  } catch (error) {
    res.status(500).send({ message: 'Error fetching reports' });
  }
});


// Start the server, listening on all network interfaces
app.listen(port, '0.0.0.0', () => {
  console.log(`Server listening on port ${port}`);
});