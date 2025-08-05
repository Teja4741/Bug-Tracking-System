// ---------------------------------------

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const StaffMember = require('../models/StaffMember');
const Bug = require('../models/Bug');


// Setup multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../public/uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// ---------------------------------------
// LOGIN
// ---------------------------------------
router.post('/login', async (req, res) => {
  const { username, password, role, domain } = req.body;

  try {
    // Read data from data.json
    const data = JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'));

    // Find user by username and role
    const user = data.find(u => u.username === username && u.role === role);
    console.log('User found:', user);
    if (!user) {
      console.log('User not found or role mismatch');
      return res.status(401).json({ success: false, message: 'Invalid username, role, or password' });
    }

    if (role === 'developer') {
      if (!domain || user.domain !== domain) {
        console.log('Domain mismatch for developer');
        return res.status(401).json({ success: false, message: 'Invalid domain for developer' });
      }
    }

    // Compare passwords as plain text (no hashing)
    if (password !== user.password) {
      console.log('Password mismatch');
      return res.status(401).json({ success: false, message: 'Invalid username, role, or password' });
    }

    console.log('Login successful for user:', username);

    res.json({
      success: true,
      user: {
        role: user.role,
        username: user.username,
        domain: user.domain || null
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ---------------------------------------
// GET ALL STAFF (username, role, domain)
// ---------------------------------------
router.get('/staff', async (req, res) => {
  try {
    // Read data from data.json
    const data = JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'));

    // Map to only required fields
    const staffList = data.map(user => ({
      username: user.username,
      email: user.email,
      phone: user.phone,
      age: user.age,
      experience: user.experience,
      role: user.role,
      domain: user.domain || null
    }));

    res.json(staffList);
  } catch (error) {
    console.error('Fetch staff error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch staff members' });
  }
});

// ---------------------------------------
// GET TEAM LEADS
// ---------------------------------------
router.get('/teamleads', async (req, res) => {
  try {
    const leads = await StaffMember.find({ role: 'teamlead' });
    res.json(leads);
  } catch (err) {
    console.error('Fetch team leads error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------
// GET DEVELOPERS
// ---------------------------------------
router.get('/developers', async (req, res) => {
  try {
    const devs = await StaffMember.find({ role: 'developer' });
    res.json(devs);
  } catch (err) {
    console.error('Fetch developers error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------
// CREATE NEW BUG with image upload
// ---------------------------------------
router.post('/bugs', upload.single('image'), async (req, res) => {
  try {
    const { title, description, language, assignedTo, createdBy } = req.body;

    if (!title || !description || !language || !assignedTo || !createdBy) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const developer = await StaffMember.findOne({ username: assignedTo, role: 'developer' });
    if (!developer) {
      return res.status(400).json({ success: false, message: 'Assigned developer not found' });
    }

    let imagePath = '';
    if (req.file) {
      imagePath = '/uploads/' + req.file.filename;
    }

    const bug = new Bug({
      title,
      description,
      language,
      assignedTo,
      createdBy,
      image: imagePath,
      status: 'assigned',
      createdAt: new Date()
    });

    await bug.save();
    res.status(201).json({ success: true, bug });

  } catch (err) {
    console.error('Add bug error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------------------------------------
// GET ALL BUGS
// ---------------------------------------
router.get('/bugs', async (req, res) => {
  try {
    const bugs = await Bug.find();
    res.json(bugs);
  } catch (err) {
    console.error('Fetch bugs error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch bugs' });
  }
});

// ---------------------------------------
// UPDATE BUG
// ---------------------------------------
router.put('/bugs/:id', async (req, res) => {
  try {
    const updated = await Bug.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Bug not found' });
    }
    res.json({ success: true, bug: updated });
  } catch (err) {
    console.error('Update bug error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------------------------------------
// SUBMIT SOLUTION for bug
// ---------------------------------------
router.put('/bugs/solution/:id', async (req, res) => {
  try {
    const { solutionCode, status } = req.body;
    if (!solutionCode || !status) {
      return res.status(400).json({ success: false, message: 'Solution code and status are required' });
    }

    const updated = await Bug.findByIdAndUpdate(
      req.params.id,
      { solutionCode, status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Bug not found' });
    }

    res.json({ success: true, bug: updated });
  } catch (err) {
    console.error('Submit solution error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------------------------------------
// DELETE ALL STAFF
// ---------------------------------------
router.delete('/staff', async (req, res) => {
  try {
    await StaffMember.deleteMany({});
    res.json({ success: true, message: 'All staff members deleted successfully.' });
  } catch (err) {
    console.error('Delete staff error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete staff members.' });
  }
});

// ---------------------------------------
// DELETE ALL BUGS
// ---------------------------------------
router.delete('/bugs', async (req, res) => {
  try {
    await Bug.deleteMany({});
    res.json({ success: true, message: 'All bugs deleted successfully.' });
  } catch (err) {
    console.error('Delete bugs error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete bugs.' });
  }
});

module.exports = router;

module.exports = router;
