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
            <div className="relative min-h-screen font-sans">
                {/* Background is always rendered */}
                <Background />

                {/* Navbar is always rendered and provides routing links */}
                <Navbar />

                {/* Routes define which component renders based on the URL path */}
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    
                    {/* Placeholder routes for the other navbar links */}
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
                    
                    {/* 404/Catch-all Route */}
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