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

  const handleDelete = (bookmarkId) => {
    // Add your delete functionality here
    console.log('Deleting bookmark:', bookmarkId);
    // You can implement the actual delete logic here
  };

  return (
    <div className="bookmarks-page">
      <div className="bookmarks-wrapper">
        <div className="bookmarks-header">
          <h1 className="animated-title">My Bookmarks</h1>
          <p className="animated-desc">
            Your saved space discoveries and favorite NASA resources
          </p>
        </div>
        
        <div className="bookmarks-grid">
          {bookmarks.length > 0 ? (
            bookmarks.map(bookmark => (
              <div key={bookmark.id} className="bookmark-card">
                <div className="bookmark-header">
                  <h3 className="bookmark-title">{bookmark.title}</h3>
                </div>
                <p className="bookmark-desc">{bookmark.description}</p>
                <div className="bookmark-actions">
                  {/* Delete button in bottom right corner */}
                  <button 
                    onClick={() => handleDelete(bookmark.id)} 
                    className="bookmark-delete-btn"
                    aria-label="Delete bookmark"
                  >
                    <img 
                      src="/src/images/delete.png" 
                      alt="Delete" 
                      className="delete-icon"
                    />
                  </button>
                </div>
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