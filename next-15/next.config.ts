import type {NextConfig} from 'next'

const nextConfig: NextConfig = {
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  experimental: {
    reactCompiler: true,
  }
}

export default nextConfig
