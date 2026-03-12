import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "books.google.com",
        pathname: "/**",
      },      
      {
        protocol: "https",
        hostname: "**.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "google.co.in",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "google.co.in",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.google.co.in",
        pathname: "/**",
      },
    ],
  },
  experimental: {
    serverActions: {
      /** Max request body size for Server Actions (default 1MB). Increase if saving large pages. */
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;
