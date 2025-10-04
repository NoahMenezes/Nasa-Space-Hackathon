import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Search Engine", path: "/search" },
    { name: "Bookmarks", path: "/bookmarks" },
  ];

  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-content">
          {/* Logo/Home Link */}
          <Link to="/" className="logo">
            📚 The BioSpace Archive
          </Link>

          {/* Main Nav Links */}
          <div className="nav-links">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`nav-link ${
                  location.pathname === link.path ? "active" : ""
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="auth-buttons">
            <Link to="/login" className="btn btn-login">
              Login
            </Link>
            <Link to="/signup" className="btn btn-signup">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
