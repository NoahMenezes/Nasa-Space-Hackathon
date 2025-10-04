import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
 const [isScrolled, setIsScrolled] = useState(false);
 const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
 const [isVisible, setIsVisible] = useState(true);
 const [lastScrollY, setLastScrollY] = useState(0);
 const [pillStyle, setPillStyle] = useState({});

 const navLinks = [
  { name: "Home", path: "/", icon: "🏠" },
  { name: "Search Engine", path: "/search", icon: "🔍" },
  { name: "Bookmarks", path: "/bookmarks", icon: "📖" },
 ];

 const location = useLocation();

 // Update pill position based on active link
 useEffect(() => {
  const updatePillPosition = () => {
   const activeLink = document.querySelector('.nav-link.active');
   const navLinksContainer = document.querySelector('.nav-links');
  
   if (activeLink && navLinksContainer) {
    const containerRect = navLinksContainer.getBoundingClientRect();
    const linkRect = activeLink.getBoundingClientRect();
   
    setPillStyle({
     width: `${linkRect.width}px`,
     // Adjusted translation to account for container's padding/border
     transform: `translateX(${linkRect.left - containerRect.left - 6}px)`,
    });
   }
  };

  // Update on mount and when location changes
  updatePillPosition();
 
  // Update on window resize
  window.addEventListener('resize', updatePillPosition);
 
  // Small delay to ensure DOM is ready
  const timer = setTimeout(updatePillPosition, 50);

  return () => {
   window.removeEventListener('resize', updatePillPosition);
   clearTimeout(timer);
  };
 }, [location.pathname]);

 useEffect(() => {
  const handleScroll = () => {
   const currentScrollY = window.scrollY;

   // Add scrolled class when scrolling down
   setIsScrolled(currentScrollY > 50);

   // Hide/show navbar based on scroll direction
   if (currentScrollY > lastScrollY && currentScrollY > 100) {
    setIsVisible(false);
   } else {
    setIsVisible(true);
   }

   setLastScrollY(currentScrollY);
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
  return () => window.removeEventListener("scroll", handleScroll);
 }, [lastScrollY]);

 // Close mobile menu when route changes
 useEffect(() => {
  setIsMobileMenuOpen(false);
 }, [location.pathname]);

 const toggleMobileMenu = () => {
  setIsMobileMenuOpen(!isMobileMenuOpen);
 };

 return (
  <>
   <nav
    className={`navbar ${isScrolled ? "scrolled" : ""} ${isVisible ? "" : "hidden"}`}
   >
    <div className="navbar-container">
     <div className="navbar-content">
      {/* Logo/Home Link */}
      <Link to="/" className="logo">
       <div className="logo-icon">🔭</div>
       <span className="logo-text">BioSpace Archive</span>
      </Link>

      {/* Main Nav Links */}
      <div className="nav-links">
       <div
        className="nav-pill"
        style={pillStyle}
       />
       {navLinks.map((link) => (
        <Link
         key={link.name}
         to={link.path}
         className={`nav-link ${
          location.pathname === link.path ? "active" : ""
         }`}
        >
         <span className="nav-icon">{link.icon}</span>
         <span className="nav-text">{link.name}</span>
        </Link>
       ))}
      </div>

      {/* Auth Buttons */}
      <div className="auth-buttons">
       <Link to="/login" className="btn btn-login">
        <span className="btn-icon">🔓</span>
        <span>Login</span>
       </Link>
       <Link to="/signup" className="btn btn-signup">
        <span className="btn-icon">✨</span>
        <span>Sign Up</span>
       </Link>
      </div>

      {/* Mobile Menu Toggle */}
      <button
       className={`mobile-menu-toggle ${isMobileMenuOpen ? "open" : ""}`}
       onClick={toggleMobileMenu}
       aria-label="Toggle mobile menu"
      >
       <span></span>
       <span></span>
       <span></span>
      </button>
     </div>
    </div>

    {/* Mobile Menu Overlay */}
    <div className={`mobile-menu ${isMobileMenuOpen ? "open" : ""}`}>
     <div className="mobile-menu-content">
      <div className="mobile-nav-links">
       {navLinks.map((link) => (
        <Link
         key={link.name}
         to={link.path}
         className={`mobile-nav-link ${
          location.pathname === link.path ? "active" : ""
         }`}
         onClick={() => setIsMobileMenuOpen(false)}
        >
         <span className="nav-icon">{link.icon}</span>
         <span className="nav-text">{link.name}</span>
        </Link>
       ))}
      </div>

      <div className="mobile-auth-buttons">
       <Link
        to="/login"
        className="btn btn-login"
        onClick={() => setIsMobileMenuOpen(false)}
       >
        <span className="btn-icon">🔓</span>
        <span>Login</span>
       </Link>
       <Link
        to="/signup"
        className="btn btn-signup"
        onClick={() => setIsMobileMenuOpen(false)}
       >
        <span className="btn-icon">✨</span>
        <span>Sign Up</span>
       </Link>
      </div>
     </div>
    </div>
   </nav>

   {/* Mobile Menu Backdrop */}
   {isMobileMenuOpen && (
    <div
     className="mobile-menu-backdrop"
     onClick={() => setIsMobileMenuOpen(false)}
    />
   )}
  </>
 );
};

export default Navbar;