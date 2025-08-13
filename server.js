const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

const mongoURI = process.env.MONGO_URI;
const locationIqKey = process.env.LOCATIONIQ_API_KEY;

mongoose.connect(mongoURI)
  .then(() => console.log('WebApp successfully connected to MongoDB Atlas!'))
  .catch(err => console.error('WebApp Connection error:', err));

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

app.post('/api/reports', async (req, res) => {
  try {
    const { latitude, longitude, road_condition_type, severity, comments } = req.body;
    let locationName = 'Unknown Location';

    if (latitude && longitude && locationIqKey) {
        const geoRes = await axios.get(`https://us1.locationiq.com/v1/reverse.php?key=${locationIqKey}&lat=${latitude}&lon=${longitude}&format=json`);
        if (geoRes.data && geoRes.data.display_name) {
            locationName = geoRes.data.display_name;
        }
    }

    const newReport = new Report({
        latitude,
        longitude,
        locationName,
        road_condition_type,
        severity,
        comments
    });
    
    await newReport.save();
    res.status(201).send({ message: 'Report saved successfully!', data: newReport });
  } catch (error) {
    console.error('Error saving report:', error.message);
    res.status(500).send({ message: 'Error saving report' });
  }
});

app.get('/api/reports', async (req, res) => {
  try {
    const reports = await Report.find({});
    res.status(200).send(reports);
  } catch (error) {
    res.status(500).send({ message: 'Error fetching reports' });
  }
});

// THIS IS THE ONLY LINE THAT CHANGED
app.listen(port, '0.0.0.0', () => {
  console.log(`Server listening on port ${port}`);
});