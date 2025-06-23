/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  basePath: isProd ? '/' : '',
  images: {
    unoptimized: true,
  },
  // ❌ Removed "output: 'export'" to support dynamic routes and Firestore
};

export default nextConfig;
