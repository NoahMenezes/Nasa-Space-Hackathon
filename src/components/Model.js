
import React from 'react';

const Model = () => {
  const styles = {
    pageContainer: {
      position: 'relative',
      zIndex: 10,
      minHeight: '100vh',
      paddingTop: '5rem',
      pointerEvents: 'auto'
    },
    modelWrapper: {
      maxWidth: '1080px',
      margin: '0 auto',
      padding: '3.2rem 2vw 2.2rem',
      color: '#e0f7fa',
      background: 'rgba(12,16,36,.85)',
      borderRadius: '2rem',
      boxShadow: '0 12px 42px rgba(67,232,249,.15)',
      position: 'relative'
    },
    modelHeader: {
      textAlign: 'center',
      marginBottom: '3rem'
    },
    animatedTitle: {
      fontSize: '2.8rem',
      fontWeight: 900,
      color: '#67e8f9',
      letterSpacing: '.09em',
      marginBottom: '.6rem',
      textShadow: '0 0 24px #67e8f9cc'
    },
    animatedDesc: {
      fontSize: '1.27rem',
      color: '#e0f2fe',
      marginBottom: '.8rem',
      textShadow: '0 2px 15px #222b'
    },
    featuresGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
      gap: '1.5rem',
      marginBottom: '3rem'
    },
    featureCard: {
      background: 'rgba(30, 41, 59, 0.8)',
      borderRadius: '1rem',
      padding: '2rem 1.5rem',
      border: '1px solid rgba(99, 102, 241, 0.3)',
      transition: 'all 0.3s ease',
      textAlign: 'center'
    },
    featureIcon: {
      fontSize: '3rem',
      marginBottom: '1rem'
    },
    featureTitle: {
      fontSize: '1.3rem',
      fontWeight: 700,
      color: '#67e8f9',
      marginBottom: '0.75rem'
    },
    featureDesc: {
      color: '#e2e8f0',
      fontSize: '0.95rem',
      lineHeight: 1.5
    },
    modelStats: {
      display: 'flex',
      justifyContent: 'space-around',
      flexWrap: 'wrap',
      gap: '2rem',
      padding: '2rem 0',
      borderTop: '1px solid rgba(103, 232, 249, 0.2)'
    },
    statItem: {
      textAlign: 'center'
    },
    statNumber: {
      fontSize: '2.5rem',
      fontWeight: 900,
      color: '#67e8f9',
      textShadow: '0 0 20px #67e8f9aa',
      marginBottom: '0.5rem'
    },
    statLabel: {
      color: '#e0f2fe',
      fontSize: '0.9rem',
      textTransform: 'uppercase',
      letterSpacing: '0.1em'
    }
  };

  const modelFeatures = [
    {
      icon: "🧠",
      title: "Neural Architecture",
      description: "Advanced deep learning models trained on NASA's extensive space data archives."
    },
    {
      icon: "📊",
      title: "Data Processing",
      description: "Real-time analysis of astronomical observations and satellite telemetry."
    },
    {
      icon: "🔮",
      title: "Predictive Analytics",
      description: "Forecasting space weather events and planetary phenomena with high accuracy."
    },
    {
      icon: "⚡",
      title: "Performance",
      description: "Optimized algorithms delivering results in milliseconds for mission-critical decisions."
    }
  ];

  return (
    <div style={styles.pageContainer}>
      <div style={styles.modelWrapper}>
        <div style={styles.modelHeader}>
          <h1 style={styles.animatedTitle}>Predictive Model</h1>
          <p style={styles.animatedDesc}>
            Cutting-edge AI algorithms powering space exploration insights
          </p>
        </div>
        
        <div style={styles.featuresGrid}>
          {modelFeatures.map((feature, index) => (
            <div 
              key={index} 
              style={styles.featureCard}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 15px 30px rgba(99, 102, 241, 0.3)';
                e.currentTarget.style.borderColor = 'rgba(103, 232, 249, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.3)';
              }}
            >
              <div style={styles.featureIcon}>{feature.icon}</div>
              <h3 style={styles.featureTitle}>{feature.title}</h3>
              <p style={styles.featureDesc}>{feature.description}</p>
            </div>
          ))}
        </div>

        <div style={styles.modelStats}>
          <div style={styles.statItem}>
            <div style={styles.statNumber}>99.7%</div>
            <div style={styles.statLabel}>Accuracy</div>
          </div>
          <div style={styles.statItem}>
            <div style={styles.statNumber}>12ms</div>
            <div style={styles.statLabel}>Avg Response</div>
          </div>
          <div style={styles.statItem}>
            <div style={styles.statNumber}>1.2M</div>
            <div style={styles.statLabel}>Data Points</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Model;