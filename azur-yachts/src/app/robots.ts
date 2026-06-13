import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
    'https://azuryachts.vercel.app'
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/dashboard/',
          '/profile/',
          '/bookings/',
          '/api/',
          '/verify/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
