const mongoose = require('mongoose');

const staffMemberSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  age: { type: Number, required: true },
  experience: { type: Number, required: true },
  role: {
    type: String,
    required: true,
    enum: ['manager', 'developer','teamlead']
  },
  domain: {
    type: String,
    enum: ['java', 'c', 'cpp', 'javascript', 'backend'],
    required: function () {
      return this.role === 'developer';
    },
    validate: {
      validator: function(value) {
        if (this.role === 'developer') {
          return value != null && value !== '';
        }
        return true;
      },
      message: 'Domain is required for developers'
    }
  }
});

module.exports = mongoose.model('StaffMember', staffMemberSchema);
