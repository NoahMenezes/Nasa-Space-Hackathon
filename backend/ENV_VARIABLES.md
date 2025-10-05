# Backend Environment Variables Documentation

This document describes all environment variables required for the NASA Space Hackathon backend API.

## 🔐 Required Environment Variables

### Supabase Configuration (Authentication)

```env
# Supabase URL - Get this from your Supabase project settings
SUPABASE_URL=https://your-project-id.supabase.co

# Supabase Service Role Key - KEEP THIS SECRET!
# This key bypasses Row Level Security and should NEVER be exposed in frontend
# Get this from: Supabase Dashboard → Settings → API → service_role key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Database Configuration

```env
# PostgreSQL Database Connection String
# Format: postgresql://username:password@host:port/database
DATABASE_URL=postgresql://postgres:your-password@localhost:5432/nasa_hackathon

# Alternative individual database settings
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nasa_hackathon
DB_USER=postgres
DB_PASSWORD=your-password
```

### Server Configuration

```env
# Server Port
PORT=5000

# Node Environment (development, production, test)
NODE_ENV=development

# Frontend URL (for CORS configuration)
FRONTEND_URL=http://localhost:3000
```

### ML/AI API Configuration (Optional)

```env
# Machine Learning API Base URL
ML_API_BASE_URL=http://localhost:8000

# ML API Authentication Key (if required)
ML_API_KEY=your-ml-api-key-here
```

### Gemini API Configuration (for analysis features)

```env
# Google Gemini API Key for experiment analysis
GEMINI_API_KEY=your-gemini-api-key-here
```

---

## 📋 Complete .env Template

Create a `.env` file in the `backend` directory with the following structure:

```env
# ============================================
# SUPABASE AUTHENTICATION
# ============================================
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# ============================================
# DATABASE CONFIGURATION
# ============================================
DATABASE_URL=postgresql://postgres:password@localhost:5432/nasa_hackathon

# ============================================
# SERVER CONFIGURATION
# ============================================
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# ============================================
# ML/AI API CONFIGURATION
# ============================================
ML_API_BASE_URL=http://localhost:8000
ML_API_KEY=

# ============================================
# GEMINI API (for experiment analysis)
# ============================================
GEMINI_API_KEY=your-gemini-api-key-here

# ============================================
# LEGACY (No longer used - kept for reference)
# ============================================
# JWT_SECRET was used for old custom auth - now using Supabase
# JWT_SECRET=nasa_space_hackathon_secret_key
```

---

## 🔑 How to Get Your Credentials

### 1. Supabase Credentials

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Select your project (or create a new one)
3. Click on **Settings** (gear icon) → **API**
4. Copy the following:
   - **URL**: Your project URL
   - **service_role key**: Secret key for backend (⚠️ KEEP SECRET!)

**⚠️ IMPORTANT**: 
- Use `service_role` key in backend (NOT the `anon` key)
- This key bypasses Row Level Security
- NEVER expose this key in frontend code or commit to git

### 2. Database URL

If using Supabase's PostgreSQL database:
1. Go to **Settings** → **Database**
2. Scroll to **Connection string**
3. Select **URI** format
4. Copy the connection string (it will have your password)

If using a separate PostgreSQL instance:
1. Format: `postgresql://username:password@host:port/database`
2. Example: `postgresql://postgres:mypassword@localhost:5432/nasa_db`

### 3. Gemini API Key

1. Go to [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key to `GEMINI_API_KEY`

### 4. ML API Configuration

- If you have a separate ML API service, set its URL
- If running locally, it's typically `http://localhost:8000`
- Add authentication key if required

---

## 🚀 Setup Instructions

### Step 1: Create .env file

```bash
cd backend
touch .env  # On Windows: type nul > .env
```

### Step 2: Copy template

Copy the complete .env template above into your `.env` file.

### Step 3: Replace placeholder values

Replace all `your-*-here` values with your actual credentials.

### Step 4: Verify configuration

```bash
npm run test-db  # Test database connection
npm start        # Start the server
```

### Step 5: Test authentication

```bash
# The backend should log:
# ✅ Database initialization completed
# 🚀 NASA Space Hackathon Backend running on port 5000
```

---

## 🔒 Security Best Practices

### ✅ DO:

1. **Keep .env files private**
   - Never commit to version control
   - Add `.env` to `.gitignore`

2. **Use different keys for different environments**
   - Development keys
   - Staging keys
   - Production keys

3. **Rotate keys regularly**
   - Change service role keys periodically
   - Update API keys every few months

4. **Use environment-specific configurations**
   ```env
   # Development
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   
   # Production
   NODE_ENV=production
   FRONTEND_URL=https://your-domain.com
   ```

5. **Limit key permissions**
   - Use service accounts with minimal permissions
   - Enable RLS on all database tables

### ❌ DON'T:

1. ❌ Don't commit `.env` to git
2. ❌ Don't share service role keys
3. ❌ Don't use production keys in development
4. ❌ Don't hardcode credentials in source code
5. ❌ Don't expose service role key in logs
6. ❌ Don't use the same keys across projects

---

## 🐛 Troubleshooting

### Error: "Missing Supabase environment variables"

**Cause**: Backend can't find `SUPABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY`

**Solution**:
1. Check that `.env` file exists in `backend` directory
2. Verify variables are spelled correctly (case-sensitive)
3. Restart the server after adding variables

### Error: "Database connection failed"

**Cause**: Invalid `DATABASE_URL` or database not running

**Solution**:
1. Verify PostgreSQL is running
2. Check connection string format
3. Test connection: `npm run test-db`
4. Verify credentials are correct

### Error: "Invalid or expired token" in auth middleware

**Cause**: Service role key is incorrect or not set

**Solution**:
1. Verify `SUPABASE_SERVICE_ROLE_KEY` in `.env`
2. Make sure you're using the **service_role** key, not anon key
3. Check for extra spaces or newlines in the key
4. Regenerate key in Supabase dashboard if needed

### Error: "CORS policy blocked"

**Cause**: `FRONTEND_URL` doesn't match actual frontend URL

**Solution**:
1. Update `FRONTEND_URL` in `.env`
2. Restart backend server
3. Check CORS configuration in `server.js`

---

## 📝 Environment-Specific Configurations

### Development

```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000
SUPABASE_URL=https://dev-project.supabase.co
```

### Staging

```env
NODE_ENV=staging
PORT=5000
FRONTEND_URL=https://staging.your-domain.com
SUPABASE_URL=https://staging-project.supabase.co
```

### Production

```env
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-domain.com
SUPABASE_URL=https://prod-project.supabase.co
```

---

## 🔄 Migrating from Old Auth System

If you previously used the custom JWT authentication:

### Variables to Remove:
- `JWT_SECRET` (no longer needed)

### Variables to Add:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### Migration Steps:
1. Add Supabase variables to `.env`
2. Remove or comment out `JWT_SECRET`
3. Restart the backend server
4. Users will need to sign up again with Supabase

---

## 📚 Additional Resources

- [Supabase Environment Variables](https://supabase.com/docs/guides/getting-started/quickstarts/nodejs)
- [Node.js Environment Variables](https://nodejs.org/en/learn/command-line/how-to-read-environment-variables-from-nodejs)
- [dotenv Documentation](https://www.npmjs.com/package/dotenv)

---

## ✅ Verification Checklist

Before running the application, ensure:

- [ ] `.env` file created in `backend` directory
- [ ] `.env` added to `.gitignore`
- [ ] `SUPABASE_URL` set and valid
- [ ] `SUPABASE_SERVICE_ROLE_KEY` set (service_role, not anon)
- [ ] `DATABASE_URL` set and database is accessible
- [ ] `PORT` set (default: 5000)
- [ ] `FRONTEND_URL` matches your frontend URL
- [ ] `GEMINI_API_KEY` set (if using analysis features)
- [ ] Backend starts without errors
- [ ] Authentication endpoints respond correctly

---

## 🎯 Quick Test

Test your configuration:

```bash
# Start backend
cd backend
npm start

# In another terminal, test API health
curl http://localhost:5000/api/health

# Should return:
# {
#   "status": "OK",
#   "message": "NASA Space Hackathon Backend with ML API is running!",
#   ...
# }
```

Test authentication:

```bash
# Login on frontend
# Make an authenticated API call
# Backend should log: ✅ Authenticated user: user@example.com
```

---

**Need help?** Check the [SUPABASE_AUTH_SETUP.md](../SUPABASE_AUTH_SETUP.md) guide or refer to the Troubleshooting section above.