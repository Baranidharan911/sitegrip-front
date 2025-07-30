/** @type {import('next').NextConfig} */
import withBundleAnalyzer from '@next/bundle-analyzer';

const nextConfig = withBundleAnalyzer({
  enabled: process.env.BUNDLE_ANALYZE === 'both',
})({
  // Performance optimizations
  experimental: {
    optimizePackageImports: ['lucide-react', 'react-hot-toast', 'framer-motion', 'recharts', 'react-chartjs-2'],
    serverComponentsExternalPackages: ['firebase', 'puppeteer', 'playwright'],
    optimizeCss: true,
    scrollRestoration: true,
    // typedRoutes: true, // Temporarily disabled for build
  },
  
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    unoptimized: false,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'maps.googleapis.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
    ],
  },

  // Compression and caching
  compress: true,
  poweredByHeader: false,
  
  // Webpack configuration for performance
  webpack: (config, { dev, isServer }) => {
    // Production optimizations
    if (!dev && !isServer) {
      // Enhanced chunk splitting for better mobile performance
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
        maxSize: 244000, // Optimize for mobile networks
        cacheGroups: {
          // Critical vendor code
          criticalVendor: {
            test: /[\\/]node_modules[\\/](react|react-dom|next)[\\/]/,
            name: 'critical-vendor',
            chunks: 'all',
            priority: 30,
            enforce: true,
          },
          // UI libraries
          uiLibs: {
            test: /[\\/]node_modules[\\/](@headlessui|@radix-ui|lucide-react|clsx|class-variance-authority)[\\/]/,
            name: 'ui-libs',
            chunks: 'all',
            priority: 25,
          },
          // Chart libraries (lazy loaded)
          chartLibs: {
            test: /[\\/]node_modules[\\/](recharts|react-chartjs-2|chart\.js)[\\/]/,
            name: 'chart-libs',
            chunks: 'async',
            priority: 20,
          },
          // Animation libraries (lazy loaded)
          animationLibs: {
            test: /[\\/]node_modules[\\/](framer-motion|aos)[\\/]/,
            name: 'animation-libs',
            chunks: 'async',
            priority: 20,
          },
          // Firebase (separate for caching)
          firebase: {
            test: /[\\/]node_modules[\\/](firebase|@firebase)[\\/]/,
            name: 'firebase',
            chunks: 'all',
            priority: 15,
          },
          // Utilities
          utils: {
            test: /[\\/]node_modules[\\/](date-fns|axios|lodash)[\\/]/,
            name: 'utils',
            chunks: 'all',
            priority: 10,
          },
          // Default vendor
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendor',
            chunks: 'all',
            priority: 5,
            reuseExistingChunk: true,
          },
          // Common code
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 1,
            reuseExistingChunk: true,
          },
        },
      };
      
      // Aggressive optimization for mobile
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
      config.optimization.minimize = true;
      config.optimization.concatenateModules = true;
      config.optimization.runtimeChunk = 'single';
      config.optimization.moduleIds = 'deterministic';
      config.optimization.chunkIds = 'deterministic';
      
      // Mobile-specific optimizations
      config.optimization.splitChunks.maxAsyncRequests = 6;
      config.optimization.splitChunks.maxInitialRequests = 4;
      
      // Aggressive compression
      config.performance = {
        maxAssetSize: 250000,
        maxEntrypointSize: 400000,
        hints: 'warning'
      };
    }

    // Development optimizations
    if (dev) {
      // Faster builds in development
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: ['**/node_modules', '**/.next'],
      };
      
      // Enable hot module replacement
      config.optimization.removeAvailableModules = false;
      config.optimization.removeEmptyChunks = false;
      config.optimization.splitChunks = false;
    }

    // Optimize for both server and client
    if (!isServer) {
      // Client-side optimizations
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    return config;
  },

  // Headers for caching and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, s-maxage=86400',
          },
          // Performance headers
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Permitted-Cross-Domain-Policies',
            value: 'none',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Mobile performance headers
          {
            key: 'Accept-CH',
            value: 'DPR, Viewport-Width, Width',
          },
          {
            key: 'Critical-CH',
            value: 'DPR, Viewport-Width',
          },
        ],
      },
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // API routes caching
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=600',
          },
        ],
      },
      // Static assets
      {
        source: '/:path*.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Redirects for performance
  async redirects() {
    return [
      // Redirect non-www to www for consistency
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'sitegrip.com',
          },
        ],
        destination: 'https://www.sitegrip.com/:path*',
        permanent: true,
      },
    ];
  },

  // Rewrites for performance
  async rewrites() {
    return [
      // API rewrites for better performance
      {
        source: '/api/v1/:path*',
        destination: '/api/:path*',
      },
    ];
  },

  // Environment variables for performance
  env: {
    // Performance monitoring
    NEXT_PUBLIC_PERFORMANCE_MONITORING: process.env.NODE_ENV === 'production' ? 'true' : 'false',
    NEXT_PUBLIC_ENABLE_CACHING: 'true',
    NEXT_PUBLIC_ENABLE_BATCHING: 'true',
    NEXT_PUBLIC_ENABLE_RATE_LIMITING: 'true',
  },

  // Enable SWC minification for better performance
  swcMinify: true,
});

export default nextConfig;