import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./HomePage.css";

// Enhanced Cosmic Particle System
const CosmicParticles = () => {
  const [particles, setParticles] = useState([]);
  const containerRef = useRef(null);

  useEffect(() => {
    const generateParticles = () => {
      const newParticles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 1,
        speed: Math.random() * 0.5 + 0.1,
        opacity: Math.random() * 0.6 + 0.2,
        color: ["#67e8f9", "#8b5cf6", "#ec4899", "#fbbf24"][
          Math.floor(Math.random() * 4)
        ],
      }));
      setParticles(newParticles);
    };

    generateParticles();
  }, []);

  return (
    <div className="cosmic-particles" ref={containerRef}>
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="particle"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            opacity: particle.opacity,
            animationDuration: `${20 / particle.speed}s`,
            animationDelay: `${Math.random() * 20}s`,
          }}
        />
      ))}
    </div>
  );
};

// Enhanced Mission Card with Advanced Interactions
const MissionCard = ({
  title,
  description,
  icon,
  delay = 0,
  category,
  features = [],
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        }
      },
      { threshold: 0.1 },
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={cardRef}
      className={`mission-card ${isVisible ? "visible" : ""} ${isHovered ? "hovered" : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-category={category}
    >
      <div className="card-background"></div>
      <div className="card-content">
        <div className="card-header">
          <div className="card-icon">{icon}</div>
          <div className="card-category">{category}</div>
        </div>

        <h3 className="card-title">{title}</h3>
        <p className="card-description">{description}</p>

        {features.length > 0 && (
          <ul className="card-features">
            {features.map((feature, index) => (
              <li key={index} className="feature-item">
                <span className="feature-check">✓</span>
                {feature}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card-glow"></div>
    </div>
  );
};

// Interactive Statistics Counter
const StatCounter = ({ value, label, suffix = "", duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const counterRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.5 },
    );

    if (counterRef.current) {
      observer.observe(counterRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let startTime = null;
    const startValue = 0;
    const endValue = parseInt(value);

    const animate = (currentTime) => {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);

      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentCount = Math.floor(
        easeOutQuart * (endValue - startValue) + startValue,
      );

      setCount(currentCount);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isVisible, value, duration]);

  return (
    <div ref={counterRef} className="stat-counter">
      <div className="stat-number">
        {count.toLocaleString()}
        {suffix}
      </div>
      <div className="stat-label">{label}</div>
    </div>
  );
};

// Enhanced Hero Section with Typing Effect
const HeroSection = () => {
  const [typedText, setTypedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const phrases = [
      "Space Biology Research",
      "Lunar Mission Planning",
      "Biological Data Analysis",
      "Scientific Discovery",
    ];

    const currentPhrase = phrases[currentIndex];
    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          if (typedText.length < currentPhrase.length) {
            setTypedText(currentPhrase.slice(0, typedText.length + 1));
          } else {
            setTimeout(() => setIsDeleting(true), 2000);
          }
        } else {
          if (typedText.length > 0) {
            setTypedText(typedText.slice(0, -1));
          } else {
            setIsDeleting(false);
            setCurrentIndex((prev) => (prev + 1) % phrases.length);
          }
        }
      },
      isDeleting ? 50 : 100,
    );

    return () => clearTimeout(timeout);
  }, [typedText, currentIndex, isDeleting]);

  return (
    <section className="hero-section">
      <div className="hero-content">
        <div className="hero-badge">
          <span className="badge-icon">🚀</span>
          NASA Space Biology Knowledge Engine
        </div>

        <h1 className="hero-title">
          Advancing Human
          <br />
          <span className="hero-highlight">
            {typedText}
            <span className="cursor">|</span>
          </span>
        </h1>

        <p className="hero-subtitle">
          Unlock decades of NASA space biology research to enable the next era
          of human exploration beyond Earth. From microgravity experiments to
          deep space missions.
        </p>

        <div className="hero-stats">
          <StatCounter value="608" label="Experiments" />
          <StatCounter value="50" label="Years of Data" suffix="+" />
          <StatCounter value="100.100" label="Success Rate" suffix="%" />
        </div>
      </div>
    </section>
  );
};

// Feature Showcase Section
const FeaturesSection = () => {
  const features = [
    {
      icon: "🧬",
      title: "Biological Data Integration",
      description:
        "Consolidate decades of NASA space biology experiments into a unified, searchable knowledge base.",
      category: "Data Management",
      features: [
        "Unified Database",
        "Smart Categorization",
        "Real-time Updates",
      ],
    },
    {
      icon: "🔍",
      title: "Advanced Research Search",
      description:
        "Find relevant studies using AI-powered search across plant growth, microbial behavior, and human physiology.",
      category: "Search & Discovery",
      features: [
        "AI-Powered Search",
        "Natural Language Queries",
        "Smart Filtering",
      ],
    },
    {
      icon: "✨",
      title: "Futuristic UI Experience",
      description:
        "Immerse yourself in a beautifully crafted, space-themed interface with smooth animations and intuitive cosmic design elements.",
      category: "User Interface",
      features: [
        "Cosmic Design Theme",
        "Smooth Animations",
        "Responsive Layout",
      ],
    },
    {
      icon: "🤖",
      title: "Machine Learning Insights",
      description:
        "Leverage AI to identify patterns and predict biological responses to space conditions.",
      category: "AI & Analytics",
      features: [
        "Predictive Models",
        "Pattern Recognition",
        "Automated Analysis",
      ],
    },
    {
      icon: "🚀",
      title: "Mission Planning Support",
      description:
        "Critical biological research data to inform mission design and astronaut health protocols.",
      category: "Mission Planning",
      features: ["Mission Templates", "Risk Assessment", "Protocol Generation"],
    },
    {
      icon: "🕸️",
      title: "Interactive Knowledge Graphs",
      description:
        "Navigate complex relationships between experiments, organisms, and research findings through beautiful, interactive network visualizations.",
      category: "User Experience",
      features: [
        "Network Visualization",
        "Relationship Mapping",
        "Intuitive Navigation",
      ],
    },
  ];

  return (
    <section className="features-section">
      <div className="section-header">
        <h2 className="section-title">Mission Capabilities</h2>
        <p className="section-subtitle">
          Discover how our platform accelerates space biology research and
          mission planning
        </p>
      </div>

      <div className="features-grid">
        {features.map((feature, index) => (
          <MissionCard key={index} {...feature} delay={index * 100} />
        ))}
      </div>
    </section>
  );
};

// Call-to-Action Section
const CTASection = () => {
  const { user } = useAuth();

  return (
    <section className="cta-section">
      <div className="cta-content">
        <div className="cta-logo">
          <div className="logo-container">
            <div className="logo-orbit">
              <div className="logo-planet"></div>
              <div className="logo-ring"></div>
            </div>
            <div className="logo-dna">
              <div className="dna-strand strand-1"></div>
              <div className="dna-strand strand-2"></div>
            </div>
          </div>
        </div>
        <h2 className="cta-title">Ready to Explore Space Biology?</h2>
        <p className="cta-description">
          Join thousands of researchers, scientists, and mission planners who
          rely on our comprehensive database for their space biology research.
        </p>

        {!user && (
          <div className="cta-actions">
            <Link to="/login" className="btn-cta btn-cta-primary">
              <span className="btn-icon">🔓</span>
              <span className="btn-text">Login to Explore</span>
              <div className="btn-shimmer"></div>
            </Link>
            <Link to="/signup" className="btn-cta btn-cta-secondary">
              <span className="btn-icon">✨</span>
              <span className="btn-text">Create Account</span>
              <div className="btn-shimmer"></div>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

// Main HomePage Component
const HomePage = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Trigger entrance animations after component mounts
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Add scroll event listener for navbar styling
    const handleScroll = () => {
      const navbar = document.querySelector(".navbar");
      if (navbar) {
        if (window.scrollY > 50) {
          navbar.classList.add("scrolled");
        } else {
          navbar.classList.remove("scrolled");
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className={`home-page ${isLoaded ? "loaded" : ""}`}>
      <CosmicParticles />

      <HeroSection />
      <FeaturesSection />
      <CTASection />

      {/* Floating Action Button */}
      <button
        className="fab"
        onClick={() => {
          const appContainer = document.querySelector(".App");
          if (appContainer) {
            appContainer.scrollTo({ top: 0, behavior: "smooth" });
          }
        }}
        aria-label="Scroll to top"
      >
        ↑
      </button>
    </div>
  );
};

export default HomePage;
