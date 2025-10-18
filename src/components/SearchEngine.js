
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
    const timer = setTimeout(() => setPageLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    try {
      const persisted = JSON.parse(localStorage.getItem("searchEngineState") || "null");
      if (persisted) {
        setSearchQuery(persisted.searchQuery || "");
        setSearchResults(persisted.searchResults || []);
        setHasSearched(persisted.hasSearched || false);
        const bookmarked = new Set();
        (persisted.searchResults || []).forEach((r) => {
          if (isBookmarked(r.id)) bookmarked.add(r.id);
        });
        setBookmarkedItems(bookmarked);
      }
    } catch (err) {
      console.warn("could not load persisted state", err);
    }
  }, [location.state]);

  const persistSearchState = (query, results, searched) => {
    try {
      localStorage.setItem(
        "searchEngineState",
        JSON.stringify({ searchQuery: query, searchResults: results, hasSearched: searched, timestamp: Date.now() })
      );
    } catch (err) {
      console.warn("persist failed", err);
    }
  };

  const clearPersistedState = () => {
    try {
      localStorage.removeItem("searchEngineState");
    } catch (err) {
      console.warn("clear persist failed", err);
    }
  };

  // Normalize common response shapes into array of experiments
  const extractResults = (resp) => {
    if (!resp) return [];
    const data = resp.data ?? resp;
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.results)) return data.results;
    if (Array.isArray(data.experiments)) return data.experiments;
    if (Array.isArray(data.rows)) return data.rows;
    // sometimes API returns { data: { rows: [...] } }
    if (data.data && Array.isArray(data.data.rows)) return data.data.rows;
    return [];
  };

  // final fallback: fetch all experiments then filter on client
  const clientSideFilter = (all, query) => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return all.filter((exp) => {
      const title = (exp.title || "").toLowerCase();
      const authors = (exp.authors || "").toLowerCase();
      return title.includes(q) || authors.includes(q);
    });
  };

  // Performs multi-strategy search against backend and fallback
  const performSearch = async (query, headers, backendUrl) => {
    // 1) try GET /api/query?query=...
    try {
      const getResp = await axios.get(`${backendUrl}/api/query`, {
        params: { query },
        headers,
        timeout: 10000,
      });
      const results = extractResults(getResp);
      if (results.length > 0) return results;
    } catch (err) {
      // ignore and continue to next strategy
      console.debug("GET /api/query failed or returned no results", err?.message || err);
    }

    // 2) try POST /api/experiments/search { query }
    try {
      const postResp = await axios.post(
        `${backendUrl}/api/experiments/search`,
        { query },
        { headers, timeout: 10000 }
      );
      const results = extractResults(postResp);
      if (results.length > 0) return results;
    } catch (err) {
      console.debug("POST /api/experiments/search failed or returned no results", err?.message || err);
    }

    // 3) try GET /api/experiments (all) then filter locally
    try {
      const allResp = await axios.get(`${backendUrl}/api/experiments`, {
        headers,
        timeout: 15000,
      });
      const all = extractResults(allResp);
      if (all.length === 0) return [];
      return clientSideFilter(all, query);
    } catch (err) {
      console.debug("GET /api/experiments failed", err?.message || err);
    }

    return [];
  };

  const handleSearch = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    const q = searchQuery || "";
    if (!q.trim()) {
      setError("Please enter a search term");
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasSearched(true);
    setCurrentPage(1);

    try {
      const backendUrl =
        process.env.REACT_APP_API_URL ||
        "https://biospace-archive-backend.onrender.com";

      const sessionResp = await supabase.auth.getSession().catch(() => ({}));
      const session = sessionResp?.data?.session;
      const headers = { "Content-Type": "application/json" };
      if (session?.access_token) headers.Authorization = `Bearer ${session.access_token}`;

      const results = await performSearch(q.trim(), headers, backendUrl);

      if (!results || results.length === 0) {
        setSearchResults([]);
        setError("No experiments found. Try different keywords or scientist names.");
      } else {
        setSearchResults(results);
        setError(null);
        persistSearchState(q, results, true);
        const bookmarked = new Set();
        results.forEach((r) => {
          if (isBookmarked(r.id)) bookmarked.add(r.id);
        });
        setBookmarkedItems(bookmarked);
      }
    } catch (err) {
      console.error("Search error:", err);
      const message =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to search experiments";
      setError(message);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExperimentClick = (experimentId) => {
    navigate(`/experiment/${experimentId}`, {
      state: { fromSearch: true, searchQuery, searchResults },
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
    if (!query || !text) return text;
    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return parts.map((part, idx) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={idx} className="highlight">
          {part}
        </mark>
      ) : (
        part
      )
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
    setTimeout(() => handleSearch({ preventDefault: () => {} }), 50);
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
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }
    pages.push(1);
    if (currentPage > 4) pages.push("...");
    let start = Math.max(2, currentPage - 1);
    let end = Math.min(totalPages - 1, currentPage + 1);
    if (currentPage <= 4) { start = 2; end = 5; }
    if (currentPage >= totalPages - 3) { start = totalPages - 4; end = totalPages - 1; }
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < totalPages - 3) pages.push("...");
    pages.push(totalPages);
    return pages.filter((v,i,self) => self.indexOf(v) === i);
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
                  <div className="button-loading-spinner" />
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
              <div className="loading-spinner" />
              <p className="loading-text">Searching NASA experiment database...</p>
            </div>
          )}

          {error && !isLoading && (
            <div className={`error-container ${searchResults.length === 0 ? "no-results" : ""}`}>
              <div className="error-icon">{searchResults.length === 0 ? "🚀" : "⚠️"}</div>
              <h3 className="error-title">{searchResults.length === 0 ? "No Results Found" : "Search Error"}</h3>
              <p className="error-message">{error}</p>

              {searchResults.length === 0 && (
                <div className="no-results-suggestions">
                  <p>Try one of these popular keywords:</p>
                  {suggestionKeywords.map((keyword) => (
                    <span key={keyword} className="suggestion-chip" onClick={() => handleSuggestionClick(keyword)}>
                      {keyword}
                    </span>
                  ))}
                </div>
              )}

              {error !== "No experiments found. Try different keywords or scientist names." && (
                <button className="retry-button" onClick={() => handleSearch({ preventDefault: () => {} })}>Try Again</button>
              )}
            </div>
          )}

          {!isLoading && !error && hasSearched && searchResults.length > 0 && (
            <>
              <div className="results-header">
                <div className="results-count">
                  Found <span className="results-count-number">{totalResults}</span> experiment{totalResults !== 1 ? "s" : ""}
                  {searchQuery && ` for "${searchQuery}"`}
                </div>
                <div className="results-filters">
                  <button className={`filter-button ${activeFilter === "all" ? "active" : ""}`} onClick={() => setActiveFilter("all")}>All Results</button>
                  <button className={`filter-button ${activeFilter === "recent" ? "active" : ""}`} onClick={() => setActiveFilter("recent")}>Most Recent</button>
                  <button className={`filter-button ${activeFilter === "bookmarked" ? "active" : ""}`} onClick={() => setActiveFilter("bookmarked")}>Bookmarked</button>
                </div>
              </div>

              <div className="search-results-grid">
                {currentResults.map((experiment) => (
                  <div key={experiment.id} className="search-result-card" onClick={() => handleExperimentClick(experiment.id)}>
                    <div className="card-header">
                      <h3 className="card-title">{highlightMatch(experiment.title || "Untitled", searchQuery)}</h3>
                      <button
                        className={`bookmark-button ${bookmarkedItems.has(experiment.id) ? "bookmarked" : ""}`}
                        onClick={(e) => handleBookmarkToggle(experiment, e)}
                        title={bookmarkedItems.has(experiment.id) ? "Remove from bookmarks" : "Add to bookmarks"}
                      >
                        {bookmarkedItems.has(experiment.id) ? "★" : "☆"}
                      </button>
                    </div>

                    <div className="card-meta">
                      <div className="meta-item">
                        <span className="meta-icon">👨‍🔬</span>
                        <span>{truncateAuthors(experiment.authors || "Unknown")}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-icon">🔬</span>
                        <span>Space Biology</span>
                      </div>
                    </div>

                    <div className="card-description">
                      Explore this NASA bioscience experiment and discover insights about biological processes in microgravity environments.
                    </div>

                    <div className="card-tags">
                      <span className="tag">Space Biology</span>
                      <span className="tag">Microgravity</span>
                      <span className="tag">Research</span>
                    </div>

                    <div className="card-actions">
                      <button className="view-details-button" onClick={(e) => { e.stopPropagation(); handleExperimentClick(experiment.id); }}>
                        <span>View Details</span><span>→</span>
                      </button>

                      <div className="card-score">
                        <span>Relevance</span>
                        <div className="score-bar">
                          <div className="score-fill" style={{ width: `${Math.random() * 40 + 60}%` }} />
                        </div>
                      </div>
                    </div>

                    {experiment.link && (
                      <a href={experiment.link} target="_blank" rel="noopener noreferrer" className="external-link" onClick={(e) => e.stopPropagation()}>
                        <span>📄</span> View Publication
                      </a>
                    )}
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="pagination">
                  <button className="pagination-button" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>← Previous</button>
                  {getPageNumbers().map((page, index) =>
                    page === "..." ? (
                      <span key={index} className="pagination-info">...</span>
                    ) : (
                      <button key={index} className={`pagination-button ${currentPage === page ? "active" : ""}`} onClick={() => handlePageChange(page)}>
                        {page}
                      </button>
                    )
                  )}
                  <button className="pagination-button" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>Next →</button>
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


