/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    NEXT_PUBLIC_EVENT_NAME: process.env.NEXT_PUBLIC_EVENT_NAME || 'Our Special Event',
    NEXT_PUBLIC_EVENT_DATE: process.env.NEXT_PUBLIC_EVENT_DATE || 'December 31, 2024',
    NEXT_PUBLIC_EVENT_LOCATION: process.env.NEXT_PUBLIC_EVENT_LOCATION || 'Grand Ballroom',
  },
};

module.exports = nextConfig;
