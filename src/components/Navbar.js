import React, { useState } from 'react';
// Note: In a real project using separate CSS, you would import the CSS file here:
import './Navbar.css';
import { Menu, X, Rocket, Map, Database, Info, Mail, LogIn, UserPlus } from 'lucide-react';

/**
 * Navbar Component
 * A dark-themed, responsive navigation bar using custom CSS classes.
 */
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Define navigation links and their associated icons
  const navLinks = [
    { name: "Home", href: "#home", icon: Rocket },
    { name: "Missions", href: "#missions", icon: Map },
    { name: "Data Hub", href: "#data", icon: Database },
    { name: "About Us", href: "#about", icon: Info },
    { name: "Contact", href: "#contact", icon: Mail },
    { name: "Login", href: "#login", icon: LogIn },
    { name: "Sign In", href: "#signup", icon: UserPlus },
  ];

  return (
    <nav className="navbar-base">
      <div className="navbar-container">
        <div className="navbar-content">
          
          {/* Logo/Brand Section */}
          <div className="flex items-center">
            <div className="navbar-logo">
              SPACE APPS
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="desktop-links">
            <div className="nav-links">
              {navLinks.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="nav-link-desktop"
                >
                  <item.icon className="nav-link-icon" />
                  {item.name}
                </a>
              ))}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="mobile-menu-wrapper">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="mobile-menu-button"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isOpen && (
        <div className="mobile-menu-panel" id="mobile-menu">
          <div className="mobile-links-container">
            {navLinks.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)} // Close menu on link click
                className="nav-link-mobile"
              >
                <item.icon className="h-5 w-5 mr-3 text-cyan-400" />
                {item.name}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
