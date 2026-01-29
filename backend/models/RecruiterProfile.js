const mongoose = require('mongoose');

const recruiterProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  companyName: String,
  companyWebsite: String,
  companyDescription: String,
  hrName: String,
  contactEmail: String,
  location: String,
  companyLogo: {
    filename: String,
    path: String,
    mimetype: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('RecruiterProfile', recruiterProfileSchema);
