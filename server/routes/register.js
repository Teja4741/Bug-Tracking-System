const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const StaffMember = require('../models/StaffMember');

router.post('/register', async (req, res) => {
  const { username, email, password, phone, age, experience, role, domain } = req.body;

  try {
    // Check for existing username or email
    const existingUser = await StaffMember.findOne({
      $or: [{ username }, { email }]
    });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Username or Email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new StaffMember({
      username,
      email,
      password: hashedPassword,
      phone,
      age,
      experience,
      role,
      domain: role === 'developer' ? domain : undefined
    });

    await newUser.save();

    res.status(201).json({ success: true, message: 'User registered successfully.' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
