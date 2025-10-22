import type {NextConfig} from 'next'

const nextConfig: NextConfig = {
  cacheComponents: true,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  reactCompiler: true,
}

export default nextConfig
