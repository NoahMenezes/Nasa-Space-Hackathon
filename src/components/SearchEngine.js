import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./SearchEngine.css";
// NOTE: Assuming you have this utility file available
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
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState("all");
  const [pageLoaded, setPageLoaded] = useState(false);
  const resultsPerPage = 6;

  const navigate = useNavigate();
  const location = useLocation();

  // Page loading effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Load persisted search state on component mount
  useEffect(() => {
    const loadPersistedState = () => {
      try {
        const persistedState = localStorage.getItem("searchEngineState");
        if (persistedState) {
          const { searchQuery, searchResults, hasSearched } =
            JSON.parse(persistedState);
          setSearchQuery(searchQuery || "");
          setSearchResults(searchResults || []);
          setHasSearched(hasSearched || false);

          // Update bookmarked status for results
          const bookmarked = new Set();
          (searchResults || []).forEach((result) => {
            if (isBookmarked(result.id)) {
              bookmarked.add(result.id);
            }
          });
          setBookmarkedItems(bookmarked);
        }
      } catch (error) {
        console.error("Error loading persisted search state:", error);
      }
    };

    // Check for navigation state first (higher priority)
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
    } else {
      // Load from localStorage if no navigation state
      loadPersistedState();
    }
  }, [location.state]);

  // Persist search state to localStorage
  const persistSearchState = (query, results, searched) => {
    try {
      const stateToSave = {
        searchQuery: query,
        searchResults: results,
        hasSearched: searched,
        timestamp: Date.now(),
      };
      localStorage.setItem("searchEngineState", JSON.stringify(stateToSave));
    } catch (error) {
      console.error("Error persisting search state:", error);
    }
  };

  // Clear persisted search state
  const clearPersistedState = () => {
    try {
      localStorage.removeItem("searchEngineState");
    } catch (error) {
      console.error("Error clearing persisted search state:", error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!searchQuery.trim()) {
      setError("Please enter a search term");
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasSearched(true);
    setCurrentPage(1);

    try {
      // NOTE: This URL needs to be accessible for the search to work
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
      (data.results || []).forEach((result) => {
        if (isBookmarked(result.id)) {
          bookmarked.add(result.id);
        }
      });
      setBookmarkedItems(bookmarked);

      // Persist the search state
      persistSearchState(searchQuery, data.results || [], true);

      if ((data.results || []).length === 0) {
        // Re-set error for the no-results state
        setError(
          "No experiments found. Try different keywords or scientist names.",
        );
        setSearchResults([]); // Ensure results array is empty
      } else {
        setError(null); // Clear error if results are found
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

  // Pagination calculations
  const totalResults = searchResults.length;
  const totalPages = Math.ceil(totalResults / resultsPerPage);
  const startIndex = (currentPage - 1) * resultsPerPage;
  const endIndex = startIndex + resultsPerPage;
  const currentResults = searchResults.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const suggestionKeywords = [
    "microgravity",
    "bone loss",
    "muscle atrophy",
    "plant growth",
    "protein crystallization",
    "cell culture",
    "radiation effects",
  ];

  const handleSuggestionClick = (keyword) => {
    setSearchQuery(keyword);
    // Trigger search automatically after state update
    const fakeEvent = { preventDefault: () => {} };
    // A small timeout ensures the state update (setSearchQuery) is processed
    // before handleSearch reads the new value, though modern React batching
    // might make this optional. It's safer for simulation.
    setTimeout(() => {
      handleSearch(fakeEvent);
    }, 50);
  };

  // Clear search state when starting fresh
  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setHasSearched(false);
    setError(null);
    setCurrentPage(1);
    clearPersistedState();
  };

  // Logic to determine which page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);
      if (currentPage > 4) {
        pageNumbers.push("...");
      }

      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 4) {
        start = 2;
        end = 5;
      }
      if (currentPage >= totalPages - 3) {
        start = totalPages - 4;
        end = totalPages - 1;
      }

      for (let i = start; i <= end; i++) {
        pageNumbers.push(i);
      }

      if (currentPage < totalPages - 3) {
        pageNumbers.push("...");
      }
      pageNumbers.push(totalPages);
    }
    // Filter out duplicate page numbers before rendering
    return pageNumbers.filter(
      (value, index, self) => self.indexOf(value) === index,
    );
  };

  // --- JSX Rendering ---
  return (
    <div className={`search-engine-page ${pageLoaded ? "loaded" : ""}`}>
      <div className="search-engine-wrapper">
        {/* Search Header */}
        <div className="search-header">
          <h1 className="search-title">NASA Bioscience Experiment Search</h1>
          <p className="search-subtitle">
            Discover groundbreaking space biology research and experiments
            conducted in microgravity environments
          </p>
        </div>

        {/* Enhanced Search Form */}
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-container">
            <input
              type="text"
              placeholder="Search experiments by name, scientist, or topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
              disabled={isLoading}
            />
            <button
              type="submit"
              className="search-button"
              disabled={isLoading || !searchQuery.trim()}
            >
              {isLoading ? (
                <>
                  <div className="button-loading-spinner"></div>
                  Searching...
                </>
              ) : (
                <>
                  <span className="search-icon">🔍</span>
                  Search
                </>
              )}
            </button>
            {(searchQuery || hasSearched) && (
              <button
                type="button"
                className="clear-button"
                onClick={handleClearSearch}
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </form>

        {/* Search Results */}
        <div className="search-results">
          {/* Loading State */}
          {isLoading && (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p className="loading-text">
                Searching NASA experiment database...
              </p>
            </div>
          )}

          {/* Error State / No Results State */}
          {error && !isLoading && (
            <div
              className={`error-container ${searchResults.length === 0 ? "no-results" : ""}`}
            >
              <div className="error-icon">
                {searchResults.length === 0 ? "🚀" : "⚠️"}
              </div>
              <h3 className="error-title">
                {searchResults.length === 0
                  ? "No Results Found"
                  : "Search Error"}
              </h3>
              <p className="error-message">{error}</p>

              {/* Only show suggestions if no results were found */}
              {searchResults.length === 0 && (
                <div className="no-results-suggestions">
                  <p>Try one of these popular keywords:</p>
                  {suggestionKeywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="suggestion-chip"
                      onClick={() => handleSuggestionClick(keyword)}
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              )}

              {/* Show retry only if it was a technical error (not just no results) */}
              {error !==
                "No experiments found. Try different keywords or scientist names." && (
                <button
                  className="retry-button"
                  onClick={() => handleSearch({ preventDefault: () => {} })}
                >
                  Try Again
                </button>
              )}
            </div>
          )}

          {/* Results Header with Filters */}
          {!isLoading && !error && hasSearched && searchResults.length > 0 && (
            <>
              <div className="results-header">
                <div className="results-count">
                  Found{" "}
                  <span className="results-count-number">{totalResults}</span>{" "}
                  experiment{totalResults !== 1 ? "s" : ""}
                  {searchQuery && ` for "${searchQuery}"`}
                </div>
                <div className="results-filters">
                  <button
                    className={`filter-button ${activeFilter === "all" ? "active" : ""}`}
                    onClick={() => setActiveFilter("all")}
                  >
                    All Results
                  </button>
                  <button
                    className={`filter-button ${activeFilter === "recent" ? "active" : ""}`}
                    onClick={() => setActiveFilter("recent")}
                  >
                    Most Recent
                  </button>
                  <button
                    className={`filter-button ${activeFilter === "bookmarked" ? "active" : ""}`}
                    onClick={() => setActiveFilter("bookmarked")}
                  >
                    Bookmarked
                  </button>
                </div>
              </div>

              {/* Results Grid */}
              <div className="search-results-grid">
                {currentResults.map((experiment, index) => (
                  <div
                    key={experiment.id}
                    className="search-result-card"
                    onClick={() => handleExperimentClick(experiment.id)}
                  >
                    <div className="card-header">
                      <h3 className="card-title">
                        {highlightMatch(experiment.title, searchQuery)}
                      </h3>
                      <button
                        className={`bookmark-button ${bookmarkedItems.has(experiment.id) ? "bookmarked" : ""}`}
                        onClick={(e) => handleBookmarkToggle(experiment, e)}
                        title={
                          bookmarkedItems.has(experiment.id)
                            ? "Remove from bookmarks"
                            : "Add to bookmarks"
                        }
                      >
                        {bookmarkedItems.has(experiment.id) ? "★" : "☆"}
                      </button>
                    </div>

                    <div className="card-meta">
                      <div className="meta-item">
                        <span className="meta-icon">👨‍🔬</span>
                        <span>{truncateAuthors(experiment.authors)}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-icon">🔬</span>
                        <span>Space Biology</span>
                      </div>
                    </div>

                    <div className="card-description">
                      Explore this NASA bioscience experiment and discover
                      insights about biological processes in microgravity
                      environments.
                    </div>

                    <div className="card-tags">
                      <span className="tag">Space Biology</span>
                      <span className="tag">Microgravity</span>
                      <span className="tag">Research</span>
                    </div>

                    <div className="card-actions">
                      <button
                        className="view-details-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExperimentClick(experiment.id);
                        }}
                      >
                        <span>View Details</span>
                        <span>→</span>
                      </button>

                      <div className="card-score">
                        <span>Relevance</span>
                        <div className="score-bar">
                          <div
                            className="score-fill"
                            style={{ width: `${Math.random() * 40 + 60}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {experiment.link && (
                      <a
                        href={experiment.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="external-link"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span>📄</span>
                        View Publication
                      </a>
                    )}
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="pagination-button"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    ← Previous
                  </button>

                  {getPageNumbers().map((page, index) =>
                    page === "..." ? (
                      <span key={index} className="pagination-info">
                        ...
                      </span>
                    ) : (
                      <button
                        key={index}
                        className={`pagination-button ${currentPage === page ? "active" : ""}`}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </button>
                    ),
                  )}

                  <button
                    className="pagination-button"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchEngine;
