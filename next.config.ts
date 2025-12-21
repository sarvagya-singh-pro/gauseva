import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false, // Disable for WebRTC stability

  // 1. Force Next.js to NOT bundle these server-side packages
  serverExternalPackages: ['onnxruntime-node', 'sharp'],

  // 2. Webpack Override (Critical for Vercel/Linux binary loading)
  webpack: (config) => {
    config.externals.push({
      'onnxruntime-node': 'commonjs onnxruntime-node',
      'sharp': 'commonjs sharp',
    });
    return config;
  },

  // 3. Ensure Model Files in 'public' are copied to the Lambda function
  experimental: {
    outputFileTracingIncludes: {
      '/api/predict': ['./public/**/*'],
    },
  },
};

export default nextConfig;
