import type { NextConfig } from "next";

/** Where the StudySense API runs (api/README.md). Read on the server only; the browser never calls it directly. */
// Trimmed, and without a trailing slash: "https://host/" would forward /api/health to //health, which the API 404s.
const API_URL = (process.env.API_URL?.trim() || "http://127.0.0.1:8000").replace(/\/+$/, "");

const nextConfig: NextConfig = {
  // The browser calls /api/... on the page's own origin and Next forwards it, so CORS, IPv6 "localhost" and
  // opening the app by IP address can't stop the estimate from loading.
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${API_URL}/:path*` }];
  },
};

export default nextConfig;
