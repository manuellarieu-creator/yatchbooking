import { db as prisma } from "@/lib/db";
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import './destinations.css';

export const metadata = {
  title: 'Destinations de Rêve',
  description: 'Explorez nos destinations d\'exception à travers le monde. Des Caraïbes à la Méditerranée, trouvez le yacht idéal pour votre prochaine évasion.',
};

export const revalidate = 3600; // revalidate every hour

export default async function DestinationsPage() {
  // Fetch active destinations from the database
  const activeDestinations = await prisma.destination.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' }
  });

  // Calculate stats for each destination
  const destinations = await Promise.all(activeDestinations.map(async (dest) => {
    const aggregate = await prisma.listing.aggregate({
      where: {
        status: 'ACTIVE',
        OR: [
          { country: { contains: dest.name, mode: 'insensitive' } },
          { location: { contains: dest.name, mode: 'insensitive' } }
        ]
      },
      _count: { id: true },
      _min: { price: true }
    });
    
    return {
      ...dest,
      count: aggregate._count.id,
      minPrice: aggregate._min.price
    };
  }));

  const sortedDestinations = destinations.sort((a, b) => b.count - a.count);

  return (
    <main className="destinations-page">
      {/* PREMIUM HERO SECTION */}
      <section className="dest-hero">
        <div className="dest-hero-bg"></div>
        <div className="dest-hero-content">
          <span className="dest-hero-eyebrow">Explorez le Monde</span>
          <h1 className="dest-hero-title">Destinations <em>d'Exception</em></h1>
          <p className="dest-hero-desc">Des criques secrètes de la Méditerranée aux lagons turquoise des Caraïbes, choisissez votre horizon et découvrez notre sélection pour une navigation inoubliable.</p>
        </div>
      </section>

      {/* PREMIUM GRID */}
      <section className="destinations-content">
        <div className="dest-grid">
          {sortedDestinations.map((dest, i) => {
            let mosaicClass = '';
            const patternIndex = i % 6;
            
            if (patternIndex === 0) {
              mosaicClass = 'dest-card-large';
            } else if (patternIndex === 2) {
              mosaicClass = 'dest-card-tall';
            } else if (patternIndex === 3 || patternIndex === 5) {
              mosaicClass = 'dest-card-wide';
            }

            return (
            <Link 
              href={`/listings?location=${encodeURIComponent(dest.name)}`} 
              key={dest.id} 
              className={`dest-card ${mosaicClass}`} 
            >
              <div 
                className="dest-bg" 
                style={{ 
                  backgroundImage: dest.imageUrl ? `url('${dest.imageUrl}')` : 'none',
                  background: !dest.imageUrl ? (dest.gradient || 'linear-gradient(135deg, #1a5a80, #0a2540)') : undefined
                }}
              ></div>
              <div className="dest-overlay"></div>
              
              {dest.isLarge && <span className="dest-tag">Populaire</span>}
              
              <div className="dest-info">
                <div className="dest-name-wrapper">
                  <h2 className="dest-name">{dest.name}</h2>
                </div>
                <div className="dest-count">
                  {dest.count} {dest.count > 1 ? 'yachts' : 'yacht'}
                </div>
                
                {dest.minPrice !== null && (
                  <div className="dest-price">
                    À partir de {formatPrice(dest.minPrice)} / jour
                  </div>
                )}
              </div>
            </Link>
            );
          })}
        </div>
        
        {sortedDestinations.length === 0 && (
          <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-light)' }}>
            <p style={{ fontSize: '1.2rem', fontFamily: 'Cormorant Garamond, serif' }}>Aucune destination n'est disponible pour le moment.</p>
          </div>
        )}
      </section>
    </main>
  );
}
