import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack is default in Next.js 16 — do not wrap with next-pwa (webpack plugin)
  // Service worker is registered manually via public/sw.js + ServiceWorkerRegistration component
  turbopack: {},
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
