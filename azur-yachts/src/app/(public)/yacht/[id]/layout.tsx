import { Metadata } from 'next'
import { db as prisma } from '@/lib/db'

export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
    include: { images: true }
  })
  
  return {
    title: `${listing?.title || 'Yacht'}`,
    description: listing?.description?.slice(0, 160) || 
      'Location de yacht de prestige sur VoyYacht',
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
