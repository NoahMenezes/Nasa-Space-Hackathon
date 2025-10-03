import React from 'react';
import './LoginPage.css'; // Import the dedicated styles for the form

const LoginPage = ({ setCurrentPage }) => {
    // State to hold form data could be added here if needed for input control
    // const [formData, setFormData] = useState({ email: '', password: '' });

    const handleSubmit = (e) => {
        e.preventDefault();
        // In a real app, handle Firebase/Auth login here.
        console.log("Login submitted");
        
        // Use a message box instead of alert() for real applications.
        // For simulation purposes here, we use alert() as the final step.
        alert("Login functionality is simulated. Check the console!");
    };

    return (
        <div className="form-container">
            <h2>Access Terminal</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input type="email" id="email" required placeholder="user@cosmos.net" />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input type="password" id="password" required placeholder="********" />
                </div>
                <button type="submit" className="form-submit-button">
                    Initiate Login Sequence
                </button>
            </form>
            <p style={{ marginTop: '20px', color: '#ccc', fontSize: '0.9rem' }}>
                Don't have an account? 
                <button 
                    onClick={() => setCurrentPage('signup')} 
                    // Inline styles are used for the linking button to override default button styles
                    style={{ color: '#00e5ff', marginLeft: '5px', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                    Sign Up
                </button>
            </p>
        </div>
    );
};

export default LoginPage;