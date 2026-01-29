const express = require("express");
const auth = require("../middleware/auth");
const StudentProfile = require("../models/StudentProfile");
const RecruiterProfile = require("../models/RecruiterProfile");

const router = express.Router();

// GET STUDENT PROFILE
router.get("/student", auth, async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Access denied" });
    }

    let profile = await StudentProfile.findOne({ user: req.user.id }).populate("user", "name email");
    
    if (!profile) {
      // Return empty profile structure
      return res.json({
        user: { name: "", email: "" },
        phoneNumber: "",
        collegeName: "",
        degree: "",
        branch: "",
        graduationYear: "",
        skills: [],
        resume: null
      });
    }

    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE STUDENT PROFILE
router.put("/student", auth, async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { phoneNumber, collegeName, degree, branch, graduationYear, skills } = req.body;

    let profile = await StudentProfile.findOne({ user: req.user.id });

    if (!profile) {
      profile = new StudentProfile({
        user: req.user.id,
        phoneNumber,
        collegeName,
        degree,
        branch,
        graduationYear,
        skills: Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim()).filter(s => s)
      });
    } else {
      profile.phoneNumber = phoneNumber || profile.phoneNumber;
      profile.collegeName = collegeName || profile.collegeName;
      profile.degree = degree || profile.degree;
      profile.branch = branch || profile.branch;
      profile.graduationYear = graduationYear || profile.graduationYear;
      if (skills) {
        profile.skills = Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim()).filter(s => s);
      }
    }

    await profile.save();
    await profile.populate("user", "name email");
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPLOAD STUDENT RESUME (simplified - just store filename for now)
router.post("/student/resume", auth, async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { filename, mimetype } = req.body;

    let profile = await StudentProfile.findOne({ user: req.user.id });

    if (!profile) {
      profile = new StudentProfile({ user: req.user.id });
    }

    profile.resume = {
      filename: filename || "resume.pdf",
      path: `/resumes/${req.user.id}/${filename}`,
      mimetype: mimetype || "application/pdf"
    };

    await profile.save();
    res.json({ message: "Resume uploaded successfully", resume: profile.resume });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET RECRUITER PROFILE
router.get("/recruiter", auth, async (req, res) => {
  try {
    if (req.user.role !== "recruiter") {
      return res.status(403).json({ message: "Access denied" });
    }

    let profile = await RecruiterProfile.findOne({ user: req.user.id }).populate("user", "name email");
    
    if (!profile) {
      return res.json({
        user: { name: "", email: "" },
        companyName: "",
        companyWebsite: "",
        companyDescription: "",
        hrName: "",
        contactEmail: "",
        location: "",
        companyLogo: null
      });
    }

    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE RECRUITER PROFILE
router.put("/recruiter", auth, async (req, res) => {
  try {
    if (req.user.role !== "recruiter") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { companyName, companyWebsite, companyDescription, hrName, contactEmail, location } = req.body;

    let profile = await RecruiterProfile.findOne({ user: req.user.id });

    if (!profile) {
      profile = new RecruiterProfile({
        user: req.user.id,
        companyName,
        companyWebsite,
        companyDescription,
        hrName,
        contactEmail,
        location
      });
    } else {
      profile.companyName = companyName || profile.companyName;
      profile.companyWebsite = companyWebsite || profile.companyWebsite;
      profile.companyDescription = companyDescription || profile.companyDescription;
      profile.hrName = hrName || profile.hrName;
      profile.contactEmail = contactEmail || profile.contactEmail;
      profile.location = location || profile.location;
    }

    await profile.save();
    await profile.populate("user", "name email");
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
