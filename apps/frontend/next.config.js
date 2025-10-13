/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      cesium: 'cesium',
    }
    return config
  },
}

module.exports = nextConfig