// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   async headers() {
//     return [
//       {
//         // Any request to /api/:path* from the frontend
//         // gets transparently proxied to the backend — no CORS!
//         source: "/api/:path*",
//         // destination: "https://secsales-backend-6rd9f2le1-noorqualysec-1339s-projects.vercel.app/api/:path*",
//          headers: [
//           { key: "Access-Control-Allow-Origin", value: "*" },
//           { key: "Access-Control-Allow-Methods", value: "GET,POST,PUT,DELETE,OPTIONS" },
//           { key: "Access-Control-Allow-Headers", value: "Content-Type" },
//         ],
//       },
//       // {
//       //   source: "/api/:path*",
//       //   headers: [
//       //     { key: "Access-Control-Allow-Origin", value: "*" },
//       //     { key: "Access-Control-Allow-Methods", value: "GET,POST,PUT,DELETE,OPTIONS" },
//       //     { key: "Access-Control-Allow-Headers", value: "Content-Type" },
//       //   ],
//       // },
//     ];
//   },
// };

// export default nextConfig;

// app/api/proxy/[...path]/route.ts

import { NextRequest } from "next/server";

const BASE_URL =
  "https://secsales-backend-6rd9f2le1-noorqualysec-1339s-projects.vercel.app/api";

async function handler(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join("/");
  const url = `${BASE_URL}/${path}${req.nextUrl.search}`;

  const response = await fetch(url, {
    method: req.method,
    headers: req.headers,
    body:
      req.method !== "GET" && req.method !== "HEAD"
        ? await req.text()
        : undefined,
  });

  const data = await response.text();

  return new Response(data, {
    status: response.status,
    headers: {
      "Content-Type":
        response.headers.get("content-type") || "application/json",
    },
  });
}

export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as DELETE,
  handler as PATCH,
  handler as OPTIONS,
};
