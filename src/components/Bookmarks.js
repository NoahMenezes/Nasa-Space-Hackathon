import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Bookmarks.css";
import {
  getBookmarks,
  removeBookmark,
  clearAllBookmarks,
} from "../utils/bookmarksUtils";

const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);
  const navigate = useNavigate();

  // Page loading effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Load bookmarks on component mount
  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = () => {
    try {
      setLoading(true);
      const savedBookmarks = getBookmarks();
      setBookmarks(savedBookmarks);
    } catch (error) {
      console.error("Error loading bookmarks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBookmark = (experimentId) => {
    if (removeBookmark(experimentId)) {
      setBookmarks((prev) =>
        prev.filter((bookmark) => bookmark.id !== experimentId),
      );
    }
  };

  const handleClearAllBookmarks = () => {
    if (clearAllBookmarks()) {
      setBookmarks([]);
      setShowConfirmDialog(false);
    }
  };

  const handleExperimentClick = (experimentId) => {
    navigate(`/experiment/${experimentId}`);
  };

  const truncateAuthors = (authors, maxLength = 100) => {
    if (authors.length <= maxLength) return authors;
    return authors.substring(0, maxLength) + "...";
  };

  const formatBookmarkedDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Unknown date";
    }
  };

  if (loading) {
    return (
      <div className={`bookmarks-page ${pageLoaded ? "loaded" : ""}`}>
        <div className="bookmarks-wrapper">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading your bookmarks...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bookmarks-page ${pageLoaded ? "loaded" : ""}`}>
      <div className="bookmarks-wrapper">
        <div className="bookmarks-header">
          <div className="header-content">
            <h1 className="animated-title">My Bookmarks</h1>
            <p className="bookmarks-subtitle">
              {bookmarks.length > 0
                ? `You have ${bookmarks.length} bookmarked experiment${bookmarks.length !== 1 ? "s" : ""}`
                : "No bookmarks yet - start exploring and save your favorites!"}
            </p>

            {bookmarks.length > 0 && (
              <div className="bookmarks-actions">
                <button
                  onClick={() => setShowConfirmDialog(true)}
                  className="delete-all-btn"
                  aria-label="Delete all bookmarks"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                  <span className="delete-all-text">Clear All Bookmarks</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="bookmarks-grid">
          {bookmarks.length > 0 ? (
            bookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                className="bookmark-card"
                onClick={() => handleExperimentClick(bookmark.id)}
              >
                <div className="bookmark-header">
                  <h3 className="bookmark-title">{bookmark.title}</h3>
                  <button
                    className="remove-bookmark-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveBookmark(bookmark.id);
                    }}
                    title="Remove bookmark"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>

                <div className="bookmark-body">
                  <div className="bookmark-authors">
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
                    <span>{truncateAuthors(bookmark.authors)}</span>
                  </div>

                  {bookmark.link && (
                    <a
                      href={bookmark.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bookmark-link"
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
                  )}
                </div>

                <div className="bookmark-footer">
                  <div className="bookmark-meta">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"></path>
                    </svg>
                    <span>
                      Bookmarked {formatBookmarkedDate(bookmark.bookmarkedAt)}
                    </span>
                  </div>

                  <button
                    className="analyze-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExperimentClick(bookmark.id);
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
            ))
          ) : (
            <div className="no-bookmarks">
              <div className="no-bookmarks-icon">
                <svg
                  width="80"
                  height="80"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"></path>
                </svg>
              </div>
              <h3>No Bookmarks Yet</h3>
              <p>
                Start exploring NASA bioscience experiments and save your
                favorites here! Use the search engine to discover experiments by
                name or scientist.
              </p>
              <button
                className="explore-btn"
                onClick={() => navigate("/search")}
              >
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
                Explore Experiments
              </button>
            </div>
          )}
        </div>

        {/* Confirmation Dialog */}
        {showConfirmDialog && (
          <div className="modal-overlay">
            <div className="confirmation-dialog">
              <div className="dialog-header">
                <h3>Clear All Bookmarks</h3>
                <button
                  className="dialog-close"
                  onClick={() => setShowConfirmDialog(false)}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
              <div className="dialog-body">
                <p>
                  Are you sure you want to remove all {bookmarks.length}{" "}
                  bookmarked experiments? This action cannot be undone.
                </p>
              </div>
              <div className="dialog-actions">
                <button
                  className="dialog-btn cancel"
                  onClick={() => setShowConfirmDialog(false)}
                >
                  Cancel
                </button>
                <button
                  className="dialog-btn confirm"
                  onClick={handleClearAllBookmarks}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                  Clear All
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookmarks;
