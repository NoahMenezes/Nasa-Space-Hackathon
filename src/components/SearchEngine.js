import React, { useState } from 'react';
import './SearchEngine.css';

const SearchEngine = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    // Add your search functionality here
    console.log('Searching for:', searchQuery);
  };

  return (
    <div className="search-engine-page">
      <div className="search-engine-wrapper">
        <div className="search-engine-header">
          <h1 className="animated-title">NASA Search Engine</h1>
          <p className="animated-desc">
            Explore the cosmos with our powerful search across NASA's databases
          </p>
        </div>
        
        <div className="search-container-main">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-wrapper">
              <input
                type="text"
                placeholder="Search for planets, missions, astronauts, or space phenomena..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="main-search-input"
              />
              <button type="submit" className="search-button">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.3-4.3"></path>
                </svg>
                Search
              </button>
            </div>
          </form>
          
          
        </div>

        <div className="search-results">
          <p className="results-placeholder">
            Enter a search term to explore NASA's vast collection of space data, images, and research.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SearchEngine;