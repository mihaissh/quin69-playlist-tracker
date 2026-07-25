/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(process.env.NODE_ENV === 'production' && { output: 'export' }),
  images: {
    unoptimized: true,
  },
  basePath: process.env.NODE_ENV === 'production' ? '/quin69-playlist-tracker' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/quin69-playlist-tracker' : '',
}

module.exports = nextConfig
