const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const initDB = require('./config/dbInit');
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Serve Static Uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);

// Basic Route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the KnowledgeFeed AI Backend API' });
});

// Initialize DB and start server
async function startServer() {
  try {
    await initDB();
    app.listen(PORT, () => {
      console.log(`MyServer is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to initialize database. Server not started.', error);
    process.exit(1);
  }
}

startServer();
