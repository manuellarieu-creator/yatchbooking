import { MetadataRoute } from 'next'
import { db as prisma } from '@/lib/db'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
    'https://voyyacht.vercel.app'

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/listings`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/faq`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
    { url: `${baseUrl}/legal`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ]

  // Dynamic yacht pages
  const listings = await prisma.listing.findMany({
    where: { status: 'ACTIVE' },
    select: { id: true, updatedAt: true },
  })

  const listingPages: MetadataRoute.Sitemap = listings.map((l: any) => ({
    url: `${baseUrl}/yacht/${l.id}`,
    lastModified: l.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  return [...staticPages, ...listingPages]
}
