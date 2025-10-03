import React, { useState } from 'react';
import './App.css';

// Import all components
import Background from './components/Background';
import Navbar from './components/Navbar';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';

const App = () => {
    // State to manage which content page is currently displayed: 'home', 'login', or 'signup'
    const [currentPage, setCurrentPage] = useState('home');

    // Function to render the main content based on the current page state
    const renderContent = () => {
        switch (currentPage) {
            case 'login':
                // Pass setCurrentPage to allow linking between login and signup
                return <LoginPage setCurrentPage={setCurrentPage} />;
            case 'signup':
                return <SignupPage setCurrentPage={setCurrentPage} />;
            case 'home':
            default:
                // Home content rendered for the 'home' page
                return (
                    <header style={{ position: 'absolute', top: '25vh', width: '100%', textAlign: 'center', zIndex: 50, color: 'white' }}>
                        <h1 style={{ fontSize: '3rem', textShadow: '0 0 10px rgba(0, 229, 255, 0.5)' }}>
                            Deep Space Exploration
                        </h1>
                        <p style={{ fontSize: '1.2rem', color: '#ccc' }}>
                            Navigate the cosmos with our advanced data models.
                        </p>
                    </header>
                );
        }
    };

    return (
        <div className="App">
            {/* The Navbar, which controls the page state */}
            <Navbar setCurrentPage={setCurrentPage} /> 
            
            {/* The Background component, always rendered behind everything */}
            <Background />
            
            {/* The dynamic main content (Home, Login, or Signup) */}
            {renderContent()}
        </div>
    );
};

export default App;
