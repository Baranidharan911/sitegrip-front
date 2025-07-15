/** @type {import('next').NextConfig} */
import withBundleAnalyzer from '@next/bundle-analyzer';

const nextConfig = withBundleAnalyzer({
  enabled: process.env.BUNDLE_ANALYZE === 'both',
})({
  // Performance optimizations for 50+ concurrent users
  experimental: {
    optimizePackageImports: ['lucide-react', 'react-hot-toast', 'framer-motion'],
    serverComponentsExternalPackages: ['firebase'],
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
    ],
  },

  // Compression and caching
  compress: true,
  poweredByHeader: false,
  
  // Webpack configuration for performance
  webpack: (config, { dev, isServer }) => {
    // Production optimizations
    if (!dev && !isServer) {
      // Enhanced chunk splitting for better caching
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true,
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 5,
            reuseExistingChunk: true,
          },
          firebase: {
            test: /[\\/]node_modules[\\/]firebase/,
            name: 'firebase',
            chunks: 'all',
            priority: 20,
          },
          react: {
            test: /[\\/]node_modules[\\/]react/,
            name: 'react',
            chunks: 'all',
            priority: 20,
          },
          // Separate large libraries
          framer: {
            test: /[\\/]node_modules[\\/]framer-motion/,
            name: 'framer',
            chunks: 'all',
            priority: 15,
          },
          recharts: {
            test: /[\\/]node_modules[\\/]recharts/,
            name: 'recharts',
            chunks: 'all',
            priority: 15,
          },
          // Separate utilities
          utils: {
            test: /[\\/]src[\\/]utils[\\/]/,
            name: 'utils',
            chunks: 'all',
            priority: 8,
          },
          // Separate components
          components: {
            test: /[\\/]src[\\/]components[\\/]/,
            name: 'components',
            chunks: 'all',
            priority: 8,
          },
        },
      };
      
      // Enable tree shaking
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
      
      // Optimize bundle size
      config.optimization.minimize = true;
      
      // Enable module concatenation
      config.optimization.concatenateModules = true;
      
      // Optimize runtime
      config.optimization.runtimeChunk = 'single';
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
      // Redirect www to non-www for better caching
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.sitegrip.io',
          },
        ],
        destination: 'https://sitegrip.io/:path*',
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

  // Output configuration
  output: 'standalone',
  
  // Enable SWC minification for better performance
  swcMinify: true,
});

export default nextConfig;