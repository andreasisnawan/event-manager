/**
 * Environment Configuration Utility
 * Centralizes all environment variable access with validation and defaults
 */

/**
 * Get environment variable value with optional default
 * @param {string} key - Environment variable key
 * @param {string} defaultValue - Default value if not set
 * @returns {string} Environment variable value
 */
const getEnv = (key, defaultValue = "") => {
  return import.meta.env[key] || defaultValue;
};

/**
 * Check if running in production mode
 * @returns {boolean}
 */
const isProduction = () => {
  return import.meta.env.MODE === "production";
};

/**
 * Check if running in development mode
 * @returns {boolean}
 */
const isDevelopment = () => {
  return import.meta.env.MODE === "development";
};

/**
 * Check if running in test mode
 * @returns {boolean}
 */
const isTest = () => {
  return import.meta.env.MODE === "test";
};

/**
 * Environment configuration object
 */
const env = {
  // Application mode
  mode: import.meta.env.MODE,
  isDev: isDevelopment(),
  isProd: isProduction(),
  isTest: isTest(),

  // API Configuration
  api: {
    url: getEnv("VITE_API_URL", "http://localhost:8000/api"),
    timeout: parseInt(getEnv("VITE_API_TIMEOUT", "30000"), 10),
  },

  // Authentication Configuration
  auth: {
    cookieExpireDays: parseInt(getEnv("VITE_AUTH_COOKIE_EXPIRE_DAYS", "7"), 10),
    tokenRefreshBuffer: parseInt(
      getEnv("VITE_AUTH_TOKEN_REFRESH_BUFFER", "300"),
      10
    ), // seconds
  },

  // Feature Flags
  features: {
    enableAnalytics: getEnv("VITE_ENABLE_ANALYTICS", "false") === "true",
    enableDebugMode: getEnv("VITE_ENABLE_DEBUG", "false") === "true",
  },

  // App Configuration
  app: {
    name: getEnv("VITE_APP_NAME", "Event Manager"),
    version: getEnv("VITE_APP_VERSION", "1.0.0"),
  },
};

// Validate critical environment variables in production
if (isProduction()) {
  const requiredVars = ["VITE_API_URL"];
  const missingVars = requiredVars.filter((key) => !import.meta.env[key]);

  if (missingVars.length > 0) {
    console.error("Missing required environment variables:", missingVars);
    // You might want to show a user-friendly error page here
  }
}

// Log environment info in development
if (isDevelopment()) {
  console.log("Environment Configuration:", {
    mode: env.mode,
    apiUrl: env.api.url,
  });
}

export default env;
