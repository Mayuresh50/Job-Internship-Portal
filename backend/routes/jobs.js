const express = require("express");
const Job = require("../models/Job");
const auth = require("../middleware/auth");

const router = express.Router();

// GET ALL JOBS (requires auth)
router.get("/", auth, async (req, res) => {
  try {
    const jobs = await Job.find().populate("recruiter", "name email").sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST A JOB (Recruiter only)
router.post("/", auth, async (req, res) => {
  try {
    if (req.user.role !== "recruiter") {
      return res.status(403).json({ message: "Only recruiters can post jobs" });
    }

    const { title, description, skills, jobType, location, experience, salary, companyName } = req.body;

    if (!title || !description || !skills || !Array.isArray(skills)) {
      return res.status(400).json({ message: "Please provide title, description, and skills array" });
    }

    const job = await Job.create({
      title,
      description,
      skills,
      jobType: jobType || 'Full-Time',
      location: location || 'Remote',
      experience: experience || '0-1 years',
      salary: salary || 'Not specified',
      companyName: companyName || '',
      recruiter: req.user.id
    });

    await job.populate("recruiter", "name email");
    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE JOB
router.put("/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== "recruiter") {
      return res.status(403).json({ message: "Access denied" });
    }

    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.recruiter.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    const { title, description, skills, jobType, location, experience, salary, companyName } = req.body;

    job.title = title || job.title;
    job.description = description || job.description;
    job.skills = skills || job.skills;
    job.jobType = jobType || job.jobType;
    job.location = location || job.location;
    job.experience = experience || job.experience;
    job.salary = salary || job.salary;
    job.companyName = companyName || job.companyName;

    await job.save();
    await job.populate("recruiter", "name email");
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE JOB
router.delete("/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== "recruiter") {
      return res.status(403).json({ message: "Access denied" });
    }

    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.recruiter.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: "Job deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET RECRUITER'S JOBS
router.get("/recruiter/my-jobs", auth, async (req, res) => {
  try {
    if (req.user.role !== "recruiter") {
      return res.status(403).json({ message: "Access denied" });
    }

    const jobs = await Job.find({ recruiter: req.user.id }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
