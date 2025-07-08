/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  images: {
    unoptimized: true,
  },
  // basePath removed because '/' is invalid
  // output: 'export' removed — you're using dynamic routing + Firebase
  
  async headers() {
    return [
      {
        // Allow iframe embedding for the responsive preview tool
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN', // Allow embedding from same origin
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' localhost:* *.vercel.app *.netlify.app", // Allow embedding from same origin and common dev/hosting domains
          },
        ],
      },
    ];
  },
};

export default nextConfig;
