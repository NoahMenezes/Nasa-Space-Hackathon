# NASA Space Hackathon - Setup Checklist ✓

Print this and check off each step as you complete it!

---

## 📋 PREREQUISITES

- [ ] Node.js v16+ installed (`node --version`)
- [ ] PostgreSQL v12+ installed
- [ ] Git installed
- [ ] Repository cloned to your computer

---

## 🗄️ DATABASE SETUP

### Install PostgreSQL (if not installed)

**Windows:**
- [ ] Download from postgresql.org
- [ ] Run installer with default settings
- [ ] **WRITE DOWN YOUR PASSWORD:** ___________________

**macOS:**
- [ ] Run: `brew install postgresql@14`
- [ ] Run: `brew services start postgresql@14`

**Linux:**
- [ ] Run: `sudo apt install postgresql postgresql-contrib`
- [ ] Run: `sudo systemctl start postgresql`

### Create Database

- [ ] Open terminal/command prompt
- [ ] Run: `psql -U postgres`
- [ ] Enter your PostgreSQL password
- [ ] Run: `CREATE DATABASE nasa_hackathon;`
- [ ] Run: `\q` to exit
- [ ] ✅ Database created!

---

## 📁 PROJECT SETUP

### 1. Clone Repository (if not done)
- [ ] Run: `git clone <repository-url>`
- [ ] Run: `cd Nasa-Space-Hackathon`

### 2. Install Frontend Dependencies
- [ ] From project root, run: `npm install`
- [ ] Wait for installation to complete
- [ ] ✅ Frontend dependencies installed!

### 3. Install Backend Dependencies
- [ ] Run: `cd backend`
- [ ] Run: `npm install`
- [ ] Wait for installation to complete
- [ ] ✅ Backend dependencies installed!

---

## ⚙️ CONFIGURATION

### Create .env File

- [ ] Make sure you're in `backend` folder
- [ ] Create new file named `.env` (exactly, with the dot)
- [ ] Copy the template below into the file
- [ ] **Replace `YOUR_POSTGRESQL_PASSWORD_HERE`** with your actual password

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

JWT_SECRET=your_super_secret_jwt_key_2024
GEMINI_API_KEY=AIzaSyDjxUzJ6sod7d9QvOoJ8WcQn4r9YF5Iyws

DB_HOST=localhost
DB_PORT=5432
DB_NAME=nasa_hackathon
DB_USER=postgres
DB_PASSWORD=YOUR_POSTGRESQL_PASSWORD_HERE

MAX_FILE_SIZE=52428800
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

- [ ] ✅ .env file created and configured!

---

## 🧪 TEST DATABASE CONNECTION

- [ ] From `backend` folder, run: `npm run test-db`
- [ ] Look for green ✅ marks
- [ ] If you see ❌ errors, fix them before continuing
- [ ] ✅ Database connection successful!

**Common fixes if test fails:**
- PostgreSQL not running → Start it from Services
- Wrong password → Update .env file
- Database doesn't exist → Create it (see above)

---

## 🚀 START THE APPLICATION

### Terminal 1: Start Backend

- [ ] Open first terminal
- [ ] Navigate to: `cd backend`
- [ ] Run: `npm run dev`
- [ ] Wait for message: `✅ Database initialization completed`
- [ ] **KEEP THIS TERMINAL OPEN**
- [ ] ✅ Backend running!

### Terminal 2: Load Experiments Data

- [ ] Open second terminal
- [ ] Navigate to: `cd backend`
- [ ] Run: `npm run migrate-experiments`
- [ ] Wait for: `🎉 Experiments migration completed successfully!`
- [ ] **You can close this terminal after it's done**
- [ ] ✅ Experiments data loaded!

### Terminal 3: Start Frontend

- [ ] Open third terminal
- [ ] Navigate to project root: `cd ..` (if in backend folder)
- [ ] Run: `npm start`
- [ ] Browser should open automatically
- [ ] **KEEP THIS TERMINAL OPEN**
- [ ] ✅ Frontend running!

---

## ✅ VERIFICATION

### Test 1: Backend Health Check
- [ ] Open browser: http://localhost:5000/api/health
- [ ] Should see JSON with `"status": "OK"`
- [ ] ✅ Backend working!

### Test 2: Frontend Homepage
- [ ] Open browser: http://localhost:3000
- [ ] Should see NASA Space Hackathon homepage
- [ ] ✅ Frontend working!

### Test 3: Search Engine
- [ ] Click "Search Engine" in navigation
- [ ] Type: `microgravity`
- [ ] Press Search button
- [ ] Should see experiment results
- [ ] ✅ Search working!

### Test 4: AI Analysis
- [ ] Click any experiment from search results
- [ ] Click "Analyze with Gemini AI" button
- [ ] Wait 30-60 seconds
- [ ] Should see comprehensive analysis
- [ ] ✅ AI analysis working!

---

## 🎉 SUCCESS!

If all checkboxes above are checked, you're ready to develop!

**Your setup is complete when:**
- ✅ Backend runs without errors
- ✅ Frontend loads in browser
- ✅ Can search experiments
- ✅ Can analyze experiments with AI
- ✅ No error messages in terminals

---

## 🆘 IF SOMETHING BREAKS

1. **Run diagnostic test:**
   ```bash
   cd backend
   npm run test-db
   ```

2. **Check these files:**
   - TROUBLESHOOTING.md - Common errors and fixes
   - TEAM_SETUP_GUIDE.md - Detailed setup instructions
   - START_HERE.md - Quick start guide

3. **Common quick fixes:**
   - Stop everything (Ctrl+C in all terminals)
   - Check PostgreSQL is running
   - Verify .env password is correct
   - Restart backend and frontend

---

## 📝 NOTES

**Write down important info here:**

PostgreSQL Password: _____________________

Project Location: _____________________

Team Member Name: _____________________

Date Setup Completed: _____________________

**Issues Encountered:**
_____________________
_____________________
_____________________

**How I Fixed Them:**
_____________________
_____________________
_____________________

---

## 🔄 DAILY STARTUP (After Initial Setup)

Quick checklist for starting work each day:

- [ ] Open Terminal 1: `cd backend && npm run dev`
- [ ] Open Terminal 2: `npm start` (from root)
- [ ] Open browser: http://localhost:3000
- [ ] Start coding! 🚀

**To stop:** Press Ctrl+C in both terminals

---

## 🎯 YOU'RE READY!

Welcome to the team! Time to build something amazing! 🌟

**Questions?** Ask the team or check the documentation files!

**Happy coding! 🚀✨**