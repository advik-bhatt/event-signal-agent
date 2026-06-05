import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    // Allow Three.js to work properly
    config.externals = config.externals || [];
    // Needed for @react-three/fiber / three to compile correctly
    config.resolve = config.resolve || {};
    return config;
  },
  // Allow images from external domains if needed in future
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;
