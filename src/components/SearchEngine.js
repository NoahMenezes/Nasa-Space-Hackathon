import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase.js";
import axios from "axios";
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
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState("all");
  const [pageLoaded, setPageLoaded] = useState(false);
  const resultsPerPage = 6;

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

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

    if (location.state && location.state.preserveResults) {
      setSearchQuery(location.state.searchQuery || "");
      setSearchResults(location.state.searchResults || []);
      setHasSearched(true);

      const bookmarked = new Set();
      (location.state.searchResults || []).forEach((result) => {
        if (isBookmarked(result.id)) {
          bookmarked.add(result.id);
        }
      });
      setBookmarkedItems(bookmarked);
    } else {
      loadPersistedState();
    }
  }, [location.state]);

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
      // Use environment variable in production, fallback to hardcoded for dev
      const backendUrl =
        process.env.REACT_APP_API_URL ||
        "https://biospace-archive-backend.onrender.com";

      // Get session safely; if not logged in, proceed without auth header
      const sessionResp = await supabase.auth.getSession();
      const session = sessionResp?.data?.session;
      const sessionError = sessionResp?.error;
      if (sessionError) {
        console.warn("Supabase session error:", sessionError);
      }

      const headers = {
        "Content-Type": "application/json",
      };
      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }

      // axios GET with query param
      const response = await axios.get(`${backendUrl}/api/query`, {
        params: { query: searchQuery },
        headers,
      });

      // axios uses HTTP status; check status range instead of response.ok
      if (response.status < 200 || response.status >= 300) {
        const serverMessage =
          response.data?.error || response.data?.message || "Failed to search experiments";
        throw new Error(serverMessage);
      }

      const data = response.data || {};
      const results = data.results || [];

      setSearchResults(results);

      const bookmarked = new Set();
      results.forEach((result) => {
        if (isBookmarked(result.id)) {
          bookmarked.add(result.id);
        }
      });
      setBookmarkedItems(bookmarked);

      persistSearchState(searchQuery, results, true);

      if (results.length === 0) {
        setError("No experiments found. Try different keywords or scientist names.");
        setSearchResults([]);
      } else {
        setError(null);
      }
    } catch (err) {
      // axios errors may be nested (err.response)
      console.error("Search error:", err);
      const message =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to search. Please try again.";
      setError(message);
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
    e.stopPropagation();

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
    if (!authors) return "";
    if (authors.length <= maxLength) return authors;
    return authors.substring(0, maxLength) + "...";
  };

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
    const fakeEvent = { preventDefault: () => {} };
    setTimeout(() => {
      handleSearch(fakeEvent);
    }, 50);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setHasSearched(false);
    setError(null);
    setCurrentPage(1);
    clearPersistedState();
  };

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
    return pageNumbers.filter(
      (value, index, self) => self.indexOf(value) === index,
    );
  };

  return (
    <div className={`search-engine-page ${pageLoaded ? "loaded" : ""}`}>
      <div className="search-engine-wrapper">
        <div className="search-header">
          <h1 className="search-title">NASA Bioscience Experiment Search</h1>
          <p className="search-subtitle">
            Discover groundbreaking space biology research and experiments
            conducted in microgravity environments
          </p>
        </div>

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

        <div className="search-results">
          {isLoading && (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p className="loading-text">
                Searching NASA experiment database...
              </p>
            </div>
          )}

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

