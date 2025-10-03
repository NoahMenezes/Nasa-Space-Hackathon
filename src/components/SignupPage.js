import React from 'react';
import './SignupPage.css'; // This will contain the shared form styles

const SignupPage = ({ setCurrentPage }) => {
    const handleSubmit = (e) => {
        e.preventDefault();
        // In a real application, you would capture the form data and handle
        // the Firebase/Auth user creation process here.
        console.log("Sign Up submitted");
        
        // After successful signup, you would typically redirect to login or home.
        alert("Sign Up functionality is simulated. Check the console!");
    };

    return (
        <div className="form-container">
            <h2>New Cadet Registration</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="name">Full Name</label>
                    <input type="text" id="name" required placeholder="Commander Shepard" />
                </div>
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input type="email" id="email" required placeholder="user@cosmos.net" />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input type="password" id="password" required placeholder="Must be 8+ characters" />
                </div>
                <button type="submit" className="form-submit-button">
                    Complete Registration
                </button>
            </form>
            <p style={{ marginTop: '20px', color: '#ccc', fontSize: '0.9rem' }}>
                Already registered? 
                <button 
                    onClick={() => setCurrentPage('login')} 
                    // Inline styles for the link button
                    style={{ color: '#00e5ff', marginLeft: '5px', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                    Log In
                </button>
            </p>
        </div>
    );
};

export default SignupPage;