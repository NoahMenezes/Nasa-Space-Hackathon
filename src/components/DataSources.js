import React from 'react';
import './DataScources.css';

const DataSources = () => {
  const dataSources = [
    {
      title: "NASA APOD API",
      description: "Astronomy Picture of the Day - A service provided by NASA and Michigan Technological University.",
      endpoint: "https://api.nasa.gov/api.html#apod"
    },
    {
      title: "NASA Mars Rover Photos",
      description: "Image data gathered by NASA's Curiosity, Opportunity, and Spirit rovers on Mars.",
      endpoint: "https://api.nasa.gov/mars-photos/api/v1/rovers"
    },
    {
      title: "NASA Earth API",
      description: "Access to NASA's Earth observation data including satellite imagery and environmental data.",
      endpoint: "https://api.nasa.gov/EPIC/api/natural"
    },
    {
      title: "NASA Exoplanet Archive",
      description: "A database of all known exoplanets and their properties.",
      endpoint: "https://exoplanetarchive.ipac.caltech.edu/"
    }
  ];

  return (
    <div className="data-sources-wrapper">
      <div className="data-sources-header">
        <h1 className="animated-title">Data Sources</h1>
        <p className="animated-desc">
          Explore the universe through NASA's open APIs and data sets
        </p>
      </div>
      
      <div className="sources-grid">
        {dataSources.map((source, index) => (
          <div key={index} className="source-card">
            <h3 className="source-title">{source.title}</h3>
            <p className="source-desc">{source.description}</p>
            <a 
              href={source.endpoint} 
              target="_blank" 
              rel="noopener noreferrer"
              className="source-link"
            >
              View API Documentation
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DataSources;