/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  experimental: {
    // Tree-shake heavy barrel imports so each page only ships the icons
    // / components it actually uses. Cuts route chunks by 30–50%.
    optimizePackageImports: [
      'antd',
      '@ant-design/icons',
      'dayjs',
      'recharts',
      '@tanstack/react-query',
      'lodash',
    ],
    // App Router client-side cache — pages stay in the in-memory cache
    // for N seconds, so going back to a recent route is instant (no
    // network, no React tree rebuild). Defaults in Next 15 are 0/30s
    // which makes "Back" feel slow.
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:3001'}/api/:path*`,
      },
    ];
  },
  async redirects() {
    return [
      // Migrate /projects → /objects (object-centered workspace)
      { source: '/projects', destination: '/objects', permanent: false },
      { source: '/projects/:id', destination: '/objects/:id', permanent: false },
      { source: '/projects/:id/:path*', destination: '/objects/:id/:path*', permanent: false },
    ];
  },
};
export default nextConfig;
