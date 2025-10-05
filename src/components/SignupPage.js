import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./auth-forms.css";

const SignupPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match!");
      setLoading(false);
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    // Validate username length
    if (formData.username.length < 3) {
      setError("Username must be at least 3 characters long.");
      setLoading(false);
      return;
    }

    try {
      const { data, error: signUpError } = await signUp(
        formData.email,
        formData.password,
        {
          username: formData.username,
        },
      );

      if (signUpError) {
        throw signUpError;
      }

      if (data?.user) {
        // Check if email confirmation is required
        if (data.user.identities && data.user.identities.length === 0) {
          setSuccess(
            "Account created! Please check your email to verify your account before logging in.",
          );
          // Redirect to login page after a delay
          setTimeout(() => {
            navigate("/login");
          }, 3000);
        } else {
          setSuccess("Account created successfully! Redirecting...");
          // Redirect to home page after a short delay
          setTimeout(() => {
            navigate("/");
          }, 1500);
        }
      }
    } catch (error) {
      console.error("Signup error:", error);

      // Handle specific Supabase error messages
      let errorMessage = "Account creation failed. Please try again.";

      if (error.message === "User already registered") {
        errorMessage = "An account with this email already exists.";
      } else if (error.message.includes("Password")) {
        errorMessage = error.message;
      } else if (error.message.includes("Email")) {
        errorMessage = "Please provide a valid email address.";
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
        <h2 className="form-title">Create Your Account</h2>

        {error && <div className="error-message">{error}</div>}

        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit} className="signup-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              minLength="3"
              className="form-input"
              disabled={loading}
              placeholder="Choose a username (min 3 characters)"
              autoComplete="username"
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="form-input"
              disabled={loading}
              placeholder="Enter your email address"
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
              className="form-input"
              disabled={loading}
              placeholder="Create a password (min 6 characters)"
              autoComplete="new-password"
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="form-input"
              disabled={loading}
              placeholder="Confirm your password"
              autoComplete="new-password"
            />
          </div>
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>
        <p className="auth-link">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
