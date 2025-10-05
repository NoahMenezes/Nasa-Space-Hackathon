import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

// Initialize Supabase Admin Client with service_role key
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase environment variables!");
  console.error(
    "Please ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in backend/.env",
  );
}

// Create Supabase admin client
const supabaseAdmin = createClient(
  supabaseUrl || "",
  supabaseServiceKey || "",
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

/**
 * Authentication Middleware - Verifies Supabase JWT tokens
 *
 * This middleware extracts the JWT from the Authorization header,
 * verifies it using Supabase's getUser() method with the service role key,
 * and attaches the user object to the request if valid.
 *
 * Usage:
 *   import { authenticateUser } from './middleware/auth.js';
 *   router.get('/protected', authenticateUser, (req, res) => {
 *     // Access user via req.user
 *   });
 */
export const authenticateUser = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Unauthorized",
        message:
          "No authentication token provided. Please include a Bearer token in the Authorization header.",
      });
    }

    // Extract the token (remove "Bearer " prefix)
    const token = authHeader.substring(7);

    if (!token) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Invalid token format.",
      });
    }

    // Verify the token using Supabase Admin client
    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(token);

    if (error) {
      console.error("Token verification error:", error.message);
      return res.status(401).json({
        error: "Unauthorized",
        message: "Invalid or expired token.",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }

    if (!user) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "User not found or token is invalid.",
      });
    }

    // Attach user information to request object
    req.user = {
      id: user.id,
      email: user.email,
      userId: user.id, // For backward compatibility with existing code
      user_metadata: user.user_metadata,
      app_metadata: user.app_metadata,
      created_at: user.created_at,
    };

    // Log successful authentication in development
    if (process.env.NODE_ENV === "development") {
      console.log(`✅ Authenticated user: ${user.email}`);
    }

    // Proceed to next middleware/route handler
    next();
  } catch (error) {
    console.error("Authentication middleware error:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: "An error occurred during authentication.",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Optional Authentication Middleware
 *
 * Similar to authenticateUser, but doesn't reject the request if no token is provided.
 * Useful for endpoints that have different behavior for authenticated vs unauthenticated users.
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // If no auth header, continue without user
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      req.user = null;
      return next();
    }

    const token = authHeader.substring(7);

    if (!token) {
      req.user = null;
      return next();
    }

    // Try to verify the token
    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      // Token is invalid, but we allow the request to continue
      req.user = null;
      return next();
    }

    // Attach user information to request object
    req.user = {
      id: user.id,
      email: user.email,
      userId: user.id,
      user_metadata: user.user_metadata,
      app_metadata: user.app_metadata,
      created_at: user.created_at,
    };

    next();
  } catch (error) {
    console.error("Optional auth middleware error:", error);
    // Don't fail the request, just continue without user
    req.user = null;
    next();
  }
};

/**
 * Admin-only middleware
 *
 * Requires authentication and checks if user has admin role.
 * Use this after authenticateUser middleware.
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Authentication required.",
    });
  }

  // Check if user has admin role in app_metadata
  const isAdmin =
    req.user.app_metadata?.role === "admin" ||
    req.user.app_metadata?.is_admin === true;

  if (!isAdmin) {
    return res.status(403).json({
      error: "Forbidden",
      message: "Admin access required.",
    });
  }

  next();
};

// Export the Supabase admin client for use in other parts of the application
export { supabaseAdmin };

// Legacy export for backward compatibility
export const authenticateToken = authenticateUser;
