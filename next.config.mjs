/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',

  // Speeds up `next build` — TS errors are caught by `npm run typecheck` /
  // CI. The build step itself just emits, no second type-check pass.
  typescript: { ignoreBuildErrors: true },
  // Same idea for ESLint — `npm run lint` covers it; build doesn't need
  // to re-walk every file.
  eslint: { ignoreDuringBuilds: true },

  // Production source-maps add ~30-50% to build time and 2-3x to artifact
  // size. Keep them off; turn back on temporarily if you need to debug
  // a minified prod stack.
  productionBrowserSourceMaps: false,

  // Hide `X-Powered-By: Next.js` — tiny RTT win + less fingerprint info.
  poweredByHeader: false,

  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },

  experimental: {
    // Tree-shake heavy barrel imports so each page only ships the icons
    // / components it actually uses. Cuts route chunks by 30–50%.
    optimizePackageImports: [
      'antd',
      '@ant-design/icons',
      'dayjs',
      'recharts',
      '@tanstack/react-query',
      '@tanstack/react-virtual',
      'lodash',
      'socket.io-client',
    ],
    // App Router client-side cache — pages stay in the in-memory cache
    // for N seconds, so going back to a recent route is instant (no
    // network, no React tree rebuild). Defaults in Next 15 are 0/30s
    // which makes "Back" feel slow.
    staleTimes: {
      dynamic: 60,
      static: 300,
    },
    // Strict CSS chunking — avoids style-cascade race conditions when
    // multiple routes share a stylesheet. Tiny load-time win.
    cssChunking: 'strict',
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
