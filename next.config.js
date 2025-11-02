/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: process.env.NODE_ENV === 'production' ? '/quin69-playlist-tracker' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/quin69-playlist-tracker' : '',
}

module.exports = nextConfig

