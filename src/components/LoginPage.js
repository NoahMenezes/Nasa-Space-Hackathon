import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI, setAuthToken } from "../utils/api";
import "./LoginPage.css";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => {
      setIsVisible(true);
      setPageLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await authAPI.login(formData);
      const { token, user } = response.data;

      // Store token and user data
      setAuthToken(token);
      localStorage.setItem("user", JSON.stringify(user));

      console.log("Login successful:", user);

      // Success animation before redirect
      const successElement = document.querySelector(".login-card");
      if (successElement) {
        successElement.style.transform = "scale(1.02)";
        successElement.style.borderColor = "var(--primary-cyan)";
        successElement.style.boxShadow = "0 0 50px rgba(103, 232, 249, 0.4)";
      }

      setTimeout(() => {
        navigate("/");
      }, 500);
    } catch (error) {
      console.error("Login error:", error);
      setError(
        error.response?.data?.error ||
          "Login failed. Please check your credentials.",
      );

      // Shake animation on error
      const cardElement = document.querySelector(".login-card");
      if (cardElement) {
        cardElement.style.animation = "shake 0.5s ease-in-out";
        setTimeout(() => {
          cardElement.style.animation = "";
        }, 500);
      }
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div
      className={`login-page ${isVisible ? "visible" : ""} ${pageLoaded ? "loaded" : ""}`}
    >
      {/* Animated Background Elements */}
      <div className="bg-elements">
        <div className="floating-element element-1">🚀</div>
        <div className="floating-element element-2">⭐</div>
        <div className="floating-element element-3">🌌</div>
        <div className="floating-element element-4">🛸</div>
      </div>

      <div className="login-container">
        <div className="login-card">
          {/* Header */}
          <div className="login-header">
            <div className="logo-container">
              <div className="logo-icon">🔐</div>
              <h1 className="login-title">Welcome Back</h1>
            </div>
            <p className="login-subtitle">
              Sign in to access your space biology research dashboard
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-container">
              <div className="error-icon">⚠️</div>
              <span className="error-text">{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <div className="input-container">
                <div className="input-icon">📧</div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  className="form-input"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="input-container">
                <div className="input-icon">🔒</div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  className="form-input"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={togglePasswordVisibility}
                  disabled={loading}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            <div className="form-options">
              <label className="checkbox-container">
                <input type="checkbox" className="checkbox" />
                <span className="checkmark"></span>
                <span className="checkbox-label">Remember me</span>
              </label>
              <Link to="/forgot-password" className="forgot-link">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className={`login-button ${loading ? "loading" : ""}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="loading-spinner"></div>
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <div className="button-icon">→</div>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="divider">
            <span className="divider-text">or</span>
          </div>

          {/* Social Login Options */}
          <div className="social-login">
            <button
              className="social-button google"
              type="button"
              disabled={loading}
            >
              <span className="social-icon">🌐</span>
              Continue with Google
            </button>
            <button
              className="social-button github"
              type="button"
              disabled={loading}
            >
              <span className="social-icon">⚡</span>
              Continue with GitHub
            </button>
          </div>

          {/* Footer */}
          <div className="login-footer">
            <p className="signup-prompt">
              Don't have an account?{" "}
              <Link to="/signup" className="signup-link">
                Create one here
              </Link>
            </p>
          </div>
        </div>

        {/* Side Panel */}
        <div className="side-panel">
          <div className="panel-content">
            <div className="panel-icon">🌟</div>
            <h3 className="panel-title">Explore the Universe</h3>
            <p className="panel-description">
              Access thousands of NASA space biology experiments and research
              data to advance human exploration beyond Earth.
            </p>
            <div className="panel-stats">
              <div className="stat">
                <div className="stat-number">15K+</div>
                <div className="stat-label">Research Papers</div>
              </div>
              <div className="stat">
                <div className="stat-number">500+</div>
                <div className="stat-label">Experiments</div>
              </div>
              <div className="stat">
                <div className="stat-number">50+</div>
                <div className="stat-label">Years of Data</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
