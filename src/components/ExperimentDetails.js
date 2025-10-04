import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import "./ExperimentDetails.css";
import {
  addBookmark,
  removeBookmark,
  isBookmarked,
} from "../utils/bookmarksUtils";

const ExperimentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [experiment, setExperiment] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState("all");
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    const fetchExperiment = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `http://localhost:5000/api/experiments/${id}`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch experiment");
        }

        const data = await response.json();
        setExperiment(data.experiment);
      } catch (err) {
        console.error("Error fetching experiment:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExperiment();
  }, [id]);

  useEffect(() => {
    if (experiment) {
      setBookmarked(isBookmarked(experiment.id));
    }
  }, [experiment]);

  const analyzeExperiment = async () => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch(
        `http://localhost:5000/api/experiments/${id}/analyze`,
        {
          method: "POST",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to analyze experiment");
      }

      const data = await response.json();
      setAnalysis(data.analysis);
    } catch (err) {
      console.error("Error analyzing experiment:", err);
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderMarkdown = (text) => {
    if (!text) return null;

    // Simple markdown parsing
    const lines = text.split("\n");
    return lines.map((line, index) => {
      // Headers
      if (line.startsWith("### ")) {
        return (
          <h3 key={index} className="md-h3">
            {line.replace("### ", "")}
          </h3>
        );
      }
      if (line.startsWith("## ")) {
        return (
          <h2 key={index} className="md-h2">
            {line.replace("## ", "")}
          </h2>
        );
      }
      if (line.startsWith("# ")) {
        return (
          <h1 key={index} className="md-h1">
            {line.replace("# ", "")}
          </h1>
        );
      }

      // Bold
      if (line.includes("**")) {
        const parts = line.split("**");
        return (
          <p key={index} className="md-p">
            {parts.map((part, i) =>
              i % 2 === 1 ? <strong key={i}>{part}</strong> : part,
            )}
          </p>
        );
      }

      // Lists
      if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
        return (
          <li key={index} className="md-li">
            {line.trim().substring(2)}
          </li>
        );
      }

      // Numbers lists
      if (/^\d+\./.test(line.trim())) {
        return (
          <li key={index} className="md-li">
            {line.trim().replace(/^\d+\.\s*/, "")}
          </li>
        );
      }

      // Empty line
      if (line.trim() === "") {
        return <br key={index} />;
      }

      // Regular paragraph
      return (
        <p key={index} className="md-p">
          {line}
        </p>
      );
    });
  };

  const renderSection = (sectionKey, sectionTitle) => {
    if (!analysis?.sections?.[sectionKey]) return null;

    return (
      <div className="analysis-section" id={sectionKey}>
        <div className="section-content">
          {renderMarkdown(analysis.sections[sectionKey])}
        </div>
      </div>
    );
  };

  const sectionNavigation = [
    { key: "all", title: "All Sections", icon: "☰" },
    { key: "executiveSummary", title: "Executive Summary", icon: "📋" },
    { key: "experimentDetails", title: "Experiment Details", icon: "🔬" },
    { key: "keyFindings", title: "Key Findings", icon: "🔑" },
    { key: "biologicalImpacts", title: "Biological Impacts", icon: "🧬" },
    { key: "knowledgeGraph", title: "Knowledge Graph", icon: "🕸️" },
    { key: "practicalApplications", title: "Applications", icon: "🚀" },
    { key: "researchConnections", title: "Research Connections", icon: "🔗" },
    { key: "visualInsights", title: "Visual Insights", icon: "📊" },
    { key: "futureResearch", title: "Future Research", icon: "🔮" },
  ];

  if (isLoading) {
    return (
      <div className="experiment-details-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading experiment...</p>
        </div>
      </div>
    );
  }

  const handleBookmarkToggle = () => {
    if (!experiment) return;

    if (bookmarked) {
      if (removeBookmark(experiment.id)) {
        setBookmarked(false);
      }
    } else {
      if (addBookmark(experiment)) {
        setBookmarked(true);
      }
    }
  };

  const handleBackToSearch = () => {
    // Check if we came from the search page with state
    if (location.state && location.state.fromSearch) {
      navigate("/search", {
        state: {
          preserveResults: true,
          searchQuery: location.state.searchQuery,
          searchResults: location.state.searchResults,
        },
      });
    } else {
      // Default fallback to search page
      navigate("/search");
    }
  };

  if (error && !experiment) {
    return (
      <div className="experiment-details-page">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate(-1)} className="back-btn">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="experiment-details-page">
      <div className="details-header-controls">
        <button onClick={handleBackToSearch} className="back-button">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Search
        </button>

        <button
          onClick={handleBookmarkToggle}
          className={`details-bookmark-button ${bookmarked ? "bookmarked" : ""}`}
          title={bookmarked ? "Remove from bookmarks" : "Add to bookmarks"}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill={bookmarked ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
          {bookmarked ? "Bookmarked" : "Bookmark"}
        </button>
      </div>

      <div className="experiment-details-wrapper">
        {/* Experiment Header */}
        <div className="experiment-header-section">
          <h1 className="experiment-main-title">{experiment?.title}</h1>

          <div className="experiment-meta">
            <div className="meta-item">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              <div>
                <strong>Authors:</strong>
                <p>{experiment?.authors}</p>
              </div>
            </div>

            <a
              href={experiment?.link}
              target="_blank"
              rel="noopener noreferrer"
              className="publication-link"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
              View Original Publication
            </a>
          </div>

          {!analysis && !isAnalyzing && (
            <button onClick={analyzeExperiment} className="analyze-main-btn">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 6v6l4 2"></path>
              </svg>
              Analyze with Gemini AI
            </button>
          )}
        </div>

        {/* Analysis Loading */}
        {isAnalyzing && (
          <div className="analysis-loading">
            <div className="loading-spinner-large"></div>
            <h3>Analyzing Experiment with Gemini AI...</h3>
            <p>
              This may take a minute as we generate a comprehensive analysis of
              the publication.
            </p>
          </div>
        )}

        {/* Analysis Error */}
        {error && analysis === null && (
          <div className="analysis-error">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <h3>Analysis Failed</h3>
            <p>{error}</p>
            <button onClick={analyzeExperiment} className="retry-btn">
              Try Again
            </button>
          </div>
        )}

        {/* Analysis Results */}
        {analysis && (
          <div className="analysis-container">
            <div className="analysis-header">
              <h2>
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                AI-Generated Analysis
              </h2>
              <span className="ai-badge">Powered by Gemini 2.0</span>
            </div>

            {/* Section Navigation */}
            <div className="section-navigation">
              {sectionNavigation.map((section) => (
                <button
                  key={section.key}
                  className={`nav-btn ${activeSection === section.key ? "active" : ""}`}
                  onClick={() => setActiveSection(section.key)}
                >
                  <span className="nav-icon">{section.icon}</span>
                  {section.title}
                </button>
              ))}
            </div>

            {/* Analysis Content */}
            <div className="analysis-content">
              {activeSection === "all" ? (
                <div className="all-sections">
                  {analysis.sections?.fullAnalysis ? (
                    <div className="full-analysis">
                      {renderMarkdown(analysis.sections.fullAnalysis)}
                    </div>
                  ) : (
                    <>
                      {renderSection("executiveSummary", "Executive Summary")}
                      {renderSection("experimentDetails", "Experiment Details")}
                      {renderSection("keyFindings", "Key Findings")}
                      {renderSection("biologicalImpacts", "Biological Impacts")}
                      {renderSection("knowledgeGraph", "Knowledge Graph")}
                      {renderSection(
                        "practicalApplications",
                        "Practical Applications",
                      )}
                      {renderSection(
                        "researchConnections",
                        "Research Connections",
                      )}
                      {renderSection("visualInsights", "Visual Insights")}
                      {renderSection("futureResearch", "Future Research")}
                    </>
                  )}
                </div>
              ) : (
                renderSection(activeSection, "")
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExperimentDetails;
