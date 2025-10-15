import axios from "axios";
import { supabase } from "../lib/supabase";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "https://biospace-archive-backend.onrender.com";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Add Supabase auth token to requests automatically
api.interceptors.request.use(
  async (config) => {
    try {
      // Get the current session from Supabase
      const {
        data: { session },
      } = await supabase.auth.getSession();

      // If we have a session, add the access token to the Authorization header
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
      }
    } catch (error) {
      console.error("Error fetching session token:", error);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Handle token expiration and errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token is invalid or expired
      console.log("Authentication error, signing out...");

      // Sign out the user
      await supabase.auth.signOut();

      // Clear any legacy local storage items
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");

      // Only redirect if not already on login page
      if (window.location.pathname !== "/login") {
        window.location.href = "/#/login";
      }
    }
    return Promise.reject(error);
  },
);

// Helper function to check if user is authenticated
export const isAuthenticated = async () => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return !!session;
  } catch (error) {
    console.error("Error checking authentication:", error);
    return false;
  }
};

// Helper function to get current user
export const getCurrentUser = async () => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

// Helper function to get current session
export const getCurrentSession = async () => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session;
  } catch (error) {
    console.error("Error getting current session:", error);
    return null;
  }
};

// Legacy functions (kept for backward compatibility, but they now use Supabase)
export const setAuthToken = (token) => {
  console.warn(
    "setAuthToken is deprecated. Token management is now handled by Supabase automatically.",
  );
};

export const removeAuthToken = async () => {
  await supabase.auth.signOut();
  localStorage.removeItem("authToken");
  localStorage.removeItem("user");
};

// Note: Old authAPI endpoints are removed as Supabase handles authentication directly
// All auth operations should now use the useAuth hook from AuthContext

export default api;
