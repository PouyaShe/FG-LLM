/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '**',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    NEXT_PUBLIC_LIVEKIT_WS_URL: process.env.NEXT_PUBLIC_LIVEKIT_WS_URL || 'ws://localhost:7880',
    NEXT_PUBLIC_WHITEBOARD_WS_URL: process.env.NEXT_PUBLIC_WHITEBOARD_WS_URL || 'ws://localhost:1234',
  },
};

module.exports = nextConfig;
