import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // ✅ Ensure you’re building for server output, not static export
  output: "standalone",

  // (optional) If you ever use fs or Node modules in API routes
  // this tells Next to include them properly in the Vercel build
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },

  // (optional) Helpful if you reference images or assets
  images: {
    unoptimized: true, // avoids Vercel image optimization errors for simple projects
  },
};

export default nextConfig;
