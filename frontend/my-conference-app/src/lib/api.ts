import axios, { AxiosInstance, AxiosError } from "axios";
import { ApiError } from "./types";

// API Configuration
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://192.168.1.32:8080";

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Request interceptor to add JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    console.log(
      "API Request:",
      config.url,
      "Token:",
      token ? "exists" : "missing"
    );
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - clear all auth data and redirect
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      sessionStorage.clear();

      // Force reload to clear any cached state
      window.location.replace("/login");
    }

    const apiError: ApiError = {
      message:
        (error.response?.data as { message?: string })?.message ||
        error.message ||
        "An error occurred",
      status: error.response?.status || 500,
      timestamp: new Date().toISOString(),
    };

    return Promise.reject(apiError);
  }
);

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: "/auth/signin",
  REGISTER_USER: "/auth/api/users/register",
  REGISTER_ADMIN: "/auth/register",

  // Events
  EVENTS: "/event",
  CREATE_EVENT: "/event/create",
  SHOW_EVENTS: "/event/showevents",
  GET_EVENT: (id: number) => `/event/getevent/${id}`,
  UPDATE_EVENT: (id: number) => `/event/updateevent/${id}`,
  DELETE_EVENT: (id: number) => `/event/deleteevent/${id}`,
  CHECKOUT_ALL: (eventId: number) => `/event/${eventId}/checkoutall`,
  EXPORT_ATTENDEES: (eventId: number) => `/event/${eventId}/export/attendees`,
  GET_EVENT_ATTENDEES: (eventId: number) => `/event/${eventId}/attendees`,

  // Admin Dashboard
  DASHBOARD_STATS: "/admin/dashboard/stats",

  // Attendee
  ATTENDEE_EVENTS: "/attendee/events",
  REGISTER_FOR_EVENT: (eventId: number) =>
    `/attendee/events/${eventId}/register`,
  GET_USER_REGISTRATIONS: "/attendee/registrations",
  GET_QR: (registrationId: number) =>
    `/attendee/registrations/${registrationId}/qr`,
  ATTENDEE_DASHBOARD_STATS: "/attendee/dashboard/stats",

  // Scanner
  SCAN: "/scan",
} as const;

// Utility function to handle API errors
export function handleApiError(error: unknown): string {
  if (error && typeof error === "object" && "message" in error) {
    return (error as ApiError).message;
  }
  return "An unexpected error occurred";
}

// Token management utilities
export const tokenUtils = {
  getToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  },

  setToken: (token: string): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem("token", token);
  },

  removeToken: (): void => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  isTokenValid: (): boolean => {
    const token = tokenUtils.getToken();
    if (!token) return false;

    try {
      // Quick JWT validation - check if it's expired
      const payload = JSON.parse(atob(token.split(".")[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch {
      return false;
    }
  },
};
