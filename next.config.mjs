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
            value: "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://va.vercel-scripts.com https://vercel.live https://*.vercel.live; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://vercel.live https://*.vercel.live; font-src 'self' https://fonts.gstatic.com https://vercel.live https://*.vercel.live; img-src 'self' data: https://picsum.photos https://play-lh.googleusercontent.com https://www.transparenttextures.com https://vercel.live https://*.vercel.live; connect-src 'self' https://cepulxyicmzafhswooet.supabase.co wss://cepulxyicmzafhswooet.supabase.co https://api.xaliye6.online https://vercel.live https://*.vercel.live;",
          },
        ],
      },
    ]
  },
}

export default nextConfig
