import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./auth-forms.css";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();

  // Get the redirect location from state, or default to home
  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error: signInError } = await signIn(email, password);

      if (signInError) {
        throw signInError;
      }

      if (data?.user) {
        console.log("Login successful:", data.user.email);
        // Redirect to the page they tried to visit or home
        navigate(from, { replace: true });
      }
    } catch (error) {
      console.error("Login error:", error);

      // Handle specific Supabase error messages
      let errorMessage = "Login failed. Please check your credentials.";

      if (error.message === "Invalid login credentials") {
        errorMessage = "Invalid email or password.";
      } else if (error.message === "Email not confirmed") {
        errorMessage = "Please verify your email before logging in.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="form-card">
        <h2 className="form-title">Welcome Back</h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="form-input"
              disabled={loading}
              placeholder="Enter your email"
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="form-input"
              disabled={loading}
              placeholder="Enter your password"
              minLength="6"
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p className="auth-link">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
