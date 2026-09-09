import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
    // Local artwork lives in /public/media. Whitelist a remote host here when
    // real project screenshots replace the generated placeholders.
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
  webpack: (config) => {
    /**
     * `@splinetool/runtime` points at DRACO decoder files with
     * `new URL("../libs/draco/…", import.meta.url)`, but the package does not
     * ship a `libs/` directory. Webpack treats those as asset references and
     * fails the build. Turning off `new URL` asset parsing for that package
     * leaves the expressions alone: they are only evaluated for
     * DRACO-compressed scenes, which this site does not use.
     */
    config.module.rules.push({
      test: /@splinetool[\\/]runtime[\\/]build[\\/].*\.js$/,
      parser: { url: false },
    });
    return config;
  },
};

export default nextConfig;
