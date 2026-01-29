# How to Run the Frontend

## Prerequisites
- Node.js (v14 or higher) installed
- npm or yarn package manager
- Backend server running on `http://localhost:5000`

## Steps to Run Frontend

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```
   This will install all required packages including React, React Router, and Axios.

3. **Start the development server:**
   ```bash
   npm start
   ```

4. **The frontend will automatically open in your browser at:**
   ```
   http://localhost:3000
   ```

## Important Notes

- **Make sure the backend is running first!** The frontend connects to `http://localhost:5000/api`
- If port 3000 is already in use, React will ask to use a different port (e.g., 3001)
- The app will automatically reload when you make changes to the code

## Troubleshooting

### Port Already in Use
If port 3000 is busy, you can:
- Use a different port: `PORT=3001 npm start` (Linux/Mac) or `set PORT=3001 && npm start` (Windows)
- Or kill the process using port 3000

### Cannot Connect to Backend
- Ensure backend is running on port 5000
- Check that MongoDB is running
- Verify backend `.env` file has correct configuration

### Module Not Found Errors
- Delete `node_modules` folder and `package-lock.json`
- Run `npm install` again

## Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
