const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/jobs", require("./routes/jobs"));
app.use("/api/applications", require("./routes/applications"));
app.use("/api/profiles", require("./routes/profiles"));

// MongoDB Connection
mongoose
	.connect(
		process.env.MONGODB_URI || "mongodb://localhost:27017/job-portal",
		{
			useNewUrlParser: true,
			useUnifiedTopology: true,
		},
	)
	.then(() => console.log("MongoDB Connected"))
	.catch((err) => console.error("MongoDB connection error:", err));

// 🚀 IMPORTANT PART
const PORT = process.env.PORT || 5000;

// Only listen locally (NOT on Vercel)
if (process.env.NODE_ENV !== "production") {
	app.listen(PORT, () => {
		console.log(`Server running on port ${PORT}`);
	});
}

// Export for Vercel
module.exports = app;
