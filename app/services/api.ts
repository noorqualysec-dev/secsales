import axios, { InternalAxiosRequestConfig } from "axios";

// Uses a relative path — Next.js rewrites proxy this to localhost:8002/api
// This means the browser stays on localhost:3000, so CORS never applies!
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL + "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to automatically attach the user's JWT Token to all API requests
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      let tokenValue = null;

      // Smart decision: If the page URL starts with /admin, look for the admin_token first
      if (window.location.pathname.startsWith("/admin")) {
        tokenValue = localStorage.getItem("admin_token");
      }

      // If no admin token or NOT an admin path, use the standard token
      if (!tokenValue) {
        tokenValue = localStorage.getItem("token");
      }

      if (tokenValue && config.headers) {
        config.headers.Authorization = `Bearer ${tokenValue}`;
      }
    }
    return config;
  },
  (error: any) => Promise.reject(error)
);
