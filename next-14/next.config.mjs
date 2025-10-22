/** @type {import('next').NextConfig} */
const nextConfig = {
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  eslint: {ignoreDuringBuilds: true},
}

export default nextConfig
