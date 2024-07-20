require('dotenv').config();
const admin = require("firebase-admin");
const serviceAccount = require("./adminsdk-firebase.json");
const express = require('express');
const cors = require('cors');
const { bot } = require('./bot');
const { transfer } = require('./cryptoOperations-bsc');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://panda-kombat-default-rtdb.europe-west1.firebasedatabase.app/"
});

const app = express();
app.use(cors({
  origin: '*', // In production, specify allowed origins
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

const database = admin.database();

// Existing routes...

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app; // For testing purposes