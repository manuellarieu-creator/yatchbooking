const fs = require('fs');

const path = 'src/app/(public)/dashboard/page.tsx';
let data = fs.readFileSync(path, 'utf8');

const listingsStart = data.indexOf('<div className="listings-grid">');
const listingsEndStr = '</div>\n          </div>\n\n          {/* ══════ RÉSERVATIONS ══════ */}';
const listingsEnd = data.indexOf(listingsEndStr, listingsStart);

if (listingsStart !== -1 && listingsEnd !== -1) {
  const newListings = `<div className="listings-grid">
              {dashboardData.listings.map((l: any) => (
                <div className="listing-mini-card" key={l.id}>
                  <div className="lmc-img" style={{ backgroundImage: \`url(\${l.images?.[0]?.url || ''})\`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                    <div className="lmc-img-grad"></div>
                    <div className="lmc-badge"><span className={\`badge badge-\${l.status === 'ACTIVE' ? 'active' : 'pending'}\`}>{l.status}</span></div>
                  </div>
                  <div className="lmc-body">
                    <div className="lmc-type">{l.boatType}</div>
                    <div className="lmc-name">{l.title}</div>
                    <div className="lmc-stats">
                      <span className="lmc-stat">👁 <strong>{l.viewCount || 0}</strong> vues</span>
                      <span className="lmc-stat">📅 <strong>{l._count?.bookings || 0}</strong> résa</span>
                      <span className="lmc-stat">⭐ <strong>{l._count?.reviews ? '4.9' : '—'}</strong></span>
                    </div>
                    <div className="lmc-footer">
                      <div className="lmc-price">€{l.price} <small>/ jour</small></div>
                      <div className="lmc-actions">
                        <Link href={\`/yacht/\${l.id}\`}><button className="lmc-btn">Voir</button></Link>
                        <button className="lmc-btn" onClick={() => triggerToast('Désactivation…')}>⏸</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            `;
            
  data = data.slice(0, listingsStart) + newListings + data.slice(listingsEnd);
}

fs.writeFileSync(path, data);
console.log('Updated listings grid.');
