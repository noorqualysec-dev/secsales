import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        // Any request to /api/:path* from the frontend
        // gets transparently proxied to the backend — no CORS!
        source: "/api/:path*",
        destination: "https://secsales-backend-6rd9f2le1-noorqualysec-1339s-projects.vercel.app/api/:path*",
      },
    ];
  },
};

export default nextConfig;
