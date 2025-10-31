import axios from "axios";
import env from "../utils/env.js";
import authService from "./authService.js";

const API_URL = env.api.url;

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: env.api.timeout,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
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
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      }
    }

    return Promise.reject(error);
  }
);

// Speakers API
export const speakersAPI = {
  getAll: () => apiClient.get("/speakers"),
  getById: (id) => apiClient.get(`/speakers/${id}`),
  create: (data) => apiClient.post("/speakers", data),
  update: (id, data) => apiClient.put(`/speakers/${id}`, data),
  partialUpdate: (id, data) => apiClient.patch(`/speakers/${id}`, data),
  delete: (id) => apiClient.delete(`/speakers/${id}`),
};

// Venues API
export const venuesAPI = {
  getAll: () => apiClient.get("/venues"),
  getById: (id) => apiClient.get(`/venues/${id}`),
  create: (data) => apiClient.post("/venues", data),
  update: (id, data) => apiClient.put(`/venues/${id}`, data),
  partialUpdate: (id, data) => apiClient.patch(`/venues/${id}`, data),
  delete: (id) => apiClient.delete(`/venues/${id}`),
  getCityChoices: () => apiClient.get("/venues/city-choices"),
};

// Events API
export const eventsAPI = {
  getAll: () => apiClient.get("/events/"),
  getById: (id) => apiClient.get(`/events/${id}/`),
  create: (data) => apiClient.post("/events/", data),
  update: (id, data) => apiClient.put(`/events/${id}/`, data),
  partialUpdate: (id, data) => apiClient.patch(`/events/${id}/`, data),
  delete: (id) => apiClient.delete(`/events/${id}/`),
};

// Sessions API
export const sessionsAPI = {
  getAll: (eventId) => apiClient.get(`/events/${eventId}/sessions/`),
  getById: (eventId, sessionId) =>
    apiClient.get(`/events/${eventId}/sessions/${sessionId}/`),
  create: (eventId, data) =>
    apiClient.post(`/events/${eventId}/sessions/`, data),
  update: (eventId, sessionId, data) =>
    apiClient.put(`/events/${eventId}/sessions/${sessionId}/`, data),
  partialUpdate: (eventId, sessionId, data) =>
    apiClient.patch(`/events/${eventId}/sessions/${sessionId}/`, data),
  delete: (eventId, sessionId) =>
    apiClient.delete(`/events/${eventId}/sessions/${sessionId}/`),
};

// Tracks API
export const tracksAPI = {
  getAll: (eventId) => apiClient.get(`/events/${eventId}/tracks/`),
  getById: (eventId, trackId) =>
    apiClient.get(`/events/${eventId}/tracks/${trackId}/`),
  create: (eventId, data) => apiClient.post(`/events/${eventId}/tracks/`, data),
  update: (eventId, trackId, data) =>
    apiClient.put(`/events/${eventId}/tracks/${trackId}/`, data),
  partialUpdate: (eventId, trackId, data) =>
    apiClient.patch(`/events/${eventId}/tracks/${trackId}/`, data),
  delete: (eventId, trackId) =>
    apiClient.delete(`/events/${eventId}/tracks/${trackId}/`),
};

// Registrations API
export const registrationsAPI = {
  getAll: (eventId) => apiClient.get(`/events/${eventId}/registrations/`),
  getById: (eventId, registrationId) =>
    apiClient.get(`/events/${eventId}/registrations/${registrationId}/`),
  create: (eventId, data) =>
    apiClient.post(`/events/${eventId}/registrations/`, data),
  update: (eventId, registrationId, data) =>
    apiClient.put(`/events/${eventId}/registrations/${registrationId}/`, data),
  partialUpdate: (eventId, registrationId, data) =>
    apiClient.patch(
      `/events/${eventId}/registrations/${registrationId}/`,
      data
    ),
  delete: (eventId, registrationId) =>
    apiClient.delete(`/events/${eventId}/registrations/${registrationId}/`),
};

export default apiClient;
