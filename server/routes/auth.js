const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const StaffMember = require('../models/StaffMember');

router.post('/login', async (req, res) => {
  const { username, password, role } = req.body;

  try {
    const user = await StaffMember.findOne({ username, role });
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    res.status(200).json({ success: true, user: { username: user.username, role: user.role, domain: user.domain } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

module.exports = router;
