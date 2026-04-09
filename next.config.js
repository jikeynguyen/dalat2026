/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: isProd ? '/dalat2026' : '',
  assetPrefix: isProd ? '/dalat2026' : '',
};

module.exports = nextConfig;
