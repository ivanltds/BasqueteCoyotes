/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Cloudinary CDN
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      // Instagram CDN (para o InstaFeed futuro)
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
