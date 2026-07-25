/** @type {import('next').NextConfig} */
const nextConfig = {
  // Only use static export in production builds
  // This allows rewrites to work in development
  ...(process.env.NODE_ENV === 'production' && { output: 'export' }),
  // Dev-only rewrite to proxy iTunes API and avoid CORS on localhost
  ...(process.env.NODE_ENV !== 'production' && {
    async rewrites() {
      return [
        {
          source: '/api/itunes',
          destination: 'https://itunes.apple.com/search',
        },
      ];
    },
  }),
  images: {
    unoptimized: true,
  },
  basePath: process.env.NODE_ENV === 'production' ? '/quin69-playlist-tracker' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/quin69-playlist-tracker' : '',
}

module.exports = nextConfig

