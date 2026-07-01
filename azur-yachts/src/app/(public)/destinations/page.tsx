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

  // Filter out destinations with 0 yachts if desired, but here we show all active ones
  // Or at least sort them to show those with yachts first
  const sortedDestinations = destinations.sort((a, b) => b.count - a.count);

  return (
    <main className="destinations-page">
      <section className="destinations-header">
        <h1>Nos Destinations <em>d'Exception</em></h1>
        <p>Des criques secrètes de la mer Méditerranée aux lagons turquoise des Caraïbes, choisissez votre horizon. Découvrez notre sélection mondiale pour une expérience de navigation inoubliable.</p>
      </section>

      <section className="destinations-content">
        <div className="dest-grid">
          {sortedDestinations.map((dest) => (
            <Link 
              href={`/listings?location=${encodeURIComponent(dest.name)}`} 
              key={dest.id} 
              className="dest-card" 
              style={{ textDecoration: 'none' }}
            >
              <div 
                className="dest-bg" 
                style={{ 
                  background: dest.imageUrl 
                    ? `url('${dest.imageUrl}') center/cover` 
                    : (dest.gradient || 'linear-gradient(135deg, #1a5a80, #0a2540)') 
                }}
              ></div>
              <div className="dest-overlay"></div>
              
              {dest.isLarge && <span className="dest-tag">Populaire</span>}
              
              <div className="dest-info">
                <div className="dest-name">{dest.name}</div>
                <div className="dest-count">
                  {dest.count} {dest.count > 1 ? 'yachts disponibles' : (dest.count === 1 ? 'yacht disponible' : 'Bientôt disponible')}
                </div>
                
                {dest.minPrice !== null && (
                  <div className="dest-price">
                    à partir de {formatPrice(dest.minPrice)} / jour
                  </div>
                )}
                
                <div className="dest-action">
                  <span className="dest-btn">Explorer</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        {sortedDestinations.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.6)' }}>
            <p>Aucune destination n'est disponible pour le moment.</p>
          </div>
        )}
      </section>
    </main>
  );
}
