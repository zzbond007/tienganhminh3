import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === "true";
const basePath = isGitHubPages ? (process.env.NEXT_PUBLIC_BASE_PATH ?? "/tienganhminh3") : "";

const nextConfig: NextConfig = {
  output: isGitHubPages ? "export" : undefined,
  basePath: isGitHubPages ? basePath : undefined,
  assetPrefix: isGitHubPages ? basePath : undefined,
  trailingSlash: true,
  images: { unoptimized: isGitHubPages },
  typescript: isGitHubPages ? { tsconfigPath: "tsconfig.github.json" } : undefined,
};

export default nextConfig;
