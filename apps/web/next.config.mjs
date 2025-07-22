/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@workspace/ui'],
  experimental: {
    browserDebugInfoInTerminal: true,
  },
};

export default nextConfig;
