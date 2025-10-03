import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import './App.css';

// Import components
import Background from './components/Background';
import Navbar from './components/Navbar';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import PlaceholderPage from './components/PlaceholderPage';

const App = () => {
    return (
        <HashRouter>
            <div style={{ position: 'relative', minHeight: '100vh', width: '100vw', overflow: 'auto' }}>
                {/* Background should be first and have pointer-events: none on overlay areas */}
                <Background />
                
                {/* Navbar must be above background */}
                <Navbar />

                {/* Routes define which component renders based on the URL path */}
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    
                    <Route path="/data-sources" element={
                        <PlaceholderPage 
                            title="Data Acquisition Dashboard" 
                            description="This section will detail the NASA APIs and data sets used for the project." 
                        />
                    } />
                    <Route path="/model" element={
                        <PlaceholderPage 
                            title="Predictive Modeling Engine" 
                            description="Explore the algorithms and analysis tools driving our space solutions." 
                        />
                    } />
                    <Route path="/team" element={
                        <PlaceholderPage 
                            title="Mission Control Team" 
                            description="Meet the brilliant minds behind this hackathon entry." 
                        />
                    } />
                    
                    <Route path="*" element={
                        <PlaceholderPage 
                            title="404: Cosmic Anomaly Detected" 
                            description="The page you are looking for has been swallowed by a black hole. Check your navigation." 
                        />
                    } />
                </Routes>
            </div>
        </HashRouter>
    );
};

export default App;