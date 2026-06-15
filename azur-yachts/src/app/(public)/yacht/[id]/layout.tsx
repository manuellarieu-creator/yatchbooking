import { Metadata } from 'next'

export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL 
    ? process.env.NEXT_PUBLIC_APP_URL 
    : (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  
  const res = await fetch(
    `${baseUrl}/api/listings/${params.id}`,
    { cache: 'no-store' }
  )
  const { listing } = await res.json()
  
  return {
    title: `${listing?.title || 'Yacht'}`,
    description: listing?.description?.slice(0, 160) || 
      'Location de yacht de prestige sur Azur Yachts',
    openGraph: {
      title: listing?.title,
      description: listing?.description?.slice(0, 160),
      images: listing?.images?.[0]?.url 
        ? [{ url: listing.images[0].url }] 
        : [],
      type: 'website',
    },
  }
}

export default function YachtLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
