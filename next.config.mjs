/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://picsum.photos https://play-lh.googleusercontent.com https://www.transparenttextures.com; connect-src 'self' https://cepulxyicmzafhswooet.supabase.co wss://cepulxyicmzafhswooet.supabase.co https://api.xaliye6.online;",
          },
        ],
      },
    ]
  },
}

export default nextConfig
