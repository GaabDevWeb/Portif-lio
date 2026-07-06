import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["three"],
  poweredByHeader: false,
  compress: true,
};

export default nextConfig;
