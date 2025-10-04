// Bookmarks utility functions for managing bookmarks in localStorage

const BOOKMARKS_KEY = 'nasa_space_bookmarks';

/**
 * Get all bookmarks from localStorage
 * @returns {Array} Array of bookmark objects
 */
export const getBookmarks = () => {
  try {
    const bookmarks = localStorage.getItem(BOOKMARKS_KEY);
    return bookmarks ? JSON.parse(bookmarks) : [];
  } catch (error) {
    console.error('Error getting bookmarks:', error);
    return [];
  }
};

/**
 * Add a bookmark to localStorage
 * @param {Object} experiment - The experiment object to bookmark
 * @returns {boolean} Success status
 */
export const addBookmark = (experiment) => {
  try {
    const bookmarks = getBookmarks();

    // Check if already bookmarked
    const isAlreadyBookmarked = bookmarks.some(bookmark => bookmark.id === experiment.id);
    if (isAlreadyBookmarked) {
      return false; // Already bookmarked
    }

    // Add timestamp and create bookmark object
    const bookmark = {
      ...experiment,
      bookmarkedAt: new Date().toISOString()
    };

    bookmarks.push(bookmark);
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
    return true;
  } catch (error) {
    console.error('Error adding bookmark:', error);
    return false;
  }
};

/**
 * Remove a bookmark from localStorage
 * @param {string|number} experimentId - The ID of the experiment to remove
 * @returns {boolean} Success status
 */
export const removeBookmark = (experimentId) => {
  try {
    const bookmarks = getBookmarks();
    const filteredBookmarks = bookmarks.filter(bookmark => bookmark.id !== experimentId);

    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(filteredBookmarks));
    return true;
  } catch (error) {
    console.error('Error removing bookmark:', error);
    return false;
  }
};

/**
 * Check if an experiment is bookmarked
 * @param {string|number} experimentId - The ID of the experiment to check
 * @returns {boolean} True if bookmarked, false otherwise
 */
export const isBookmarked = (experimentId) => {
  try {
    const bookmarks = getBookmarks();
    return bookmarks.some(bookmark => bookmark.id === experimentId);
  } catch (error) {
    console.error('Error checking bookmark status:', error);
    return false;
  }
};

/**
 * Clear all bookmarks from localStorage
 * @returns {boolean} Success status
 */
export const clearAllBookmarks = () => {
  try {
    localStorage.removeItem(BOOKMARKS_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing bookmarks:', error);
    return false;
  }
};

/**
 * Get bookmark count
 * @returns {number} Number of bookmarks
 */
export const getBookmarkCount = () => {
  return getBookmarks().length;
};

/**
 * Export bookmarks as JSON
 * @returns {string} JSON string of bookmarks
 */
export const exportBookmarks = () => {
  try {
    const bookmarks = getBookmarks();
    return JSON.stringify(bookmarks, null, 2);
  } catch (error) {
    console.error('Error exporting bookmarks:', error);
    return '[]';
  }
};

/**
 * Import bookmarks from JSON string
 * @param {string} jsonString - JSON string of bookmarks to import
 * @returns {boolean} Success status
 */
export const importBookmarks = (jsonString) => {
  try {
    const importedBookmarks = JSON.parse(jsonString);

    if (!Array.isArray(importedBookmarks)) {
      throw new Error('Invalid bookmarks format');
    }

    // Validate bookmark structure
    const validBookmarks = importedBookmarks.filter(bookmark =>
      bookmark.id && bookmark.title && bookmark.authors
    );

    // Merge with existing bookmarks, avoiding duplicates
    const existingBookmarks = getBookmarks();
    const mergedBookmarks = [...existingBookmarks];

    validBookmarks.forEach(bookmark => {
      const exists = mergedBookmarks.some(existing => existing.id === bookmark.id);
      if (!exists) {
        mergedBookmarks.push(bookmark);
      }
    });

    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(mergedBookmarks));
    return true;
  } catch (error) {
    console.error('Error importing bookmarks:', error);
    return false;
  }
};
