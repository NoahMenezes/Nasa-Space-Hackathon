# 🚀 START HERE - First Time Setup

Welcome to the NASA Space Hackathon Project! This guide will get you running in **10 minutes**.

---

## ⚡ Quick Start (For Team Members)

### Prerequisites
- ✅ Node.js v16+ installed
- ✅ PostgreSQL v12+ installed
- ✅ Git installed

### 🎯 5-Step Setup

#### Step 1: Clone the Repository
```bash
git clone https://github.com/your-username/Nasa-Space-Hackathon.git
cd Nasa-Space-Hackathon
```

#### Step 2: Install PostgreSQL & Create Database
```bash
# Connect to PostgreSQL
psql -U postgres

# Run these SQL commands:
CREATE DATABASE nasa_hackathon;
\q
```

**Remember your PostgreSQL password!** You'll need it in Step 3.

#### Step 3: Configure Backend
```bash
cd backend

# Create .env file and add these lines:
```

Create a file named `.env` in the `backend` folder with this content:

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

**⚠️ IMPORTANT:** Replace `YOUR_POSTGRESQL_PASSWORD_HERE` with your actual PostgreSQL password!

#### Step 4: Install Dependencies & Test Database
```bash
# Install backend dependencies
npm install

# Test database connection
npm run test-db
```

If you see ✅ marks, you're good to go! If not, see [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

#### Step 5: Start Everything
```bash
# Terminal 1 - Backend (from backend folder)
npm run dev
# Wait for: ✅ Database initialization completed

# Terminal 2 - Load Experiments Data (from backend folder)
npm run migrate-experiments
# Wait for: 🎉 Experiments migration completed successfully!

# Terminal 3 - Frontend (from project root)
cd ..
npm install
npm start
```

Browser opens at http://localhost:3000 automatically! 🎉

---

## ✅ Verify Everything Works

### Test 1: Backend
Open: http://localhost:5000/api/health

Should see:
```json
{
  "status": "OK",
  "message": "NASA Space Hackathon Backend with ML API is running!"
}
```

### Test 2: Frontend
Should automatically open at: http://localhost:3000

### Test 3: Search Engine
1. Click "Search Engine" in navigation
2. Search for: `microgravity`
3. Click any result
4. Click "Analyze with Gemini AI"
5. Wait ~40 seconds for AI analysis

If all 3 tests pass: **YOU'RE READY! 🚀**

---

## 🆘 Common Issues

### "Cannot connect to database"
**Fix:** PostgreSQL not running
```bash
# Windows: Open Services and start PostgreSQL
# macOS: brew services start postgresql@14
# Linux: sudo systemctl start postgresql
```

### "Password authentication failed"
**Fix:** Wrong password in `.env` file
- Open `backend/.env`
- Update `DB_PASSWORD` with correct PostgreSQL password

### "Database does not exist"
**Fix:** Create the database
```bash
psql -U postgres -c "CREATE DATABASE nasa_hackathon;"
```

### Still stuck?
Run this diagnostic:
```bash
cd backend
npm run test-db
```

This will tell you exactly what's wrong!

For detailed troubleshooting: [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

---

## 📚 Full Documentation

- **[TEAM_SETUP_GUIDE.md](TEAM_SETUP_GUIDE.md)** - Detailed setup instructions
- **[QUICK_START_EXPERIMENTS.md](QUICK_START_EXPERIMENTS.md)** - Experiments search feature
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Fix common errors
- **[README.md](README.md)** - Full project documentation

---

## 🎯 Daily Workflow

### Starting Work
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
npm start
```

### Stopping Work
Press `Ctrl + C` in both terminals

---

## 🏗️ Project Structure

```
Nasa-Space-Hackathon/
├── backend/               # Node.js backend
│   ├── .env              # YOUR CREDENTIALS (create this!)
│   ├── config/           # Database config
│   ├── routes/           # API endpoints
│   ├── services/         # Gemini AI service
│   └── server.js         # Main server
├── src/                  # React frontend
│   └── components/       # React components
├── package.json          # Frontend dependencies
└── README.md            # Main documentation
```

---

## 🚀 Features You Just Installed

### Search Engine
- Search NASA bioscience experiments by name
- Search by scientist name
- Fast full-text search

### AI Analysis (Gemini 2.0)
- Executive Summary
- Experiment Details
- Key Findings
- Biological Impacts
- Knowledge Graph
- Practical Applications
- Research Connections
- Visual Insights
- Future Research

### Other Features
- User Authentication
- 3D Space Background
- Responsive Design
- Real-time ML Predictions

---

## 💡 Quick Tips

### Example Searches
- **Topics:** microgravity, bone loss, muscle, cell, DNA, radiation
- **Scientists:** Ruth K Globus, Joshua S Alwood, Eduardo A C Almeida

### Database Info
- **Name:** nasa_hackathon (one database for everything)
- **Tables:** Created automatically on first backend start
- **Data:** Loaded via `npm run migrate-experiments`

### Ports
- **Backend:** http://localhost:5000
- **Frontend:** http://localhost:3000

---

## 🎓 Learning Resources

- PostgreSQL Docs: https://www.postgresql.org/docs/
- Node.js Docs: https://nodejs.org/docs/
- React Docs: https://react.dev/
- Express.js: https://expressjs.com/

---

## 🤝 Contributing

### Before Making Changes
```bash
git pull origin main
```

### After Making Changes
```bash
git add .
git commit -m "Description of your changes"
git push origin main
```

### Best Practice: Use Feature Branches
```bash
git checkout -b feature/your-feature-name
# Make changes
git add .
git commit -m "Add your feature"
git push origin feature/your-feature-name
# Create Pull Request on GitHub
```

---

## ✅ Success Checklist

You're ready when:
- [ ] Backend starts without errors
- [ ] Frontend loads in browser
- [ ] Health check works (http://localhost:5000/api/health)
- [ ] Search page loads
- [ ] Search returns results
- [ ] AI analysis works

---

## 🎉 You're All Set!

**What you can do now:**
- Browse NASA experiments
- Search by topic or scientist
- Get AI-powered analysis of experiments
- Explore 3D space visualizations
- Build new features

**Need help?** Ask the team or check the troubleshooting guide!

**Happy coding! 🚀✨**

---

## 📞 Support

Having issues? Check these files:
1. [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Fix common errors
2. [TEAM_SETUP_GUIDE.md](TEAM_SETUP_GUIDE.md) - Detailed setup
3. Run `npm run test-db` to diagnose database issues

**Welcome to the team! Let's build something amazing! 🌟**