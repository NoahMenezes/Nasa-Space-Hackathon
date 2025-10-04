import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./SearchEngine.css";
import {
  addBookmark,
  removeBookmark,
  isBookmarked,
} from "../utils/bookmarksUtils";

const SearchEngine = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [bookmarkedItems, setBookmarkedItems] = useState(new Set());
  const navigate = useNavigate();
  const location = useLocation();

  // Restore search state when navigating back from experiment details
  useEffect(() => {
    if (location.state && location.state.preserveResults) {
      setSearchQuery(location.state.searchQuery || "");
      setSearchResults(location.state.searchResults || []);
      setHasSearched(true);

      // Update bookmarked status for results
      const bookmarked = new Set();
      (location.state.searchResults || []).forEach((result) => {
        if (isBookmarked(result.id)) {
          bookmarked.add(result.id);
        }
      });
      setBookmarkedItems(bookmarked);
    }
  }, [location.state]);

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!searchQuery.trim()) {
      setError("Please enter a search term");
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/experiments/search",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query: searchQuery }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to search experiments");
      }

      setSearchResults(data.results || []);

      // Update bookmarked status for results
      const bookmarked = new Set();
      data.results.forEach((result) => {
        if (isBookmarked(result.id)) {
          bookmarked.add(result.id);
        }
      });
      setBookmarkedItems(bookmarked);

      if (data.results.length === 0) {
        setError(
          "No experiments found. Try different keywords or scientist names.",
        );
      }
    } catch (err) {
      console.error("Search error:", err);
      setError(err.message || "Failed to search. Please try again.");
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExperimentClick = (experimentId) => {
    navigate(`/experiment/${experimentId}`, {
      state: {
        fromSearch: true,
        searchQuery: searchQuery,
        searchResults: searchResults,
      },
    });
  };

  const handleBookmarkToggle = (experiment, e) => {
    e.stopPropagation(); // Prevent card click

    const experimentId = experiment.id;
    const isCurrentlyBookmarked = bookmarkedItems.has(experimentId);

    if (isCurrentlyBookmarked) {
      if (removeBookmark(experimentId)) {
        setBookmarkedItems((prev) => {
          const newSet = new Set(prev);
          newSet.delete(experimentId);
          return newSet;
        });
      }
    } else {
      if (addBookmark(experiment)) {
        setBookmarkedItems((prev) => new Set([...prev, experimentId]));
      }
    }
  };

  const highlightMatch = (text, query) => {
    if (!query.trim()) return text;

    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={index} className="highlight">
          {part}
        </mark>
      ) : (
        part
      ),
    );
  };

  const truncateAuthors = (authors, maxLength = 100) => {
    if (authors.length <= maxLength) return authors;
    return authors.substring(0, maxLength) + "...";
  };

  return (
    <div className="search-engine-page">
      <div className="search-engine-wrapper">
        <div className="search-engine-header">
          <h1 className="animated-title">NASA Bioscience Experiment Search</h1>
          <p className="animated-desc">
            Search for NASA bioscience experiments by name or scientist
          </p>
        </div>

        <div className="search-container-main">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-wrapper">
              <input
                type="text"
                placeholder="Enter experiment name or scientist name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="main-search-input"
                disabled={isLoading}
              />
              <button
                type="submit"
                className="search-button"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="spinner"></span>
                ) : (
                  <>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="11" cy="11" r="8"></circle>
                      <path d="m21 21-4.3-4.3"></path>
                    </svg>
                    Search
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="search-tips">
            <p>
              <strong>Search tips:</strong> Try searching for experiment topics
              (e.g., "microgravity", "bone loss") or scientist names (e.g.,
              "Ruth K Globus")
            </p>
          </div>
        </div>

        <div className="search-results">
          {isLoading && (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Searching experiments...</p>
            </div>
          )}

          {error && !isLoading && (
            <div className="error-message">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <p>{error}</p>
            </div>
          )}

          {!isLoading && !error && hasSearched && searchResults.length > 0 && (
            <div className="results-list">
              <div className="results-header">
                <h2>
                  Found {searchResults.length} experiment
                  {searchResults.length !== 1 ? "s" : ""}
                </h2>
              </div>

              <div className="experiments-grid">
                {searchResults.map((experiment) => (
                  <div
                    key={experiment.id}
                    className="experiment-card"
                    onClick={() => handleExperimentClick(experiment.id)}
                  >
                    <div className="experiment-header">
                      <h3 className="experiment-title">
                        {highlightMatch(experiment.title, searchQuery)}
                      </h3>
                    </div>

                    <div className="experiment-body">
                      <div className="experiment-authors">
                        <svg
                          width="16"
                          height="16"
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
                        <span>{truncateAuthors(experiment.authors)}</span>
                      </div>

                      <a
                        href={experiment.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="experiment-link"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                          <polyline points="15 3 21 3 21 9"></polyline>
                          <line x1="10" y1="14" x2="21" y2="3"></line>
                        </svg>
                        View Publication
                      </a>
                    </div>

                    <div className="experiment-footer">
                      <div className="experiment-actions">
                        <button
                          className={`bookmark-btn ${bookmarkedItems.has(experiment.id) ? "bookmarked" : ""}`}
                          onClick={(e) => handleBookmarkToggle(experiment, e)}
                          title={
                            bookmarkedItems.has(experiment.id)
                              ? "Remove from bookmarks"
                              : "Add to bookmarks"
                          }
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill={
                              bookmarkedItems.has(experiment.id)
                                ? "currentColor"
                                : "none"
                            }
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"></path>
                          </svg>
                          {bookmarkedItems.has(experiment.id)
                            ? "Bookmarked"
                            : "Bookmark"}
                        </button>

                        <button
                          className="analyze-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExperimentClick(experiment.id);
                          }}
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                          </svg>
                          Analyze with AI
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchEngine;
