import React from 'react';
import './PlaceholderPage.css'; // Importing the external CSS

/**
 * A generic page component used for placeholder routes (Data Sources, Model, Team).
 * It ensures the content is correctly positioned and styled over the 3D background
 * using the shared dark, translucent theme.
 */
const PlaceholderPage = ({ title, description }) => {
    return (
        // .content-page-container is defined in App.css for centering and z-index 60
        <div className="content-page-container">
            {/* .page-card inherits the shared translucent styling from App.css */}
            <div className="page-card">
                <h2 className="page-title">{title}</h2>
                <p className="page-description">{description}</p>

                {/* Example Content Block (using classes defined in PlaceholderPage.css) */}
                <div className="data-display-block">
                    <p className="data-status">Status: Online</p>
                    <p className="data-status status-ready">Connection Secured: **Active Link**</p>
                    <p>This component ensures that all secondary content is easily readable and centered on the screen, floating aesthetically above the dynamic solar system in the background. The translucent card design maintains the immersive space theme.</p>
                </div>
                
                <a href="#/" className="back-link">
                    &larr; Return to Dashboard
                </a>
            </div>
        </div>
    );
};

export default PlaceholderPage;
