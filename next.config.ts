import type { NextConfig } from "next";

// GitHub Pages serves a project site under /<repo>, so the production build
// needs a basePath. Dev stays at root for easy local testing.
const repo = "gradeflow";
const isProd = process.env.NODE_ENV === "production";
const basePath =
  process.env.NEXT_PUBLIC_BASE_PATH ?? (isProd ? `/${repo}` : "");

const nextConfig: NextConfig = {
  output: "export",
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
  trailingSlash: true,
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;
