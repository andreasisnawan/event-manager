import axios from "axios";
import Cookies from "js-cookie";
import env from "../utils/env.js";

const API_URL = env.api.url;

// Cookie configuration for better security
const cookieOptions = {
  expires: env.auth.cookieExpireDays,
  secure: env.isProd, // Use secure cookies in production
  sameSite: "strict",
  path: "/",
};

// Cookie names
const COOKIE_NAMES = {
  TOKEN: "auth_token",
  REFRESH_TOKEN: "refresh_token",
  USER: "user_info",
};

const authService = {
  login: async (username, password) => {
    const response = await axios.post(`${API_URL}/auth/login`, {
      username,
      password,
    });
    if (response.data.access) {
      // Store tokens and user info in cookies
      Cookies.set(COOKIE_NAMES.TOKEN, response.data.access, cookieOptions);
      Cookies.set(
        COOKIE_NAMES.REFRESH_TOKEN,
        response.data.refresh,
        cookieOptions
      );
      Cookies.set(
        COOKIE_NAMES.USER,
        JSON.stringify(response.data.user),
        cookieOptions
      );

      // Set default Authorization header for future requests
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${response.data.access}`;
    }
    return response.data;
  },

  logout: () => {
    // Remove all auth cookies
    Cookies.remove(COOKIE_NAMES.TOKEN, { path: "/" });
    Cookies.remove(COOKIE_NAMES.REFRESH_TOKEN, { path: "/" });
    Cookies.remove(COOKIE_NAMES.USER, { path: "/" });

    // Remove Authorization header
    delete axios.defaults.headers.common["Authorization"];
  },

  register: async (userData) => {
    const response = await axios.post(`${API_URL}/auth/register`, userData);
    return response.data;
  },

  refreshToken: async () => {
    const refreshToken = Cookies.get(COOKIE_NAMES.REFRESH_TOKEN);
    if (!refreshToken) return null;

    try {
      const response = await axios.post(`${API_URL}/auth/token/refresh`, {
        refresh: refreshToken,
      });

      // Update the access token in cookies
      Cookies.set(COOKIE_NAMES.TOKEN, response.data.access, cookieOptions);

      // Update Authorization header
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${response.data.access}`;

      return response.data.access;
    } catch (error) {
      authService.logout();
      return null;
    }
  },

  // Helper methods to get current auth state
  getCurrentUser: () => {
    const userStr = Cookies.get(COOKIE_NAMES.USER);
    return userStr ? JSON.parse(userStr) : null;
  },

  getToken: () => {
    return Cookies.get(COOKIE_NAMES.TOKEN);
  },

  isAuthenticated: () => {
    return !!Cookies.get(COOKIE_NAMES.TOKEN);
  },
};

// Set up axios interceptor for automatic token refresh
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 and we haven't already tried to refresh the token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Try to refresh the token
      const newToken = await authService.refreshToken();
      if (newToken) {
        // Retry the original request with the new token
        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
        return axios(originalRequest);
      }
    }

    return Promise.reject(error);
  }
);

export default authService;
