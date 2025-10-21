require('dotenv').config(); // <-- Loads .env at the very top

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '..', 'public')));

// Serve root page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Import your API routes
const bugRoutes = require('./routes/temp');
const registerRoutes = require('./routes/register');
const authRoutes = require('./routes/auth');

app.use('/api', bugRoutes);
app.use('/api', registerRoutes);
app.use('/api', authRoutes);

// MongoDB Atlas connection string
const mongoUrl = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bugtracker';
console.log('MongoDB URI:', mongoUrl);

mongoose.connect(mongoUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));

// Fallback route for SPA or direct navigations on pages
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
