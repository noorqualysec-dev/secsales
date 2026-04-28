import axios, { InternalAxiosRequestConfig } from "axios";

// Uses a relative path — Next.js rewrites proxy this to localhost:8002/api
// This means the browser stays on localhost:3000, so CORS never applies!
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL + "/api",
});

// Interceptor to automatically attach the user's JWT Token to all API requests
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Let the browser set multipart boundary automatically for FormData uploads.
    if (typeof FormData !== "undefined" && config.data instanceof FormData && config.headers) {
      if (typeof (config.headers as any).set === "function") {
        (config.headers as any).set("Content-Type", undefined);
      } else {
        delete (config.headers as Record<string, any>)["Content-Type"];
      }
    }

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
