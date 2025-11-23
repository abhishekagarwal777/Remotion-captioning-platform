/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {},

  experimental: {
    serverActions: {
      bodySizeLimit: "100mb",
    },
  },
};

module.exports = nextConfig;
