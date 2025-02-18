import type {NextConfig} from 'next'

const nextConfig: NextConfig = {
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  experimental: {
    ppr: 'incremental',
    useCache: true,
  },
}

export default nextConfig
