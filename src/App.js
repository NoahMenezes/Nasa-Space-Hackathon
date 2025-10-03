import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import "./App.css";

// Import all components
import Background from "./components/Background";
import Navbar from "./components/Navbar";
import HomePage from "./components/HomePage";
import LoginPage from "./components/LoginPage";
import SignupPage from "./components/SignupPage";
import PlaceholderPage from "./components/PlaceholderPage";
import Team from "./components/Team";
import SearchEngine from "./components/SearchEngine"; // Add this import
import Bookmarks from "./components/Bookmarks"; // Add this import
import ExperimentDetails from "./components/ExperimentDetails";

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

            {/* New Routes for Search Engine and Bookmarks */}
            <Route path="/search" element={<SearchEngine />} />
            <Route path="/bookmarks" element={<Bookmarks />} />
            <Route path="/experiment/:id" element={<ExperimentDetails />} />

            {/* Team component */}
            <Route path="/team" element={<Team />} />

            {/* 404/Catch-all Route */}
            <Route
              path="*"
              element={
                <PlaceholderPage
                  title="404: Cosmic Anomaly Detected"
                  description="The page you are looking for has been swallowed by a black hole. Check your navigation."
                />
              }
            />
          </Routes>
        </div>
      </div>
    </HashRouter>
  );
};

export default App;
