import type {NextConfig} from 'next'

const nextConfig: NextConfig = {
  cacheComponents: true,
  cacheLife: {
    default: {
      revalidate: 60 * 60 * 24 * 90,
    },
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  reactCompiler: true,
}

export default nextConfig
