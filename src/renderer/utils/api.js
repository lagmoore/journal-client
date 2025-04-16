// src/renderer/utils/api.js
import axios from "axios";
import toast from "react-hot-toast";
import { isTokenExpired } from "./tokenUtils";
import i18next from "i18next";

// API base URL from environment or default
const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    // Get stored access token from sessionStorage (only for current session)
    // This is temporary storage; the actual token will be retrieved from keytar when needed
    const accessToken = sessionStorage.getItem("accessToken");

    if (accessToken && !isTokenExpired(accessToken)) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Check for specific error responses
    if (error.response) {
      const { status, data } = error.response;

      // Handle different status codes
      switch (status) {
        case 401: // Unauthorized
          // This will be handled by the AuthContext
          break;

        case 403: // Forbidden
          toast.error(i18next.t("api.errors.forbidden"));
          break;

        case 404: // Not Found
          toast.error(i18next.t("api.errors.notFound"));
          break;

        case 422: // Validation Error
          if (data.errors) {
            // Format validation errors
            const errorMessages = Object.values(data.errors).flat();
            errorMessages.forEach((message) => toast.error(message));
          } else {
            toast.error(data.message || i18next.t("api.errors.validation"));
          }
          break;

        case 429: // Too Many Requests
          toast.error(i18next.t("api.errors.tooManyRequests"));
          break;

        case 500: // Server Error
        case 502: // Bad Gateway
        case 503: // Service Unavailable
        case 504: // Gateway Timeout
          toast.error(i18next.t("api.errors.serverError"));
          break;

        default:
          toast.error(data.message || i18next.t("api.errors.unknown"));
          break;
      }
    } else if (error.request) {
      // Network error
      toast.error(i18next.t("api.errors.network"));
    } else {
      // Other errors
      toast.error(i18next.t("api.errors.unknown"));
    }

    return Promise.reject(error);
  }
);

export default api;

// Export request methods with error handling
export const apiRequest = {
  get: async (url, config = {}) => {
    try {
      return await api.get(url, config);
    } catch (error) {
      console.error(`GET ${url} error:`, error);
      throw error;
    }
  },

  post: async (url, data = {}, config = {}) => {
    try {
      return await api.post(url, data, config);
    } catch (error) {
      console.error(`POST ${url} error:`, error);
      throw error;
    }
  },

  put: async (url, data = {}, config = {}) => {
    try {
      return await api.put(url, data, config);
    } catch (error) {
      console.error(`PUT ${url} error:`, error);
      throw error;
    }
  },

  patch: async (url, data = {}, config = {}) => {
    try {
      return await api.patch(url, data, config);
    } catch (error) {
      console.error(`PATCH ${url} error:`, error);
      throw error;
    }
  },

  delete: async (url, config = {}) => {
    try {
      return await api.delete(url, config);
    } catch (error) {
      console.error(`DELETE ${url} error:`, error);
      throw error;
    }
  },
};
