import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './SignupPage.css'; // Make sure to create this CSS file

const SignupPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle signup logic here
        if (formData.password !== formData.confirmPassword) {
            alert("Passwords don't match!");
            return;
        }
        console.log('Signup with:', formData);
    };

    return (
        <div className="signup-container">
            <div className="form-card">
                <h2 className="form-title">Create Your Account</h2>
                <form onSubmit={handleSubmit} className="signup-form">
                    <div className="form-group">
                        <label htmlFor="name">Full Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="form-input"
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
                        />
                    </div>
                    <button type="submit" className="signup-button">
                        Create Account
                    </button>
                </form>
                <p className="login-link">
                    Already have an account? <Link to="/login">Log in</Link>
                </p>
            </div>
        </div>
    );
};

export default SignupPage;