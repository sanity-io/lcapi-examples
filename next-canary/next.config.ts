import type {NextConfig} from 'next'

const nextConfig: NextConfig = {
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  experimental: {
    dynamicIO: true,
    cacheLife: {
      default: {
        stale: undefined,
        revalidate: 60 * 60 * 24 * 30, // 1 month, the default is 15 minutes
        expire: 0xfffffffe,
      },
    },
    ppr: 'incremental',
  },
}

export default nextConfig
