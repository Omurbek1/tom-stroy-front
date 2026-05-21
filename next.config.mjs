/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['antd', '@ant-design/icons'],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:3001'}/api/:path*`,
      },
    ];
  },
};
export default nextConfig;
