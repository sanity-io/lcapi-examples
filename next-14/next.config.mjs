/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pages router does not enable strict mode by default
  reactStrictMode: true,
  eslint: {ignoreDuringBuilds: true},
}

export default nextConfig
