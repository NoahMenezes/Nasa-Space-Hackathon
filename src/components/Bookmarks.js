import React from 'react';
import './Bookmarks.css';

const Bookmarks = () => {
  // Sample bookmarks data - you can replace this with real data
  const bookmarks = [
    {
      id: 1,
      title: "Mars Curiosity Rover",
      description: "Latest images and data from the Curiosity rover on Mars",
      url: "#"
    },
    {
      id: 2,
      title: "James Webb Space Telescope",
      description: "Stunning deep space images from NASA's newest telescope",
      url: "#"
    },
    {
      id: 3,
      title: "International Space Station",
      description: "Live tracking and information about the ISS",
      url: "#"
    }
  ];

  const handleDeleteAll = () => {
    // Add your delete all functionality here
    console.log('Deleting all bookmarks');
    // You can implement the actual delete all logic here
  };

  return (
    <div className="bookmarks-page">
      <div className="bookmarks-wrapper">
        <div className="bookmarks-header">
          <div className="header-content">
            <h1 className="animated-title">My Bookmarks</h1>
            {/* Dustbin button replacing the description */}
            <button 
              onClick={handleDeleteAll} 
              className="delete-all-btn"
              aria-label="Delete all bookmarks"
            >
              <img 
                src="delete.png" 
                alt="Delete All" 
                className="delete-all-icon"
              />
              <span className="delete-all-text">Clear All Bookmarks</span>
            </button>
          </div>
        </div>
        
        <div className="bookmarks-grid">
          {bookmarks.length > 0 ? (
            bookmarks.map(bookmark => (
              <div key={bookmark.id} className="bookmark-card">
                <div className="bookmark-header">
                  <h3 className="bookmark-title">{bookmark.title}</h3>
                </div>
                <p className="bookmark-desc">{bookmark.description}</p>
              </div>
            ))
          ) : (
            <div className="no-bookmarks">
              <div className="no-bookmarks-icon">⭐</div>
              <h3>No Bookmarks Yet</h3>
              <p>Start exploring and save your favorite space discoveries here!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Bookmarks;