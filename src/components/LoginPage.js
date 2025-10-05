import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./auth-forms.css";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();

  // Get the redirect location from state, or default to home
  const from = location.state?.from?.pathname || "/";

  // Animation effect
  React.useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

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
      {/* Cosmic Background Elements */}
      <div className="auth-particles">
        {Array.from({ length: 20 }, (_, i) => (
          <div
            key={i}
            className="auth-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      <div className={`form-card ${isVisible ? "visible" : ""}`}>
        {/* Beautiful Logo */}
        <div className="auth-logo">
          <div className="auth-logo-container">
            <div className="auth-logo-orbit">
              <div className="auth-logo-planet"></div>
              <div className="auth-logo-ring"></div>
            </div>
            <div className="auth-logo-dna">
              <div className="auth-dna-strand strand-1"></div>
              <div className="auth-dna-strand strand-2"></div>
            </div>
          </div>
        </div>

        <h2 className="form-title">Welcome Back</h2>
        <p className="form-subtitle">
          Enter your credentials to access your research
        </p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">
              <span className="label-icon">📧</span>
              Email
            </label>
            <div className="input-wrapper">
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
              <div className="input-glow"></div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">
              <span className="label-icon">🔐</span>
              Password
            </label>
            <div className="input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
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
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? "👁️" : "🔒"}
              </button>
              <div className="input-glow"></div>
            </div>
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            <span className="btn-content">
              <span className="btn-icon">🚀</span>
              <span className="btn-text">
                {loading ? "Authenticating..." : "Login to Explore"}
              </span>
            </span>
            <div className="btn-shimmer"></div>
          </button>
        </form>

        <p className="auth-link">
          Don't have an account?
          <Link to="/signup" className="auth-link-button">
            <span>Create Account</span>
            <span className="link-arrow">→</span>
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
