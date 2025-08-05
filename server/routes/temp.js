const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Bug = require('../models/Bug');
const StaffMember = require('../models/StaffMember');

// Multer setup for image upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Create new bug (assigned by TeamLead) with image upload
router.post('/bugs', upload.single('image'), async (req, res) => {
    try {
        console.log('Received bug assignment request:', req.body);
        if (req.file) {
            console.log('Received file:', req.file);
        }
        // Assuming req.body already contains 'createdBy' (the Team Lead's username)
        const bugData = req.body;
        if (req.file) {
            bugData.image = '/uploads/' + req.file.filename;
        }
        const bug = new Bug(bugData);
        await bug.save();
        res.status(201).json(bug);
    } catch (err) {
        console.error('Error saving bug:', err);
        res.status(400).json({ error: err.message });
    }
});

// Get bugs assigned to specific developer
router.get('/bugs/assigned/:username', async (req, res) => {
    try {
        const bugs = await Bug.find({ assignedTo: req.params.username }).sort({ createdAt: -1 }); // newest first
        res.json(bugs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Submit/Update solution (Assuming solutionCode, keyPoints, feedback fields can be sent in req.body)
router.put('/bugs/solution/:id', async (req, res) => {
    try {
        const bug = await Bug.findByIdAndUpdate(
            req.params.id,
            {
                solutionCode: req.body.solutionCode,
                status: req.body.status || 'resolved',
                keyPoints: req.body.keyPoints,
                feedback: req.body.feedback
            },
            { new: true }
        );
        if (!bug) {
            return res.status(404).json({ message: 'Bug not found.' });
        }
        res.json(bug);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all team leads (original endpoint - mostly redundant now that we have -with-stats)
router.get('/teamleads', async (req, res) => {
    try {
        const teamleads = await StaffMember.find({ role: 'teamlead' });
        res.json(teamleads);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// NEW ROUTE: Get all team leads with assigned bug counts (for manager dashboard)
router.get('/teamleads-with-stats', async (req, res) => {
    try {
        const teamleads = await StaffMember.find({ role: 'teamlead' }).lean(); // .lean() for plain JS objects

        const teamleadStats = await Promise.all(teamleads.map(async (tl) => {
            // Use 'createdBy' field to count bugs assigned by this Team Lead
            const assignedCount = await Bug.countDocuments({ createdBy: tl.username });

            return {
                ...tl, // Spread all existing team lead fields
                bugsAssignedCount: assignedCount // Attach the new count
            };
        }));

        res.json(teamleadStats);
    } catch (err) {
        console.error('Error fetching team lead stats:', err);
        res.status(500).json({ error: err.message });
    }
});


// Get all developers (original endpoint)
router.get('/developers', async (req, res) => {
    try {
        const developers = await StaffMember.find({ role: 'developer' });
        res.json(developers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// NEW ROUTE: Get all developers with bug counts (for manager dashboard)
router.get('/developers-with-stats', async (req, res) => {
    try {
        const developers = await StaffMember.find({ role: 'developer' }).lean(); // .lean() for plain JS objects

        const developerStats = await Promise.all(developers.map(async (dev) => {
            const assignedCount = await Bug.countDocuments({ assignedTo: dev.username });
            const solvedCount = await Bug.countDocuments({ assignedTo: dev.username, status: 'resolved' });

            return {
                ...dev, // Spread all existing developer fields
                assignedBugsCount: assignedCount,
                solvedBugsCount: solvedCount
            };
        }));

        res.json(developerStats);
    } catch (err) {
        console.error('Error fetching developer stats:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get all staff
router.get('/staff', async (req, res) => {
    try {
        const staff = await StaffMember.find({});
        res.json(staff);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all bugs
router.get('/bugs', async (req, res) => {
    try {
        const bugs = await Bug.find({}).sort({ createdAt: -1 });
        res.json(bugs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get bug history (all bugs)
router.get('/bugHistory', async (req, res) => {
    try {
        const bugs = await Bug.find({}).sort({ createdAt: -1 });
        res.json(bugs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete all staff
router.delete('/staff', async (req, res) => {
    try {
        await StaffMember.deleteMany({});
        res.json({ message: 'All staff members deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete all bugs
router.delete('/bugs', async (req, res) => {
    try {
        await Bug.deleteMany({});
        res.json({ message: 'All bugs deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;