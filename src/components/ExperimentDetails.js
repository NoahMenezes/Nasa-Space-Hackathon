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

        // Automatically trigger analysis after experiment is loaded
        await analyzeExperimentAuto(data.experiment);
      } catch (err) {
        console.error("Error fetching experiment:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExperiment();
  }, [id]);

  const analyzeExperimentAuto = async (experimentData) => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch(
        `http://localhost:5000/api/experiments/${experimentData.id}/analyze`,
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

  const getHeaderIcon = (headerText, level) => {
    const text = headerText.toLowerCase();

    // Main section icons
    if (text.includes("executive") || text.includes("summary")) return "📋";
    if (text.includes("experiment") && text.includes("detail")) return "🔬";
    if (text.includes("key finding")) return "🔑";
    if (text.includes("biological") && text.includes("impact")) return "🧬";
    if (text.includes("knowledge") && text.includes("graph")) return "🕸️";
    if (text.includes("application")) return "🚀";
    if (text.includes("research") && text.includes("connection")) return "🔗";
    if (text.includes("visual") && text.includes("insight")) return "📊";
    if (text.includes("future") && text.includes("research")) return "🔮";

    // Sub-section icons
    if (text.includes("research question") || text.includes("hypothesis"))
      return "❓";
    if (text.includes("methodology") || text.includes("method")) return "⚙️";
    if (text.includes("subject") || text.includes("condition")) return "🧪";
    if (text.includes("timeline")) return "📅";
    if (text.includes("cellular")) return "🦠";
    if (text.includes("physiological")) return "💪";
    if (text.includes("molecular") || text.includes("genetic")) return "🧬";
    if (text.includes("health") || text.includes("medical")) return "⚕️";
    if (text.includes("space") && text.includes("exploration")) return "🛸";
    if (text.includes("mars")) return "🔴";
    if (text.includes("earth") || text.includes("clinical")) return "🌍";
    if (text.includes("technology") || text.includes("development"))
      return "⚡";
    if (text.includes("mission")) return "🛰️";
    if (text.includes("interdisciplinary")) return "🔬";
    if (
      text.includes("chart") ||
      text.includes("graph") ||
      text.includes("visualization")
    )
      return "📈";
    if (text.includes("open question")) return "❔";
    if (text.includes("follow-up") || text.includes("suggested")) return "🔄";
    if (text.includes("gap")) return "🕳️";
    if (text.includes("roadmap") || text.includes("next step")) return "🗺️";

    // Generic icons by level
    if (level === 1) return "📄";
    if (level === 2) return "📌";
    if (level === 3) return "▪️";

    return null;
  };

  const renderMarkdown = (text) => {
    if (!text) return null;

    const lines = text.split("\n");
    const elements = [];
    let currentList = [];
    let currentListType = null;
    let inCodeBlock = false;
    let codeBlockLines = [];
    let tableLines = [];
    let inTable = false;

    const flushList = () => {
      if (currentList.length > 0) {
        const ListTag = currentListType === "ordered" ? "ol" : "ul";
        elements.push(
          <ListTag key={`list-${elements.length}`} className="md-list">
            {currentList}
          </ListTag>,
        );
        currentList = [];
        currentListType = null;
      }
    };

    const flushCodeBlock = () => {
      if (codeBlockLines.length > 0) {
        elements.push(
          <pre key={`code-${elements.length}`} className="md-code-block">
            <code>{codeBlockLines.join("\n")}</code>
          </pre>,
        );
        codeBlockLines = [];
      }
    };

    const flushTable = () => {
      if (tableLines.length > 0) {
        const headers = tableLines[0].split("|").filter((cell) => cell.trim());
        const rows = tableLines
          .slice(2)
          .map((row) => row.split("|").filter((cell) => cell.trim()));

        elements.push(
          <div key={`table-${elements.length}`} className="md-table-wrapper">
            <table className="md-table">
              <thead>
                <tr>
                  {headers.map((header, i) => (
                    <th key={i}>{header.trim()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => (
                      <td key={j}>{cell.trim()}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>,
        );
        tableLines = [];
      }
    };

    const processBoldAndItalic = (text) => {
      const parts = [];
      let current = "";
      let i = 0;

      while (i < text.length) {
        if (text.substr(i, 2) === "**") {
          if (current) parts.push(current);
          current = "";
          const endIndex = text.indexOf("**", i + 2);
          if (endIndex !== -1) {
            parts.push(
              <strong key={`b-${i}`}>{text.substring(i + 2, endIndex)}</strong>,
            );
            i = endIndex + 2;
            continue;
          }
        } else if (
          text[i] === "*" &&
          text[i - 1] !== "*" &&
          text[i + 1] !== "*"
        ) {
          if (current) parts.push(current);
          current = "";
          const endIndex = text.indexOf("*", i + 1);
          if (endIndex !== -1 && text[endIndex + 1] !== "*") {
            parts.push(
              <em key={`i-${i}`}>{text.substring(i + 1, endIndex)}</em>,
            );
            i = endIndex + 1;
            continue;
          }
        }
        current += text[i];
        i++;
      }

      if (current) parts.push(current);
      return parts.length > 1 ? parts : text;
    };

    lines.forEach((line, index) => {
      // Code blocks
      if (line.trim().startsWith("```")) {
        if (inCodeBlock) {
          flushCodeBlock();
          inCodeBlock = false;
        } else {
          flushList();
          inCodeBlock = true;
        }
        return;
      }

      if (inCodeBlock) {
        codeBlockLines.push(line);
        return;
      }

      // Tables
      if (line.trim().startsWith("|") && line.trim().endsWith("|")) {
        if (!inTable) {
          flushList();
          inTable = true;
        }
        tableLines.push(line);
        return;
      } else if (inTable) {
        flushTable();
        inTable = false;
      }

      // Headers
      if (line.startsWith("### ")) {
        flushList();
        const headerText = line.replace("### ", "");
        const icon = getHeaderIcon(headerText, 3);
        elements.push(
          <h3 key={index} className="md-h3">
            {icon && <span className="header-icon">{icon}</span>}
            {headerText}
          </h3>,
        );
        return;
      }
      if (line.startsWith("## ")) {
        flushList();
        const headerText = line.replace("## ", "");
        const icon = getHeaderIcon(headerText, 2);
        elements.push(
          <h2 key={index} className="md-h2">
            {icon && <span className="header-icon">{icon}</span>}
            {headerText}
          </h2>,
        );
        return;
      }
      if (line.startsWith("# ")) {
        flushList();
        const headerText = line.replace("# ", "");
        const icon = getHeaderIcon(headerText, 1);
        elements.push(
          <h1 key={index} className="md-h1">
            {icon && <span className="header-icon">{icon}</span>}
            {headerText}
          </h1>,
        );
        return;
      }

      // Blockquotes
      if (line.trim().startsWith("> ")) {
        flushList();
        elements.push(
          <blockquote key={index} className="md-blockquote">
            {processBoldAndItalic(line.trim().substring(2))}
          </blockquote>,
        );
        return;
      }

      // Horizontal rule
      if (line.trim() === "---" || line.trim() === "***") {
        flushList();
        elements.push(<hr key={index} className="md-hr" />);
        return;
      }

      // Ordered Lists
      if (/^\d+\./.test(line.trim())) {
        if (currentListType !== "ordered") {
          flushList();
          currentListType = "ordered";
        }
        const content = line.trim().replace(/^\d+\.\s*/, "");
        currentList.push(
          <li key={index} className="md-li">
            {processBoldAndItalic(content)}
          </li>,
        );
        return;
      }

      // Unordered Lists
      if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
        if (currentListType !== "unordered") {
          flushList();
          currentListType = "unordered";
        }
        const content = line.trim().substring(2);
        currentList.push(
          <li key={index} className="md-li">
            {processBoldAndItalic(content)}
          </li>,
        );
        return;
      }

      // Empty line
      if (line.trim() === "") {
        flushList();
        elements.push(<div key={index} className="md-spacer" />);
        return;
      }

      // Regular paragraph
      flushList();
      const content = processBoldAndItalic(line);
      elements.push(
        <p key={index} className="md-p">
          {content}
        </p>,
      );
    });

    // Flush any remaining elements
    flushList();
    flushCodeBlock();
    flushTable();

    return <div className="markdown-content">{elements}</div>;
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
        </div>

        {/* Analysis Loading */}
        {isAnalyzing && (
          <div className="analysis-loading">
            <div className="loading-spinner-large"></div>
            <h3>Analyzing Experiment with AI...</h3>
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
