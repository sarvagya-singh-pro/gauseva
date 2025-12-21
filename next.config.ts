import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,

  // 1. Tell Next.js these are external (prevents bundling attempts)
  serverExternalPackages: ['onnxruntime-node', 'sharp'],

  // 2. Disable TypeScript type checking during build (saves memory/time)
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // 3. Disable ESLint during build (saves memory)
  eslint: {
    ignoreDuringBuilds: true,
  },

  webpack: (config) => {
    // 4. Force Webpack to ignore ONNX binaries entirely
    config.externals.push({
      'onnxruntime-node': 'commonjs onnxruntime-node',
      'sharp': 'commonjs sharp',
    });
    return config;
  },

  experimental: {
    // @ts-ignore
    outputFileTracingIncludes: {
      '/api/predict': ['./public/**/*'],
    },
    // 5. Exclude heavy node_modules from tracing (Critical for Memory)
    outputFileTracingExcludes: {
      '*': [
        'node_modules/@swc/core-linux-x64-gnu',
        'node_modules/@swc/core-linux-x64-musl',
        'node_modules/esbuild-linux-64/bin',
        'node_modules/onnxruntime-node/bin/napi-v3/darwin/**/*.node', // Exclude Mac binaries
        'node_modules/onnxruntime-node/bin/napi-v3/win32/**/*.node',  // Exclude Windows binaries
      ],
    },
  },
};

export default nextConfig;
