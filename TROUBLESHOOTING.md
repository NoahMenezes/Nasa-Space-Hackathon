# Troubleshooting Guide 🔧

Quick fixes for common issues when setting up the project.

---

## Quick Diagnostic Test

Run this first to check your database connection:

```bash
cd backend
npm run test-db
```

This will tell you exactly what's wrong with your setup.

---

## Common Errors & Solutions

### ❌ Error: "Cannot connect to database" / ECONNREFUSED

**Problem:** PostgreSQL is not running.

**Solutions:**

```bash
# Windows
# 1. Check Services (Win + R, type "services.msc")
#    Look for "postgresql-x64-14" and start it
# OR
pg_ctl -D "C:\Program Files\PostgreSQL\14\data" start

# macOS
brew services start postgresql@14
# OR
pg_ctl -D /usr/local/var/postgres start

# Linux
sudo systemctl start postgresql
sudo systemctl enable postgresql  # Auto-start on boot
```

**Verify PostgreSQL is running:**
```bash
# Windows
tasklist | findstr postgres

# macOS/Linux
ps aux | grep postgres
```

---

### ❌ Error: "password authentication failed for user"

**Problem:** Wrong password in `.env` file.

**Solutions:**

1. **Check your `.env` file:**
   ```env
   DB_USER=postgres
   DB_PASSWORD=your_password_here  # This must match PostgreSQL password
   ```

2. **Reset PostgreSQL password:**
   ```bash
   # Connect to PostgreSQL
   psql -U postgres
   
   # Change password
   ALTER USER postgres PASSWORD 'new_password';
   
   # Exit
   \q
   ```

3. **Update `.env` with new password**

---

### ❌ Error: "database nasa_hackathon does not exist"

**Problem:** Database hasn't been created yet.

**Solution:**

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE nasa_hackathon;

# Verify it was created
\l

# Exit
\q
```

Or one-liner:
```bash
psql -U postgres -c "CREATE DATABASE nasa_hackathon;"
```

---

### ❌ Error: ".env file not found" or "DB_PASSWORD is undefined"

**Problem:** Missing or incorrectly placed `.env` file.

**Solution:**

1. Create `.env` file in `backend` folder (NOT in root)
2. File structure should be:
   ```
   Nasa-Space-Hackathon/
   └── backend/
       └── .env  ← HERE
   ```

3. Copy this template:
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
   DB_PASSWORD=YOUR_PASSWORD_HERE
   ```

---

### ❌ Error: "Module not found" / "Cannot find module"

**Problem:** Dependencies not installed.

**Solution:**

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install
```

If still failing:
```bash
# Delete node_modules and reinstall
rm -rf node_modules
rm package-lock.json
npm install
```

---

### ❌ Error: "Port 5000 (or 3000) is already in use"

**Problem:** Another process is using the port.

**Solutions:**

**Option 1: Kill the process**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F

# macOS/Linux
lsof -ti:5000 | xargs kill -9
```

**Option 2: Change the port**
```env
# In backend/.env
PORT=5001
```

---

### ❌ Error: "No experiments found" when searching

**Problem:** Experiments data not loaded.

**Solution:**

```bash
cd backend
npm run migrate-experiments
```

---

### ❌ Error: "Gemini API error" / Analysis fails

**Problem:** API key issue or internet connection.

**Solutions:**

1. **Check API key in `.env`:**
   ```env
   GEMINI_API_KEY=AIzaSyDjxUzJ6sod7d9QvOoJ8WcQn4r9YF5Iyws
   ```

2. **Check internet connection**

3. **Check API quota:** Visit https://makersuite.google.com/

4. **Try again:** First request might time out, subsequent ones work

---

### ❌ Frontend shows blank page

**Problem:** Build issue or wrong URL.

**Solutions:**

1. **Clear browser cache:** Ctrl+Shift+Delete

2. **Check console for errors:** F12 → Console tab

3. **Rebuild:**
   ```bash
   npm start
   ```

4. **Check correct URL:** http://localhost:3000 (not port 5000)

---

### ❌ "relation does not exist" database errors

**Problem:** Database tables not created.

**Solution:**

1. **Stop backend server** (Ctrl+C)

2. **Restart backend:**
   ```bash
   cd backend
   npm run dev
   ```
   
   Tables are created automatically on startup.

3. **Load experiments data:**
   ```bash
   npm run migrate-experiments
   ```

---

### ❌ Backend won't start / crashes immediately

**Checklist:**

1. ✅ PostgreSQL is running?
   ```bash
   npm run test-db
   ```

2. ✅ `.env` file exists in `backend/` folder?

3. ✅ Database `nasa_hackathon` created?
   ```bash
   psql -U postgres -l | grep nasa_hackathon
   ```

4. ✅ Dependencies installed?
   ```bash
   cd backend
   npm install
   ```

5. ✅ Correct Node.js version? (v16+)
   ```bash
   node --version
   ```

---

## Step-by-Step Recovery Process

If nothing works, start fresh:

### 1. Stop everything
```bash
# Press Ctrl+C in all terminals
```

### 2. Check PostgreSQL
```bash
cd backend
npm run test-db
```

### 3. Fix database issues
```bash
# If database doesn't exist:
psql -U postgres -c "CREATE DATABASE nasa_hackathon;"

# If password wrong: Update backend/.env
```

### 4. Reinstall dependencies
```bash
# From project root
npm install

cd backend
npm install
```

### 5. Start backend
```bash
cd backend
npm run dev
```

Wait for: `✅ Database initialization completed`

### 6. Load experiments (new terminal)
```bash
cd backend
npm run migrate-experiments
```

### 7. Start frontend (new terminal)
```bash
# From project root
npm start
```

### 8. Test
- Backend: http://localhost:5000/api/health
- Frontend: http://localhost:3000
- Search: http://localhost:3000/#/search

---

## Verification Checklist

### ✅ PostgreSQL Setup
- [ ] PostgreSQL installed
- [ ] PostgreSQL service running
- [ ] Can connect: `psql -U postgres`
- [ ] Database exists: `\l` shows `nasa_hackathon`

### ✅ Backend Setup
- [ ] `.env` file in `backend/` folder
- [ ] All values in `.env` are correct
- [ ] `node_modules` folder exists in `backend/`
- [ ] Backend starts: `npm run dev`
- [ ] Health check works: http://localhost:5000/api/health

### ✅ Database Tables
- [ ] Tables created (check backend startup logs)
- [ ] Experiments loaded: `npm run migrate-experiments`
- [ ] Test DB: `npm run test-db` passes

### ✅ Frontend Setup
- [ ] `node_modules` folder exists in root
- [ ] Frontend starts: `npm start`
- [ ] Page loads: http://localhost:3000
- [ ] Search page works: http://localhost:3000/#/search

---

## Still Stuck?

1. **Run database test:**
   ```bash
   cd backend
   npm run test-db
   ```

2. **Check logs:**
   - Backend terminal: Look for error messages
   - Browser console (F12): Look for network errors

3. **Verify file structure:**
   ```
   Nasa-Space-Hackathon/
   ├── backend/
   │   ├── .env          ← Must exist with correct values
   │   ├── node_modules/ ← Must exist
   │   └── package.json
   ├── node_modules/     ← Must exist
   └── package.json
   ```

4. **Ask for help with:**
   - Screenshot of error
   - Backend terminal output
   - Output of `npm run test-db`
   - Your operating system

---

## Quick Command Reference

```bash
# Test database connection
cd backend && npm run test-db

# Start backend
cd backend && npm run dev

# Load experiments data
cd backend && npm run migrate-experiments

# Start frontend
npm start

# Check PostgreSQL status
# Windows: services.msc
# macOS: brew services list
# Linux: sudo systemctl status postgresql

# Create database
psql -U postgres -c "CREATE DATABASE nasa_hackathon;"

# Reset PostgreSQL password
psql -U postgres -c "ALTER USER postgres PASSWORD 'newpassword';"
```

---

## Environment Variables Template

Copy this to `backend/.env`:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key_2024

# Gemini AI
GEMINI_API_KEY=AIzaSyDjxUzJ6sod7d9QvOoJ8WcQn4r9YF5Iyws

# PostgreSQL Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nasa_hackathon
DB_USER=postgres
DB_PASSWORD=YOUR_PASSWORD_HERE

# File Upload & Security
MAX_FILE_SIZE=52428800
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Replace:** `YOUR_PASSWORD_HERE` with your actual PostgreSQL password!

---

**Most issues are solved by:**
1. PostgreSQL not running → Start it
2. Wrong password → Update `.env`
3. Database doesn't exist → Create it
4. Missing `.env` → Create it in `backend/` folder

**Good luck! 🚀**