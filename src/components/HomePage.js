import React, { useState } from 'react';

// --- Cosmic Particle Overlay (for extra immersion) ---
const CosmicParticles = () => (
  <div className="cosmic-particles">
    {[...Array(40)].map((_, i) => (
      <span key={i} className={`particle particle-${i}`} />
    ))}
    <style>
      {`
        .cosmic-particles {
          position: fixed;
          inset: 0;
          z-index: 2;
          pointer-events: none;
          overflow: hidden;
        }
        .particle {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(circle, #67e8f9 0%, #0891b2 100%);
          opacity: 0.25;
          animation: floatCosmic 20s linear infinite;
        }
        ${[...Array(40)].map((_, i) => `
          .particle-${i} {
            width: ${5 + Math.random() * 10}px;
            height: ${5 + Math.random() * 10}px;
            left: ${Math.random() * 100}vw;
            top: ${Math.random() * 100}vh;
            animation-delay: ${Math.random() * 20}s;
          }
        `).join("")}
        @keyframes floatCosmic {
          0% { transform: translateY(0) scale(1); opacity: 0.27; }
          60% { transform: translateY(-20px) scale(1.05); opacity: 0.22;}
          100% { transform: translateY(10px) scale(0.95); opacity: 0.19;}
        }
      `}
    </style>
  </div>
);

// --- Mission Card UI ---
const MissionCard = ({ title, description, icon }) => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <div
      className={`mission-card${isHovered ? " hovered" : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="card-icon">{icon}</div>
      <h3 className="card-title">{title}</h3>
      <p className="card-desc">{description}</p>
      <style>
        {`
          .mission-card {
            position: relative;
            flex: 1;
            min-width: 280px;
            max-width: 380px;
            padding: 2.5rem 2rem 2rem 2rem;
            margin-bottom: 0.5rem;
            border-radius: 1.5rem;
            background: rgba(17,24,39,0.6);
            border: 2.5px solid rgba(103,232,249,0.12);
            box-shadow: 0 6px 24px 0 rgba(0,0,0,0.75), 0 0 0 0 #67e8f9;
            backdrop-filter: blur(11px);
            color: white;
            text-align: center;
            transition: all 0.32s cubic-bezier(.17,.67,.83,.67);
            cursor: pointer;
            overflow: hidden;
          }
          .mission-card:before {
            content: '';
            position: absolute;
            inset: -2px;
            border-radius: 1.7rem;
            padding: 0.5rem;
            background: linear-gradient(120deg, #06b6d4 0%, #67e8f9 50%, #0ea5e9 100%);
            opacity: 0;
            z-index: 1;
            transition: opacity 0.32s;
          }
          .mission-card.hovered:before {
            opacity: 0.17;
            animation: borderSweep 1.6s linear infinite;
          }
          @keyframes borderSweep {
            0% { filter: blur(0.5px); }
            50% { filter: blur(3px)}
            100% { filter: blur(0.5px);}
          }
          .mission-card.hovered {
            border: 2.5px solid #67e8f9;
            box-shadow: 0 0 38px 0 rgba(67,232,249,0.21), 0 6px 24px 0 rgba(0,0,0,0.85);
            transform: translateY(-9px) scale(1.032);
          }
          .card-icon {
            font-size: 3.2rem;
            color: ${isHovered ? "#67e8f9" : "#0ea5e9"};
            margin-bottom: 1.2rem;
            filter: drop-shadow(0 0 7px #4adeea);
            transition: color 0.36s, transform 0.36s;
            transform: ${isHovered ? "rotate(-12deg) scale(1.12)" : "rotate(0deg)"};
          }
          .card-title {
            font-size: 1.52rem;
            font-weight: 800;
            margin-bottom: 0.7rem;
            letter-spacing: 0.08em;
            font-family: 'Orbitron', 'Montserrat', 'Segoe UI', Arial, sans-serif;
            color: #67e8f9;
            text-shadow: 0 2px 14px rgba(103,232,249,0.25);
          }
          .card-desc {
            color: #e0f2fe;
            font-size: 1.08rem;
            font-weight: 500;
            letter-spacing: 0.01em;
            line-height: 1.6;
            font-family: 'Montserrat', 'Segoe UI', Arial, sans-serif;
            text-shadow: 0 2px 10px rgba(17,24,39,0.45);
            margin-top: 0.3rem;
          }
        `}
      </style>
    </div>
  );
};

// --- Main Page UI ---
const HomePage = () => {
  return (
    <div className="home-cosmic-page">
      <CosmicParticles />
      {/* --- Hero Header --- */}
      <header className="cosmic-header">
        <h1 className="cosmic-title">
          SPACE BIOLOGY KNOWLEDGE ENGINE
        </h1>
        <p className="cosmic-subtitle">
          Unlocking decades of NASA space biology research to enable<br />
          the next era of human exploration beyond Earth
        </p>
        <div className="cosmic-cta">
          <a
            href="#/data-sources"
            className="mission-btn"
          >
            Access Research Database
          </a>
        </div>
      </header>

      <section className="mission-section">
        <h2 className="objectives-title">MISSION CAPABILITIES</h2>
        <div className="cards-grid-cosmic">
          <MissionCard
            icon="🧬"
            title="Biological Data Integration"
            description="Consolidate and organize decades of NASA space biology experiments into a unified, searchable knowledge base for lunar and deep space missions."
          />
          <MissionCard
            icon="🔍"
            title="Advanced Research Search"
            description="Quickly find relevant biological studies across plant growth, microbial behavior, and human physiology in space environments using intelligent search algorithms."
          />
          <MissionCard
            icon="📊"
            title="Experiment Visualization"
            description="Transform complex biological data into interactive visualizations, showing plant growth patterns, microbial changes, and physiological adaptations in space."
          />
          <MissionCard
            icon="🤖"
            title="AI-Powered Insights"
            description="Leverage machine learning to identify patterns and predict biological responses to space conditions, accelerating research for future missions."
          />
          <MissionCard
            title="Mission Planning Support"
            icon="🚀"
            description="Provide critical biological research data to inform mission design, life support systems, and astronaut health protocols for lunar settlements."
          />
          <MissionCard
            icon="🌱"
            title="Flora & Fauna Database"
            description="Comprehensive catalog of space-grown plants and biological organisms with their adaptation data, growth requirements, and research findings."
          />
        </div>
      </section>

      {/* --- UI & Font Styles --- */}
      <style>
        {`
          .home-cosmic-page {
            position: absolute;
            inset: 0;
            width: 100vw;
            min-height: 100vh;
            z-index: 3;
            box-sizing: border-box;
            pointer-events: none;
            overflow-x: hidden;
          }
          .cosmic-header {
            position: relative;
            text-align: center;
            width: 100vw;
            padding: 4.5rem 2vw 2.2rem;
            margin: 0 auto;
            max-width: 1080px;
            pointer-events: auto;
            z-index: 10;
          }
          .cosmic-title {
            font-family: 'Orbitron', 'Montserrat', 'Segoe UI', Arial, sans-serif;
            font-size: clamp(2.5rem, 8vw, 4.8rem);
            font-weight: 900;
            color: #67e8f9;
            letter-spacing: 0.18em;
            text-shadow: 0 0 40px rgba(67,232,249,0.64), 0 0 22px #0891b2;
            margin-bottom: 1rem;
            animation: cosmicGlow 2.5s ease-in-out infinite alternate;
          }
          @keyframes cosmicGlow {
            0% {text-shadow: 0 0 40px #67e8f9;}
            100% {text-shadow: 0 0 70px #67e8f9;}
          }
          .cosmic-subtitle {
            font-size: clamp(1.1rem, 2.8vw, 1.55rem);
            color: #e0f2fe;
            font-family: 'Montserrat', 'Segoe UI', Arial, sans-serif;
            font-weight: 500;
            text-shadow: 0 0 8px #000, 0 2px 15px #0ea5e9;
            margin-bottom: 0.8rem;
          }
          .cosmic-cta {
            margin-top: 2.8rem;
          }
          .mission-btn {
            display: inline-block;
            padding: 1rem 2.2rem;
            font-family: 'Orbitron', Arial, sans-serif;
            font-size: 1.15rem;
            font-weight: 700;
            border-radius: 0.8rem;
            background: linear-gradient(90deg, #0ea5e9 0%, #67e8f9 100%);
            color: #fff;
            box-shadow: 0 6px #0891b2, 0 0 18px #67e8f9;
            text-decoration: none;
            transition: background-position 0.22s, box-shadow 0.23s, transform 0.22s;
            pointer-events: auto;
            background-size: 200% 100%;
            background-position: left;
            border: none;
            outline: none;
          }
          .mission-btn:hover, .mission-btn:focus {
            background-position: right;
            box-shadow: 0 0 24px #67e8f9, 0 6px #0891b2;
            transform: scale(1.04);
            animation: pulseCosmic 1.8s cubic-bezier(.45,.27,.38,.85) infinite;
          }
          @keyframes pulseCosmic {
            0%,100% { filter: brightness(1);}
            50% { filter: brightness(1.12);}
          }

          .mission-section {
            width: 100vw;
            max-width: 1200px;
            margin: 0 auto;
            pointer-events: auto;
            z-index: 14;
          }
          .objectives-title {
            text-align: center;
            font-size: 2.08rem;
            font-weight: 800;
            color: #fff;
            margin-top: 2.2rem;
            margin-bottom: 2.6rem;
            letter-spacing: 0.08em;
            font-family: 'Orbitron', 'Montserrat', 'Segoe UI', Arial, sans-serif;
            text-shadow: 0 0 13px #0891b2, 0 2px 21px #67e8f9;
          }
          .cards-grid-cosmic {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 2.7rem;
            padding: 2rem 1.5vw 5.5rem 1.5vw;
          }
          @media (max-width: 900px) {
            .cards-grid-cosmic {
              gap: 2rem;
              padding-bottom: 2.5rem;
            }
            .mission-card { min-width: 240px; max-width: 340px;}
          }
          @media (max-width: 650px) {
            .cosmic-header { padding: 2.2rem 1vw 1rem;}
            .cosmic-title { font-size: 2.1rem;}
            .objectives-title { font-size: 1.45rem;}
            .cards-grid-cosmic { flex-direction: column; gap: 1.7rem;}
          }
        `}
      </style>
      {/* Orbitron font for more futuristic feel; can be replaced if needed */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&display=swap" />
      
    </div>
  );
}

export default HomePage;