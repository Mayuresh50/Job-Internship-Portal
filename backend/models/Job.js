const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  skills: {
    type: [String],
    required: true
  },
  recruiter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  jobType: {
    type: String,
    enum: ['Internship', 'Full-Time'],
    default: 'Full-Time'
  },
  location: {
    type: String,
    default: 'Remote'
  },
  experience: {
    type: String,
    default: '0-1 years'
  },
  salary: {
    type: String,
    default: 'Not specified'
  },
  companyName: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Job', jobSchema);
