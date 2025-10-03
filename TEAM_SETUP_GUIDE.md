# Team Setup Guide - NASA Space Hackathon Project 🚀

This guide is for team members who are cloning this repository for the first time.

---

## Prerequisites

Before you start, make sure you have these installed:

### 1. Node.js (v16 or higher)
- **Download:** https://nodejs.org/
- **Verify installation:**
  ```bash
  node --version
  npm --version
  ```

### 2. PostgreSQL (v12 or higher)
Choose your operating system:

#### Windows
1. **Download:** https://www.postgresql.org/download/windows/
2. **Install:** Use the installer with default settings
3. **Remember:** The password you set for the `postgres` user during installation
4. **Default port:** 5432

#### macOS
```bash
# Using Homebrew
brew install postgresql@14
brew services start postgresql@14
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 3. Git
- **Download:** https://git-scm.com/downloads
- **Verify:**
  ```bash
  git --version
  ```

---

## Step-by-Step Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-username/Nasa-Space-Hackathon.git
cd Nasa-Space-Hackathon
```

### Step 2: Set Up PostgreSQL Database

#### A. Connect to PostgreSQL

**Windows (using pgAdmin or Command Prompt):**
```bash
# Open Command Prompt and run:
psql -U postgres
# Enter the password you set during installation
```

**macOS/Linux:**
```bash
# Connect as postgres user
sudo -u postgres psql
# OR
psql -U postgres
```

#### B. Create Database and User

Once connected to PostgreSQL, run these commands:

```sql
-- Create the database
CREATE DATABASE nasa_hackathon;

-- Create a user (change password to something secure)
CREATE USER nasa_user WITH ENCRYPTED PASSWORD 'your_secure_password';

-- Grant all privileges
GRANT ALL PRIVILEGES ON DATABASE nasa_hackathon TO nasa_user;

-- Exit PostgreSQL
\q
```

**Important:** Remember the password you set! You'll need it in Step 4.

#### C. Verify Database Creation

```bash
# List all databases
psql -U postgres -c "\l"

# You should see nasa_hackathon in the list
```

### Step 3: Install Project Dependencies

#### A. Install Frontend Dependencies
```bash
# From the project root directory
npm install
```

#### B. Install Backend Dependencies
```bash
cd backend
npm install
```

### Step 4: Configure Environment Variables

#### A. Create Backend .env File

```bash
# Make sure you're in the backend directory
cd backend

# Copy the example env file (if it exists)
# Or create a new .env file
```

#### B. Edit the .env File

Create/edit `backend/.env` with the following content:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key_2024_change_this

# Gemini AI Configuration
GEMINI_API_KEY=AIzaSyDjxUzJ6sod7d9QvOoJ8WcQn4r9YF5Iyws

# ML Model API Integration (if using)
ML_API_BASE_URL=http://localhost:8000
ML_API_KEY=your_ml_api_key_if_required

# PostgreSQL Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nasa_hackathon
DB_USER=postgres
DB_PASSWORD=your_secure_password

# File Upload & Security
MAX_FILE_SIZE=52428800
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**⚠️ IMPORTANT:** 
- Change `DB_PASSWORD` to match the password you set in Step 2
- If you created a `nasa_user`, use:
  - `DB_USER=nasa_user`
  - `DB_PASSWORD=your_secure_password` (from Step 2B)

### Step 5: Initialize Database Tables

The database tables will be created automatically when you start the backend server.

```bash
# From the backend directory
npm run dev
```

**Expected Output:**
```
🐘 Connected to PostgreSQL database
📊 Database tables initialized successfully
✅ Database initialization completed
🚀 NASA Space Hackathon Backend running on port 5000
```

If you see these messages, the database is set up correctly! 🎉

**If you see errors:**
- Check your PostgreSQL is running
- Verify the credentials in `.env` file
- Make sure the database `nasa_hackathon` exists

### Step 6: Load Experiments Data

**Keep the backend server running** and open a NEW terminal:

```bash
cd backend
npm run migrate-experiments
```

This will load all NASA experiments into the database (~30 seconds).

**Expected Output:**
```
🚀 Starting experiments migration...
✅ Experiments table created
✅ Indexes created
📊 Found XXXX experiments in CSV
✅ Inserted XXX/XXXX experiments
🎉 Experiments migration completed successfully!
```

### Step 7: Start Frontend

Open a NEW terminal (keep backend running):

```bash
# From the project root directory
cd ..
npm start
```

The browser should open automatically at `http://localhost:3000`

---

## Verify Everything Works

### Test 1: Backend Health Check
Open browser: `http://localhost:5000/api/health`

Should see:
```json
{
  "status": "OK",
  "message": "NASA Space Hackathon Backend with ML API is running!",
  ...
}
```

### Test 2: Frontend Loads
Browser should show the NASA Space Hackathon homepage at `http://localhost:3000`

### Test 3: Search Engine
1. Click "Search Engine" in the navigation
2. Search for "microgravity"
3. Should see experiment results

### Test 4: AI Analysis
1. Click on any experiment from search results
2. Click "Analyze with Gemini AI"
3. Wait ~30-60 seconds
4. Should see comprehensive analysis

---

## Common Issues & Solutions

### Issue 1: "Cannot connect to database"

**Symptoms:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solutions:**
1. **Check PostgreSQL is running:**
   - Windows: Check Services (search "Services" in Start menu)
   - macOS: `brew services list`
   - Linux: `sudo systemctl status postgresql`

2. **Start PostgreSQL:**
   - Windows: Start from Services or run `pg_ctl start`
   - macOS: `brew services start postgresql@14`
   - Linux: `sudo systemctl start postgresql`

3. **Check port 5432 is available:**
   ```bash
   # Windows
   netstat -an | findstr 5432
   
   # macOS/Linux
   lsof -i :5432
   ```

### Issue 2: "Password authentication failed"

**Solutions:**
1. Double-check password in `.env` file matches PostgreSQL password
2. Try connecting manually:
   ```bash
   psql -U postgres -d nasa_hackathon
   # If this fails, your credentials are wrong
   ```

3. Reset PostgreSQL password:
   ```bash
   # Connect as superuser
   psql -U postgres
   
   # Change password
   ALTER USER postgres PASSWORD 'new_password';
   ```

### Issue 3: "Database nasa_hackathon does not exist"

**Solution:**
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE nasa_hackathon;

# Verify
\l
\q
```

### Issue 4: "Module not found"

**Solution:**
```bash
# Reinstall all dependencies
npm install

cd backend
npm install
```

### Issue 5: Port 3000 or 5000 already in use

**Solution:**
```bash
# Windows - Find and kill process
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9
lsof -ti:5000 | xargs kill -9
```

Or change ports in `.env`:
```env
PORT=5001  # Change backend port
```

For frontend, edit `package.json` or set environment variable:
```bash
PORT=3001 npm start
```

### Issue 6: Experiments search returns no results

**Solution:**
Run the migration again:
```bash
cd backend
npm run migrate-experiments
# Answer "yes" to clear and reload
```

---

## Project Structure

```
Nasa-Space-Hackathon/
├── backend/                    # Backend server
│   ├── config/
│   │   └── database.js        # Database configuration
│   ├── data/
│   │   └── expts_authors_links.csv  # Experiments data
│   ├── middleware/
│   │   └── auth.js            # Authentication middleware
│   ├── routes/
│   │   ├── auth.js            # Auth endpoints
│   │   ├── experiments.js     # Search & analysis endpoints
│   │   ├── nasa.js            # ML endpoints
│   │   └── users.js           # User endpoints
│   ├── scripts/
│   │   ├── migrate.js         # Main migration
│   │   └── migrate-experiments.js  # Experiments migration
│   ├── services/
│   │   └── geminiService.js   # Gemini AI integration
│   ├── .env                   # YOUR CREDENTIALS (create this)
│   ├── package.json
│   └── server.js              # Main server file
├── src/                       # Frontend React app
│   ├── components/
│   │   ├── Background.js
│   │   ├── ExperimentDetails.js    # Experiment details page
│   │   ├── HomePage.js
│   │   ├── LoginPage.js
│   │   ├── Navbar.js
│   │   ├── SearchEngine.js         # Search page
│   │   └── ...
│   ├── App.js
│   └── index.js
├── package.json
└── README.md
```

---

## Running the Project (Daily Workflow)

### Start Everything
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend (new terminal)
npm start

# Browser opens automatically at localhost:3000
```

### Stop Everything
Press `Ctrl + C` in both terminals

---

## Working with Git

### Before Making Changes
```bash
git pull origin main
```

### After Making Changes
```bash
git add .
git commit -m "Your descriptive commit message"
git push origin main
```

### Create a Feature Branch (Recommended)
```bash
git checkout -b feature/your-feature-name
# Make your changes
git add .
git commit -m "Add your feature"
git push origin feature/your-feature-name
# Create Pull Request on GitHub
```

---

## Database Schema Quick Reference

### Users Table
```sql
id, username, email, password, created_at, updated_at
```

### Experiments Table
```sql
id, title, authors, link, created_at, updated_at
```

### Experiment Analyses Table
```sql
id, experiment_id, analysis_data (JSONB), created_at, updated_at
```

### ML Predictions Table
```sql
id, user_id, model_type, input_data (JSONB), prediction_result (JSONB), confidence_score, processing_time, created_at
```

---

## API Endpoints Quick Reference

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Experiments
- `POST /api/experiments/search` - Search experiments
- `GET /api/experiments/:id` - Get experiment details
- `POST /api/experiments/:id/analyze` - Analyze with AI

### ML
- `GET /api/ml/models` - Get available models
- `POST /api/ml/classify` - Classify data
- `GET /api/ml/health` - Check ML API status

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/favorites` - Get favorites

---

## Environment Variables Explained

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Backend server port | `5000` |
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_NAME` | Database name | `nasa_hackathon` |
| `DB_USER` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | `your_password` |
| `JWT_SECRET` | Secret key for JWT tokens | Random string |
| `GEMINI_API_KEY` | Google Gemini API key | Provided in .env |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |

---

## Need Help?

### Quick Checks
1. ✅ Is PostgreSQL running?
2. ✅ Is the database created?
3. ✅ Are credentials correct in `.env`?
4. ✅ Did you run `npm install` in both root and backend?
5. ✅ Did you run the experiments migration?

### Still Stuck?
1. Check console errors in browser (F12)
2. Check terminal output for error messages
3. Review this guide step-by-step
4. Ask a teammate who has it working
5. Check the main `README.md` file

---

## Success Checklist

You're all set when you can:

- [ ] Backend starts without errors
- [ ] Frontend opens in browser
- [ ] Search page loads (`/search`)
- [ ] Search returns results
- [ ] Click on experiment shows details
- [ ] AI analysis generates report
- [ ] All pages load correctly

**Congratulations! You're ready to contribute! 🎉🚀**

---

## Additional Resources

- **PostgreSQL Documentation:** https://www.postgresql.org/docs/
- **Node.js Documentation:** https://nodejs.org/docs/
- **React Documentation:** https://react.dev/
- **Express.js Guide:** https://expressjs.com/
- **Gemini API Docs:** https://ai.google.dev/docs

---

**Welcome to the team! Happy coding! 🚀✨**