import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false, 

  serverExternalPackages: ['onnxruntime-node', 'sharp'],

  webpack: (config) => {
    config.externals.push({
      'onnxruntime-node': 'commonjs onnxruntime-node',
      'sharp': 'commonjs sharp',
    });
    return config;
  },

  experimental: {
    // @ts-ignore: Valid Next.js config but missing from some type definitions
    outputFileTracingIncludes: {
      '/api/predict': ['./public/**/*'],
    },
  },
};

export default nextConfig;
