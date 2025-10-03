import React from 'react';
import './Navbar.css';

// Navbar receives the routing function (setCurrentPage) as a prop from App.js
const Navbar = ({ setCurrentPage }) => {
    const navLinks = [
        // Clicking 'Home' resets the page state to 'home'
        { name: 'Home', action: () => setCurrentPage('home') },
        // Placeholder actions for other links
        { name: 'Data Sources', action: () => console.log('Go to Data Sources') },
        { name: 'Model', action: () => console.log('Go to Model') },
        { name: 'Team', action: () => console.log('Go to Team') },
    ];

    return (
        <nav className="navbar">
            <div className="navbar-logo">
                🚀 NASA Space Apps
            </div>
            <ul className="navbar-links">
                {navLinks.map((link) => (
                    <li key={link.name}>
                        {/* Using <button> to trigger React state changes */}
                        <button onClick={link.action} className="nav-link-item">
                            {link.name}
                        </button>
                    </li>
                ))}
            </ul>
            
            <div className="navbar-auth">
                <button 
                    className="auth-button login-button" 
                    onClick={() => setCurrentPage('login')} // Changes App state to display LoginPage
                >
                    Login
                </button>
                <button 
                    className="auth-button signup-button" 
                    onClick={() => setCurrentPage('signup')} // Changes App state to display SignupPage
                >
                    Sign Up
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
