import type {NextConfig} from 'next'

const nextConfig: NextConfig = {
  experimental: {
    dynamicIO: true,
    cacheLife: {
      default: {
        stale: undefined,
        revalidate: 60 * 60 * 24 * 30, // 1 month, the default is 15 minutes
        expire: 0xfffffffe,
      },
    },
  },
}

export default nextConfig