import axios, { InternalAxiosRequestConfig } from "axios";

// Uses a relative path — Next.js rewrites proxy this to localhost:8002/api
// This means the browser stays on localhost:3000, so CORS never applies!
export const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to automatically attach the user's JWT Token to all API requests
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Because Next.js runs on server and client, ensure we are in the browser
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: any) => Promise.reject(error)
);
