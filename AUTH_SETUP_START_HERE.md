# 🚀 Authentication Setup - START HERE

## Welcome to the Supabase Authentication System!

This project now uses **Supabase** for complete and secure authentication. This document will guide you through the setup process.

---

## 📚 Documentation Overview

We've created comprehensive documentation to help you:

| Document | Purpose | When to Read |
|----------|---------|--------------|
| **AUTH_SETUP_START_HERE.md** | Quick start guide | 👈 **Start here!** |
| **SUPABASE_AUTH_SETUP.md** | Complete setup instructions | For detailed setup |
| **AUTHENTICATION_IMPLEMENTATION.md** | Technical architecture | For understanding implementation |
| **AUTH_QUICK_REFERENCE.md** | Code examples | During development |
| **backend/ENV_VARIABLES.md** | Backend env vars | When configuring backend |
| **IMPLEMENTATION_CHECKLIST.md** | Verification checklist | Before deployment |

---

## ⚡ Quick Start (5 Steps)

### Step 1: Create Supabase Account
1. Go to [https://supabase.com](https://supabase.com)
2. Sign up for free
3. Create a new project
4. Wait ~2 minutes for initialization

### Step 2: Get Your Credentials
1. In Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: For frontend
   - **service_role key**: For backend (⚠️ KEEP SECRET!)

### Step 3: Configure Frontend
Create `.env` in the root directory:

```env
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
REACT_APP_API_URL=http://localhost:5000/api
NODE_ENV=development
```

### Step 4: Configure Backend
Create `backend/.env`:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Step 5: Run the Application
```bash
# Terminal 1 - Backend
cd backend
npm install
npm run dev

# Terminal 2 - Frontend
npm install
npm start
```

**Done!** Open `http://localhost:3000` 🎉

---

## 🎯 What's Been Implemented

### ✅ Frontend (React)
- **AuthContext** (`src/contexts/AuthContext.jsx`)
  - Global auth state management
  - useAuth hook for easy access
  - signIn, signUp, signOut methods

- **Protected Routes** (`src/components/ProtectedRoute.jsx`)
  - Automatic redirect to login for unauthenticated users
  - Preserves intended destination

- **Updated Components**
  - LoginPage uses Supabase
  - SignupPage uses Supabase
  - Navbar shows user info & logout button

- **API Integration** (`src/utils/api.js`)
  - Automatic JWT token attachment
  - Auto-logout on 401 errors

### ✅ Backend (Node.js)
- **Authentication Middleware** (`backend/middleware/auth.js`)
  - `authenticateUser`: Required authentication
  - `optionalAuth`: Optional authentication
  - `requireAdmin`: Admin-only access

- **Protected Endpoints**
  - All analysis routes require authentication
  - `/executive-summary` ✅
  - `/experiment-details` ✅
  - `/key-findings` ✅
  - `/biological-impacts` ✅
  - `/knowledge-graph` ✅
  - `/practical-applications` ✅
  - `/research-connections` ✅
  - `/future-research` ✅

---

## 🧪 Test Your Setup

### 1. Test Signup
```
Navigate to: http://localhost:3000/#/signup
Create account with email/password
Check email for confirmation (if enabled)
```

### 2. Test Login
```
Navigate to: http://localhost:3000/#/login
Login with your credentials
You should see your email in navbar
```

### 3. Test Protected Routes
```
Try accessing: http://localhost:3000/#/search
Without login: Redirects to /login ✅
With login: Shows SearchEngine ✅
```

### 4. Test Logout
```
Click "Logout" button in navbar
Should redirect to login page
Cannot access /search anymore ✅
```

---

## 🔐 Important Security Notes

### ✅ DO:
- ✅ Use **anon key** in frontend (REACT_APP_SUPABASE_ANON_KEY)
- ✅ Use **service_role key** in backend (SUPABASE_SERVICE_ROLE_KEY)
- ✅ Add `.env` files to `.gitignore`
- ✅ Enable email confirmation in production
- ✅ Use HTTPS in production

### ❌ DON'T:
- ❌ Never expose service_role key in frontend
- ❌ Never commit .env files to git
- ❌ Don't use production keys in development
- ❌ Don't hardcode credentials in code

---

## 🎨 Using Authentication in Your Code

### Frontend Example
```javascript
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user, loading, signIn, signOut } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      {user ? (
        <>
          <p>Welcome, {user.email}!</p>
          <button onClick={signOut}>Logout</button>
        </>
      ) : (
        <button onClick={() => signIn(email, password)}>Login</button>
      )}
    </div>
  );
}
```

### Backend Example
```javascript
import { authenticateUser } from './middleware/auth.js';

// Protect a route
router.get('/protected', authenticateUser, (req, res) => {
  res.json({ 
    message: `Hello ${req.user.email}`,
    userId: req.user.id 
  });
});
```

---

## 🐛 Troubleshooting

### "Missing Supabase environment variables"
**Solution**: Create `.env` files with correct variables

### "Invalid login credentials"
**Solution**: 
- Check if email needs confirmation
- Verify email/password are correct
- Check Supabase dashboard → Authentication → Users

### "401 Unauthorized" on API calls
**Solution**:
- Make sure you're logged in
- Check backend logs for error details
- Verify service_role key is correct

### Email not received
**Solution**:
- Check spam folder
- Supabase free tier: 3 emails/hour limit
- Set up custom SMTP for production

---

## 📖 Need More Help?

- **Detailed Setup**: See `SUPABASE_AUTH_SETUP.md`
- **Code Examples**: See `AUTH_QUICK_REFERENCE.md`
- **Architecture**: See `AUTHENTICATION_IMPLEMENTATION.md`
- **Environment Vars**: See `backend/ENV_VARIABLES.md`
- **Supabase Docs**: https://supabase.com/docs

---

## 🎯 Architecture Overview

```
Frontend (React)                    Backend (Node.js)
┌─────────────────┐                ┌──────────────────┐
│  AuthContext    │                │  Middleware      │
│  - signIn()     │                │  - verifyJWT     │
│  - signUp()     │    JWT Token   │  - attach user   │
│  - signOut()    │ ──────────────>│  - protect route │
│  - useAuth()    │                │                  │
└─────────────────┘                └──────────────────┘
        ↓                                   ↓
┌─────────────────┐                ┌──────────────────┐
│ ProtectedRoute  │                │  Protected API   │
│  - Check auth   │                │  /api/ml/*       │
│  - Redirect     │                │  /key-findings   │
└─────────────────┘                │  /knowledge-graph│
                                   └──────────────────┘
        ↓                                   ↓
    Supabase Auth                    Supabase Admin
    (anon key)                      (service_role key)
```

---

## ✅ Pre-Flight Checklist

Before running the app, ensure:

- [ ] Supabase project created
- [ ] Frontend `.env` configured
- [ ] Backend `.env` configured
- [ ] Dependencies installed (`npm install`)
- [ ] Backend running (`npm run dev`)
- [ ] Frontend running (`npm start`)
- [ ] Can access `http://localhost:3000`
- [ ] Can sign up a new user
- [ ] Can log in
- [ ] Protected routes work
- [ ] Can log out

---

## 🚀 You're Ready!

Once you complete the 5 steps above, your authentication system is fully functional!

**What you get:**
- ✅ Secure user authentication
- ✅ Protected routes (frontend & backend)
- ✅ Persistent sessions
- ✅ Automatic token refresh
- ✅ Email verification (optional)
- ✅ Production-ready security

**Happy coding!** 🎉

---

**Quick Links:**
- [Detailed Setup Guide](SUPABASE_AUTH_SETUP.md)
- [Quick Reference](AUTH_QUICK_REFERENCE.md)
- [Implementation Details](AUTHENTICATION_IMPLEMENTATION.md)

**Status**: ✅ Implementation Complete | ⚠️ Requires Environment Setup