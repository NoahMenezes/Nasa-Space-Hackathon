# Supabase Authentication Setup Guide

This guide will help you set up Supabase authentication for the NASA Space Hackathon project.

## 🚀 Quick Start

### Prerequisites
- Node.js installed
- A Supabase account (create one at https://supabase.com)

---

## 📋 Step 1: Create a Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Fill in the details:
   - **Project Name**: nasa-space-hackathon (or your preferred name)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose the closest region to your users
4. Click "Create new project" and wait for it to initialize (~2 minutes)

---

## 🔑 Step 2: Get Your Supabase Credentials

1. Once your project is ready, go to **Settings** (gear icon in sidebar)
2. Click on **API** in the left menu
3. You'll see two important keys:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **anon/public key**: This is your `REACT_APP_SUPABASE_ANON_KEY`
   - **service_role key**: This is your `SUPABASE_SERVICE_ROLE_KEY` (⚠️ KEEP SECRET!)

---

## 📝 Step 3: Configure Frontend Environment Variables

1. In the **root directory** of the project, create a `.env` file:
   ```bash
   # Copy the example file
   cp .env.example .env
   ```

2. Edit the `.env` file with your Supabase credentials:
   ```env
   # Supabase Configuration
   REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here

   # API Configuration
   REACT_APP_API_URL=http://localhost:5000/api
   
   # Environment
   NODE_ENV=development
   ```

3. Replace the placeholder values with your actual credentials from Step 2

---

## 🔐 Step 4: Configure Backend Environment Variables

1. In the **backend directory**, create or update the `.env` file:
   ```bash
   cd backend
   # If .env doesn't exist, create it
   ```

2. Add the following variables to `backend/.env`:
   ```env
   # Supabase Configuration (Backend)
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

   # Database Configuration (if using PostgreSQL)
   DATABASE_URL=postgresql://...
   
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000

   # Other existing variables...
   ```

3. **⚠️ IMPORTANT**: The `SUPABASE_SERVICE_ROLE_KEY` is a **SECRET** key that bypasses Row Level Security (RLS). NEVER expose it in your frontend or commit it to version control!

---

## ⚙️ Step 5: Enable Email Authentication in Supabase

1. In your Supabase dashboard, go to **Authentication** → **Providers**
2. Make sure **Email** is enabled (it should be by default)
3. Configure email settings:
   - **Enable email confirmations**: Toggle based on your preference
     - ✅ Enabled: Users must verify email before logging in (recommended for production)
     - ❌ Disabled: Users can log in immediately (easier for development)
4. Scroll down and click **Save**

### Email Templates (Optional but Recommended)

1. Go to **Authentication** → **Email Templates**
2. Customize the templates for:
   - **Confirm signup**: Email sent when users sign up
   - **Magic Link**: For passwordless login
   - **Change Email Address**: When users update their email
   - **Reset Password**: For password recovery

---

## 📧 Step 6: Configure Email Provider (Optional)

By default, Supabase uses their built-in email service (limited to 3 emails/hour in free tier).

### For Production - Use Custom SMTP:

1. Go to **Settings** → **Auth** → **SMTP Settings**
2. Enable **Custom SMTP**
3. Enter your SMTP details:
   - **Host**: smtp.gmail.com (for Gmail) or your provider
   - **Port**: 587 (for TLS) or 465 (for SSL)
   - **Username**: Your email address
   - **Password**: Your email password or app-specific password
   - **Sender email**: The "from" email address
   - **Sender name**: The "from" name

4. Click **Save**

**Popular SMTP Providers:**
- **SendGrid**: 100 emails/day free
- **Mailgun**: 5,000 emails/month free
- **AWS SES**: 62,000 emails/month free (if hosting on AWS)
- **Gmail**: Works but has limits (500/day)

---

## 🏗️ Step 7: Database Setup (Optional)

The authentication system works without any custom database tables, but you can create additional tables for user profiles:

1. Go to **Table Editor** in Supabase
2. Create a new table called `user_profiles`:

```sql
-- Create user profiles table
create table public.user_profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.user_profiles enable row level security;

-- Create policies
create policy "Users can view their own profile"
  on public.user_profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.user_profiles for update
  using (auth.uid() = id);

-- Create trigger to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (id, username)
  values (new.id, new.raw_user_meta_data->>'username');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

---

## 📦 Step 8: Install Dependencies

1. Install frontend dependencies:
   ```bash
   npm install
   ```

2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

---

## 🚀 Step 9: Run the Application

1. Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. In a new terminal, start the frontend:
   ```bash
   npm start
   ```

3. Open your browser to `http://localhost:3000`

---

## ✅ Step 10: Test Authentication

### Test Signup:
1. Navigate to `http://localhost:3000/#/signup`
2. Enter a valid email and password
3. If email confirmation is enabled, check your email and click the confirmation link
4. You should be redirected to the home page

### Test Login:
1. Navigate to `http://localhost:3000/#/login`
2. Enter your email and password
3. You should be logged in and redirected to the home page

### Test Protected Routes:
1. Try accessing `/search` or `/bookmarks` without logging in
2. You should be redirected to the login page
3. After logging in, you should be able to access these routes

### Test Logout:
1. Click the "Logout" button in the navbar
2. You should be signed out and unable to access protected routes

---

## 🔒 Security Best Practices

### ✅ DO:
- ✅ Keep your `SUPABASE_SERVICE_ROLE_KEY` secret
- ✅ Use environment variables for all sensitive data
- ✅ Enable Row Level Security (RLS) on all database tables
- ✅ Use HTTPS in production
- ✅ Enable email confirmation in production
- ✅ Set up proper CORS policies
- ✅ Implement rate limiting (Supabase has built-in protection)

### ❌ DON'T:
- ❌ Commit `.env` files to version control
- ❌ Expose `SUPABASE_SERVICE_ROLE_KEY` in frontend code
- ❌ Store sensitive data in localStorage without encryption
- ❌ Disable RLS on production databases
- ❌ Use weak passwords in production

---

## 🐛 Troubleshooting

### Issue: "Missing Supabase environment variables"
**Solution**: Make sure you created the `.env` file and added the correct variables.

### Issue: "Invalid login credentials"
**Solution**: 
- Check if email confirmation is required
- Verify the email and password are correct
- Check Supabase dashboard → Authentication → Users to see if user exists

### Issue: "User not found or token is invalid"
**Solution**: 
- The JWT token might be expired (default is 1 hour)
- Try logging out and logging in again
- Check if `SUPABASE_SERVICE_ROLE_KEY` is set correctly in backend

### Issue: "CORS error when calling API"
**Solution**: 
- Make sure backend CORS is configured to allow frontend URL
- Check that `FRONTEND_URL` in backend `.env` matches your frontend URL

### Issue: Email not received
**Solution**: 
- Check spam/junk folder
- If using default Supabase email, note the 3 emails/hour limit
- Set up custom SMTP for production
- Check Supabase logs in Authentication → Logs

### Issue: "Network error" or API calls failing
**Solution**: 
- Make sure backend server is running
- Check that `REACT_APP_API_URL` points to the correct backend URL
- Verify backend middleware is using `authenticateUser` correctly

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers)
- [React + Supabase Tutorial](https://supabase.com/docs/guides/getting-started/tutorials/with-react)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

## 🎯 Architecture Overview

### Frontend (React):
- **AuthContext** (`src/contexts/AuthContext.jsx`): Global auth state management
- **useAuth** hook: Access auth state and methods (signIn, signUp, signOut)
- **ProtectedRoute** component: Guards private routes
- **Supabase Client** (`src/lib/supabase.js`): Frontend Supabase instance (uses anon key)
- **API Service** (`src/utils/api.js`): Axios interceptor that adds JWT to requests

### Backend (Node.js):
- **authenticateUser** middleware (`backend/middleware/auth.js`): Verifies Supabase JWT
- **Supabase Admin Client**: Backend instance (uses service_role key)
- **Protected Routes**: All analysis endpoints require authentication

### Authentication Flow:
1. User signs up/logs in via frontend
2. Supabase returns JWT token
3. Frontend stores token in localStorage (managed by Supabase client)
4. API requests include JWT in Authorization header
5. Backend middleware verifies JWT with Supabase
6. If valid, request proceeds; if invalid, returns 401

---

## 🔄 Migration from Old Auth System

The old custom JWT authentication has been replaced with Supabase. Here's what changed:

### Removed:
- ❌ `/api/auth/register` endpoint
- ❌ `/api/auth/login` endpoint
- ❌ `/api/auth/logout` endpoint
- ❌ Custom JWT generation and verification
- ❌ Password hashing in backend (now handled by Supabase)

### Added:
- ✅ Supabase client on frontend
- ✅ AuthContext with useAuth hook
- ✅ ProtectedRoute component
- ✅ Supabase JWT verification in backend middleware
- ✅ Automatic token refresh
- ✅ Persistent sessions

### Database Tables No Longer Needed:
- `user_sessions` (Supabase manages sessions)

### Database Tables Still Used:
- Any custom user data tables (you can link to Supabase user ID)

---

## 📝 Quick Reference

### Frontend Usage:

```javascript
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user, loading, signIn, signOut } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      {user ? (
        <>
          <p>Welcome, {user.email}</p>
          <button onClick={signOut}>Logout</button>
        </>
      ) : (
        <button onClick={() => signIn(email, password)}>Login</button>
      )}
    </div>
  );
}
```

### Backend Usage:

```javascript
import { authenticateUser } from './middleware/auth.js';

// Protected route
router.get('/protected', authenticateUser, (req, res) => {
  // Access user via req.user
  res.json({ message: `Hello ${req.user.email}` });
});
```

---

## 🎉 You're All Set!

Your application now has a complete, secure authentication system powered by Supabase!

If you encounter any issues, refer to the Troubleshooting section or check the Supabase documentation.

Happy coding! 🚀