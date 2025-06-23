/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  images: {
    unoptimized: true,
  },
  // basePath removed because '/' is invalid
  // output: 'export' removed — you're using dynamic routing + Firebase
};

export default nextConfig;
