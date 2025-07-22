/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@workspace/ui'],
  experimental: {
    browserDebugInfoInTerminal: process.env.NODE_ENV === 'development',
  },
};

export default nextConfig;
