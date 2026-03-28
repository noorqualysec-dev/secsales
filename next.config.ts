import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Any request to /api/:path* from the frontend
        // gets transparently proxied to the backend — no CORS!
        source: "/api/:path*",
        // destination: "https://secsales-backend-6rd9f2le1-noorqualysec-1339s-projects.vercel.app/api/:path*",
         headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,POST,PUT,DELETE,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type" },
        ],
      },
      // {
      //   source: "/api/:path*",
      //   headers: [
      //     { key: "Access-Control-Allow-Origin", value: "*" },
      //     { key: "Access-Control-Allow-Methods", value: "GET,POST,PUT,DELETE,OPTIONS" },
      //     { key: "Access-Control-Allow-Headers", value: "Content-Type" },
      //   ],
      // },
    ];
  },
};

export default nextConfig;
