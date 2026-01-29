# Job & Internship Portal

A full-stack MERN application for job and internship management with role-based access control.

## Features

- **Two User Roles:**
  - **Student**: View jobs, apply for positions, track application status
  - **Recruiter**: Post jobs, view applicants, update application status

- **Authentication:**
  - JWT-based signup and login
  - Role-based protected routes

- **Student Features:**
  - Register and login
  - View all available jobs
  - Apply for jobs
  - View application status (Applied, Shortlisted, Rejected)

- **Recruiter Features:**
  - Register and login
  - Post new jobs (title, description, skills)
  - View list of applicants for each job
  - Update application status

## Tech Stack

- **Frontend:** React, React Router, Axios
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Authentication:** JWT (JSON Web Tokens)

## Project Structure

```
Job and Internship Portal/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Job.js
│   │   └── Application.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── jobs.js
│   │   └── applications.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── services/
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/job-portal
JWT_SECRET=your-secret-key-change-this-in-production
```

4. Make sure MongoDB is running on your system (or update MONGODB_URI for MongoDB Atlas).

5. Start the backend server:
```bash
npm start
# or for development with auto-reload:
npm run dev
```

The backend server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the React development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Jobs
- `GET /api/jobs` - Get all jobs (public)
- `GET /api/jobs/:id` - Get single job (public)
- `POST /api/jobs` - Post a new job (recruiter only)
- `GET /api/jobs/recruiter/my-jobs` - Get recruiter's jobs (recruiter only)

### Applications
- `POST /api/applications` - Apply for a job (student only)
- `GET /api/applications/student/my-applications` - Get student's applications (student only)
- `GET /api/applications/job/:jobId` - Get applicants for a job (recruiter only)
- `PATCH /api/applications/:id` - Update application status (recruiter only)

## Usage

1. **Sign Up:**
   - Choose your role (Student or Recruiter)
   - Fill in name, email, and password
   - Click "Sign Up"

2. **For Students:**
   - View all available jobs on the dashboard
   - Click "Apply Now" to apply for a job
   - View your applications and their status

3. **For Recruiters:**
   - Click "Post New Job" to create a job posting
   - Fill in job title, description, and skills (comma-separated)
   - Click "View Applicants" on any job to see applicants
   - Update application status using the dropdown

## Notes

- Make sure MongoDB is running before starting the backend
- Update the `JWT_SECRET` in `.env` for production use
- The frontend API base URL is set to `http://localhost:5000/api` - update if needed
- This is a minimal implementation suitable for learning and small projects

## License

This project is open source and available for educational purposes.
