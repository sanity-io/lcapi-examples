import type {NextConfig} from 'next'

const nextConfig: NextConfig = {
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  experimental: {
    ppr: 'incremental',
    reactCompiler: true,
    useCache: true,
  },
}

export default nextConfig
