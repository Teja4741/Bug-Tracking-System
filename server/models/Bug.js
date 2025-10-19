const mongoose = require('mongoose');

const bugSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  language: { type: String, required: true },
  image: { type: String, default: '' },
  assignedTo: { type: String, required: true },
  createdBy: { type: String, required: true },
  solutionCode: { type: String, default: '' },
  status: {
    type: String,
    enum: ['assigned', 'in-progress', 'resolved', 'closed'],
    default: 'assigned',
  },
  createdAt: { type: Date, default: Date.now }
}, { collection: 'bugs' });

module.exports = mongoose.model('Bug', bugSchema);
