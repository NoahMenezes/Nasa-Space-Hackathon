import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import './App.css';

// Import all components
import Background from './components/Background';
import Navbar from './components/Navbar';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import PlaceholderPage from './components/PlaceholderPage';
import Team from './components/Team'; 

const App = () => {
    return (
        <HashRouter>
            {/* The main .App div is now set to handle scrolling (via App.css) */}
            <div className="App">
                {/* Z-index 1: Background is fixed at the bottom */}
                <Background />

                {/* Z-index 50: Navbar is fixed at the top */}
                <Navbar />

                {/* This container manages the content area. 
                    It pushes content down past the fixed Navbar and is the scrollable layer. */}
                <div className="content-container">
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/signup" element={<SignupPage />} />
                        
                        {/* Placeholder routes */}
                        <Route path="/data-sources" element={
                            <PlaceholderPage 
                                title="Data Acquisition Dashboard" 
                                description="This section monitors live feeds and historical data from various NASA APIs, ensuring our models have the most accurate cosmic context." 
                            />
                        } />
                        <Route path="/model" element={
                            <PlaceholderPage 
                                title="Predictive Modeling Engine" 
                                description="Explore the proprietary algorithms driving our space solutions, specializing in orbital mechanics and long-term risk assessment." 
                            />
                        } />
                        
                        {/* Team component */}
                        <Route path="/team" element={<Team />} />

                        {/* 404/Catch-all Route */}
                        <Route path="*" element={
                            <PlaceholderPage 
                                title="404: Cosmic Anomaly Detected" 
                                description="The page you are looking for has been swallowed by a black hole. Check your navigation." 
                            />
                        } />
                    </Routes>
                </div>
            </div>
        </HashRouter>
    );
};

export default App;
