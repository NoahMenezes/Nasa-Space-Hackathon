import React, { useState, useMemo } from 'react';
import './DataSources.css';

const DataSources = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const dataSources = [
    {
      title: "NASA APOD API",
      description: "Astronomy Picture of the Day - A service provided by NASA and Michigan Technological University.",
      endpoint: "https://api.nasa.gov/api.html#apod",
      category: "Images"
    },
    {
      title: "NASA Mars Rover Photos",
      description: "Image data gathered by NASA's Curiosity, Opportunity, and Spirit rovers on Mars.",
      endpoint: "https://api.nasa.gov/mars-photos/api/v1/rovers",
      category: "Images"
    },
    {
      title: "NASA Earth API",
      description: "Access to NASA's Earth observation data including satellite imagery and environmental data.",
      endpoint: "https://api.nasa.gov/EPIC/api/natural",
      category: "Earth Data"
    },
    {
      title: "NASA Exoplanet Archive",
      description: "A database of all known exoplanets and their properties.",
      endpoint: "https://exoplanetarchive.ipac.caltech.edu/",
      category: "Exoplanets"
    },
    {
      title: "NASA Asteroid NeoWs",
      description: "Near Earth Object Web Service - data about asteroids and comets near Earth.",
      endpoint: "https://api.nasa.gov/neo/rest/v1/neo/browse",
      category: "Solar System"
    },
    {
      title: "NASA Image and Video Library",
      description: "Search NASA's extensive collection of images, videos, and audio files.",
      endpoint: "https://images.nasa.gov/",
      category: "Media"
    }
  ];

  const filteredSources = useMemo(() => {
    if (!searchTerm.trim()) return dataSources;
    
    const term = searchTerm.toLowerCase();
    return dataSources.filter(source => 
      source.title.toLowerCase().includes(term) ||
      source.description.toLowerCase().includes(term) ||
      source.category.toLowerCase().includes(term)
    );
  }, [searchTerm, dataSources]);

  const clearSearch = () => {
    setSearchTerm('');
  };

  return (
    <div className="data-sources-page">
      <div className="data-sources-wrapper">
        <div className="data-sources-header">
          <h1 className="animated-title">Data Sources</h1>
          <p className="animated-desc">
            Explore the universe through NASA's open APIs and data sets
          </p>
        </div>
        
        {/* Search Bar */}
        <div className="search-container">
          <div className="search-bar-wrapper">
            <div className="search-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.3-4.3"></path>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search data sources by name, description, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button onClick={clearSearch} className="clear-search">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            )}
          </div>
          
          {/* Search Stats */}
          <div className="search-info">
            <span className="results-count">
              {filteredSources.length} of {dataSources.length} data sources
            </span>
            {searchTerm && (
              <span className="search-query">
                for "<strong>{searchTerm}</strong>"
              </span>
            )}
          </div>
        </div>
        
        {/* Results Grid */}
        <div className="sources-grid">
          {filteredSources.length > 0 ? (
            filteredSources.map((source, index) => (
              <div key={index} className="source-card">
                <div className="card-header">
                  <h3 className="source-title">{source.title}</h3>
                  <span className="source-category">{source.category}</span>
                </div>
                <p className="source-desc">{source.description}</p>
                <a 
                  href={source.endpoint} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="source-link"
                >
                  View API Documentation
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                </a>
              </div>
            ))
          ) : (
            <div className="no-results">
              <div className="no-results-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.3-4.3"></path>
                  <line x1="8" y1="8" x2="16" y2="16" strokeWidth="1.5"></line>
                </svg>
              </div>
              <h3>No data sources found</h3>
              <p>Try adjusting your search terms or browse all available sources</p>
              <button onClick={clearSearch} className="reset-search">
                Show All Data Sources
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataSources;