import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './LoginPage.css'; 

const LoginPage = () => {
    // State to manage form inputs
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    /**
     * Handles the login form submission.
     * @param {Event} e - The form submission event.
     */
    const handleSubmit = (e) => {
        e.preventDefault();
        // In a real application, you would connect this to your Firebase/Authentication service.
        console.log('Login attempt:', { email, password });
        // NOTE: If login fails, use a custom modal or inline error message 
        // instead of the browser's alert() or confirm().
    };

    return (
        // The outer div (.login-container) is styled to span the viewport 
        // and vertically center the form. The inline style ensures it sits 
        // above the 3D background (z-index: 1) and its info overlay (z-index: 10).
        // pt-20 adds necessary spacing to clear the fixed navbar.
        <div className="login-container pt-20" style={{zIndex: 20}}> 
            <div className="form-card">
                <h2 className="form-title">Login to Mission Control</h2>
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
                            placeholder="mission.commander@nasa.gov"
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
                            placeholder="********"
                        />
                    </div>
                    <button type="submit" className="login-button">
                        Secure Access
                    </button>
                </form>
                <p className="signup-link">
                    Don't have an account? <Link to="/signup">Sign up for free</Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
