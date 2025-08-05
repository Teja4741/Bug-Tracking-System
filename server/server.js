const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files (frontend) from public folder
app.use(express.static(path.join(__dirname, '..', 'public')));

// Root route serves index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Route Imports
const bugRoutes = require('./routes/temp');        // bug operations
const registerRoutes = require('./routes/register');    // registration
const authRoutes = require('./routes/auth');            // login

// Use Routes with /api prefix
app.use('/api', bugRoutes);
app.use('/api', registerRoutes);
app.use('/api', authRoutes);

// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/bugtracker', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));

// Start Server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
