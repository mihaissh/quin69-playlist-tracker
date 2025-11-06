/** @type {import('next').NextConfig} */
const nextConfig = {
  // Only use static export in production builds
  // This allows API routes to work in development
  ...(process.env.NODE_ENV === 'production' && { output: 'export' }),
  images: {
    unoptimized: true,
  },
  basePath: process.env.NODE_ENV === 'production' ? '/quin69-playlist-tracker' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/quin69-playlist-tracker' : '',
}

module.exports = nextConfig

