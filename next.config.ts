import type { NextConfig } from "next";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

function resolveReactIsSubpath(file: string): string {
  return path
    .join(path.dirname(require.resolve("react-is/package.json")), file)
    .replace(/\\/g, "/");
}

/** Subpath used by Turbopack alias — must stay project-relative, not absolute. */
const reactIsTurbopackAlias = "react-is/cjs/react-is.development.js";

/** Absolute path for webpack (production build). */
const reactIsWebpackAlias = resolveReactIsSubpath("cjs/react-is.development.js");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "three",
    "react-is",
    "prop-types",
    "react-force-graph-2d",
  ],
  poweredByHeader: false,
  compress: true,
  turbopack: {
    resolveAlias: {
      "react-is": reactIsTurbopackAlias,
    },
  },
  webpack: (config) => {
    config.resolve ??= {};
    config.resolve.alias ??= {};
    const alias = config.resolve.alias as Record<string, string>;
    alias["react-is"] = reactIsWebpackAlias;
    return config;
  },
};

export default nextConfig;
