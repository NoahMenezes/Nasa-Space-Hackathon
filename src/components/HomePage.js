import React from 'react';

const HomePage = () => {
    return (
        <header style={{ 
            position: 'absolute', 
            top: '25vh', 
            width: '100%', 
            textAlign: 'center', 
            zIndex: 50, 
            color: 'white' 
        }}>
            <h1 style={{ 
                fontSize: '3rem', 
                textShadow: '0 0 10px rgba(0, 229, 255, 0.5)' 
            }}>
                Deep Space Exploration
            </h1>
            <p style={{ 
                fontSize: '1.2rem', 
                color: '#ccc' 
            }}>
                Navigate the cosmos with our advanced data models.
            </p>
        </header>
    );
};

export default HomePage;