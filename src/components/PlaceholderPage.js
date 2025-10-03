import React from 'react';
import './PlaceholderPage.css'; // We'll create this CSS file

const PlaceholderPage = ({ title, description }) => {
    return (
        <div className="placeholder-container">
            <h1 className="placeholder-title">{title}</h1>
            <p className="placeholder-description">{description}</p>
        </div>
    );
};

export default PlaceholderPage;