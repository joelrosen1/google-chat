/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'serpapi.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig 