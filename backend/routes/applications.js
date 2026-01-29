const express = require("express");
const Application = require("../models/Application");
const Job = require("../models/Job");
const StudentProfile = require("../models/StudentProfile");
const auth = require("../middleware/auth");

const router = express.Router();


// ✅ APPLY FOR JOB (Student only)
router.post("/apply/:jobId", auth, async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Only students can apply" });
    }

    const existing = await Application.findOne({
      job: req.params.jobId,
      student: req.user.id,
    });

    if (existing) {
      return res.status(400).json({ message: "Already applied" });
    }

    const application = await Application.create({
      job: req.params.jobId,
      student: req.user.id,
    });

    await application.populate("job", "title description skills");
    await application.populate("student", "name email");
    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ✅ GET APPLICATIONS
router.get("/", auth, async (req, res) => {
  try {
    let applications;

    if (req.user.role === "student") {
      applications = await Application.find({ student: req.user.id })
        .populate("job", "title description skills recruiter jobType location companyName")
        .populate("job.recruiter", "name email")
        .sort({ createdAt: -1 });
    } else {
      applications = await Application.find()
        .populate("job", "title description skills jobType location companyName")
        .populate("student", "name email")
        .sort({ createdAt: -1 });
    }

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ GET APPLICANTS FOR A JOB (Recruiter only)
router.get("/job/:jobId", auth, async (req, res) => {
  try {
    if (req.user.role !== "recruiter") {
      return res.status(403).json({ message: "Access denied" });
    }

    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.recruiter.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    const applications = await Application.find({ job: req.params.jobId })
      .populate("student", "name email")
      .sort({ createdAt: -1 });

    // Get student profiles for each application
    const applicationsWithProfiles = await Promise.all(
      applications.map(async (app) => {
        const profile = await StudentProfile.findOne({ user: app.student._id });
        return {
          ...app.toObject(),
          studentProfile: profile || null
        };
      })
    );

    res.json(applicationsWithProfiles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ✅ UPDATE STATUS (Recruiter only)
router.put("/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== "recruiter") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { status } = req.body;

    if (!['Applied', 'Shortlisted', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const application = await Application.findById(req.params.id).populate("job");
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (application.job.recruiter.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    application.status = status;
    await application.save();
    await application.populate("student", "name email");
    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ WITHDRAW APPLICATION (Student only)
router.delete("/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Access denied" });
    }

    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (application.student.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (application.status !== 'Applied') {
      return res.status(400).json({ message: "Can only withdraw applications with 'Applied' status" });
    }

    await Application.findByIdAndDelete(req.params.id);
    res.json({ message: "Application withdrawn successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
