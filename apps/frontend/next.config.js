/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      cesium: 'cesium',
    }
    return config
  },
  // All /api/* paths are handled by explicit Next route handlers
  // (app/api/**/route.ts), which proxy to NEXT_PUBLIC_API_URL and fall back
  // to bundled offline data. No hardcoded backend rewrite needed.
}

module.exports = nextConfig