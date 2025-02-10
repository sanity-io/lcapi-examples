import type {NextConfig} from 'next'

const nextConfig: NextConfig = {
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  experimental: {
    useCache: true,
    ppr: 'incremental',
  },
}

export default nextConfig
