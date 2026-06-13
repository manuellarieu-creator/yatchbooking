import { Metadata } from 'next'

export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/listings/${params.id}`,
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
