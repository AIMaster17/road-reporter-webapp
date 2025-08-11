const express = require('express');
const mongoose = require('mongoose');

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('public'));

// --- DATABASE CONNECTION ---
const mongoURI = 'mongodb+srv://User-108:Kanha10@road-app-cluster.7ez1xtd.mongodb.net/?retryWrites=true&w=majority&appName=Road-app-cluster';

mongoose.connect(mongoURI)
  .then(() => console.log('Successfully connected to MongoDB Atlas!'))
  .catch(err => console.error('Connection error:', err));

// --- DATA BLUEPRINT (SCHEMA) & MODEL ---
const reportSchema = new mongoose.Schema({
  latitude: Number,
  longitude: Number,
  road_condition_type: String,
  severity: String,
  photo_url: String,
  comments: String,
  timestamp: { type: Date, default: Date.now }
});
const Report = mongoose.model('Report', reportSchema);


// --- API ROUTES ---

// POST Route: SAVES a new report
app.post('/api/reports', async (req, res) => {
  try {
    const newReport = new Report(req.body);
    await newReport.save();
    console.log('Successfully saved a new report:', newReport);
    res.status(201).send({ message: 'Report saved successfully!', data: newReport });
  } catch (error) {
    console.error('Error saving report:', error);
    res.status(500).send({ message: 'Error saving report' });
  }
});

// **** ADD THIS NEW GET ROUTE ****
// GET Route: FETCHES all reports
app.get('/api/reports', async (req, res) => {
  try {
    const reports = await Report.find({}); // .find({}) gets all documents in the collection
    res.status(200).send(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).send({ message: 'Error fetching reports' });
  }
});


// --- START SERVER ---
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});