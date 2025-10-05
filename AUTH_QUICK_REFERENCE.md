# Authentication Quick Reference Card

## 🚀 Quick Start

### Frontend Usage

```javascript
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user, loading, signIn, signUp, signOut } = useAuth();
  
  // Check if user is logged in
  if (user) {
    console.log('Logged in as:', user.email);
  }
}
```

---

## 📝 Common Operations

### 1. Sign Up a New User

```javascript
const { signUp } = useAuth();

const handleSignup = async () => {
  const { data, error } = await signUp(
    'user@example.com',
    'password123',
    { username: 'johndoe' }  // Optional metadata
  );
  
  if (error) {
    console.error('Signup failed:', error.message);
  } else {
    console.log('Signup successful:', data.user);
  }
};
```

### 2. Log In an Existing User

```javascript
const { signIn } = useAuth();

const handleLogin = async () => {
  const { data, error } = await signIn(
    'user@example.com',
    'password123'
  );
  
  if (error) {
    console.error('Login failed:', error.message);
  } else {
    console.log('Login successful:', data.user);
  }
};
```

### 3. Log Out

```javascript
const { signOut } = useAuth();

const handleLogout = async () => {
  const { error } = await signOut();
  
  if (error) {
    console.error('Logout failed:', error.message);
  }
};
```

### 4. Check Authentication Status

```javascript
const { user, loading } = useAuth();

if (loading) {
  return <div>Loading...</div>;
}

if (user) {
  return <div>Welcome, {user.email}!</div>;
} else {
  return <div>Please log in</div>;
}
```

### 5. Access User Information

```javascript
const { user } = useAuth();

// Basic info
console.log(user.id);           // Supabase user ID
console.log(user.email);        // User email
console.log(user.created_at);   // Account creation date

// Custom metadata (from signup)
console.log(user.user_metadata.username);
```

### 6. Protect a Route

```javascript
import ProtectedRoute from './components/ProtectedRoute';

<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
```

### 7. Make Authenticated API Calls

```javascript
import api from '../utils/api';

// The JWT token is automatically attached by the axios interceptor
const fetchData = async () => {
  try {
    const response = await api.get('/api/experiments');
    console.log(response.data);
  } catch (error) {
    console.error('API call failed:', error);
  }
};
```

---

## 🔧 Backend Operations

### 1. Protect a Route

```javascript
import { authenticateUser } from './middleware/auth.js';

// Require authentication
router.get('/protected', authenticateUser, (req, res) => {
  res.json({ message: `Hello ${req.user.email}` });
});
```

### 2. Optional Authentication

```javascript
import { optionalAuth } from './middleware/auth.js';

// Authentication optional
router.get('/data', optionalAuth, (req, res) => {
  if (req.user) {
    res.json({ personalized: true, user: req.user.email });
  } else {
    res.json({ personalized: false });
  }
});
```

### 3. Require Admin Access

```javascript
import { authenticateUser, requireAdmin } from './middleware/auth.js';

// Require admin role
router.delete('/users/:id', authenticateUser, requireAdmin, (req, res) => {
  // Only admins can access this
  res.json({ message: 'User deleted' });
});
```

### 4. Access User Information

```javascript
router.get('/profile', authenticateUser, (req, res) => {
  // User info is available in req.user
  const { id, email, user_metadata } = req.user;
  
  res.json({
    id,
    email,
    username: user_metadata.username
  });
});
```

---

## 🔑 Environment Variables

### Frontend (.env in root)

```env
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
REACT_APP_API_URL=http://localhost:5000/api
```

### Backend (backend/.env)

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PORT=5000
FRONTEND_URL=http://localhost:3000
```

---

## 🐛 Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "Invalid login credentials" | Wrong email/password | Check credentials |
| "Email not confirmed" | User hasn't verified email | Check inbox or disable confirmation |
| "User already registered" | Email already exists | Use different email or log in |
| "Invalid or expired token" | JWT token invalid | Log out and log in again |
| "Access token required" | No token in request | Ensure user is logged in |
| "Missing Supabase environment variables" | .env not configured | Add SUPABASE_URL and keys |

---

## 🎯 Quick Debugging

### Check if user is authenticated:

```javascript
// Frontend
const { user } = useAuth();
console.log('User:', user);
```

### Check if token is being sent:

```javascript
// Browser DevTools → Network → Headers
// Look for: Authorization: Bearer <token>
```

### Check backend authentication:

```javascript
// Backend logs will show:
// ✅ Authenticated user: user@example.com
```

### Manually get session:

```javascript
import { supabase } from './lib/supabase';

const { data: { session } } = await supabase.auth.getSession();
console.log('Session:', session);
```

---

## 📊 User Object Structure

```javascript
{
  id: "uuid-here",
  email: "user@example.com",
  created_at: "2024-01-01T00:00:00Z",
  user_metadata: {
    username: "johndoe",
    // Other custom data from signup
  },
  app_metadata: {
    provider: "email",
    // Admin roles, etc.
  }
}
```

---

## 🔐 Security Checklist

- [ ] Use REACT_APP_SUPABASE_ANON_KEY in frontend (not service_role!)
- [ ] Use SUPABASE_SERVICE_ROLE_KEY in backend only
- [ ] Never commit .env files to git
- [ ] Enable email confirmation in production
- [ ] Set up custom SMTP for production
- [ ] Enable Row Level Security on database tables
- [ ] Use HTTPS in production
- [ ] Set up proper CORS policies
- [ ] Implement rate limiting
- [ ] Monitor authentication logs

---

## 🚀 Testing Commands

```bash
# Start backend
cd backend && npm run dev

# Start frontend
npm start

# Test signup
# Navigate to: http://localhost:3000/#/signup

# Test login
# Navigate to: http://localhost:3000/#/login

# Test protected route
# Navigate to: http://localhost:3000/#/search
# (Should redirect to login if not authenticated)
```

---

## 📞 Get Help

1. **Setup Issues**: See `SUPABASE_AUTH_SETUP.md`
2. **Environment Variables**: See `backend/ENV_VARIABLES.md`
3. **Implementation Details**: See `AUTHENTICATION_IMPLEMENTATION.md`
4. **Supabase Docs**: https://supabase.com/docs

---

## 💡 Pro Tips

1. **Token Refresh**: Happens automatically, no action needed
2. **Persistent Sessions**: Users stay logged in across page refreshes
3. **Protected Routes**: Always wrap with `<ProtectedRoute>`
4. **API Calls**: Token is automatically attached, just use `api.get/post/etc`
5. **Logout Everywhere**: Call `signOut()` - it invalidates all sessions
6. **User Metadata**: Add custom data during signup for profiles
7. **Loading States**: Always check `loading` before rendering user-dependent UI

---

## 🎓 Best Practices

### ✅ DO:
- Use `useAuth` hook for all auth operations
- Wrap protected routes with `ProtectedRoute`
- Check `loading` state before rendering
- Handle errors gracefully with user-friendly messages
- Keep service_role key secret
- Use environment variables

### ❌ DON'T:
- Don't store passwords in state
- Don't expose service_role key
- Don't skip error handling
- Don't access auth state without `useAuth`
- Don't commit .env files
- Don't disable CORS in production

---

**Last Updated**: 2024
**Version**: 1.0.0
**Status**: ✅ Production Ready