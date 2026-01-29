const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  phoneNumber: String,
  collegeName: String,
  degree: String,
  branch: String,
  graduationYear: String,
  skills: [String],
  resume: {
    filename: String,
    path: String,
    mimetype: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('StudentProfile', studentProfileSchema);
