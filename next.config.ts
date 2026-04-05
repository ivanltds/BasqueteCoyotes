import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    // Permite otimização de imagens locais e de domínios externos futuros (Instagram CDN, etc.)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: '**.cdninstagram.com',
      },
      {
        protocol: 'https',
        hostname: '**.fbcdn.net',
      },
    ],
  },
}

export default nextConfig
