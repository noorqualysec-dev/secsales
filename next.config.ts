import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        // Any request to /api/:path* from the frontend
        // gets transparently proxied to the backend — no CORS!
        source: "/api/:path*",
        destination: "http://localhost:8002/api/:path*",
      },
    ];
  },
};

export default nextConfig;
