import React from 'react';
import './App.css';
import Background from './components/Background'; // Import the new component

function App() {
  return (
    <div className="App">
      {/* The Background component, which contains the Three.js scene, will take up the full screen */}
      <Background />
      
      {/* Other main application content can go here, but it should have 
        a higher z-index and appropriate styling to float above the 3D background.
      */}
      {/* <header className="App-header">
        <h1>My React App Content</h1>
        <p>This is my foreground content.</p>
      </header> */}
    </div>
  );
}

export default App;