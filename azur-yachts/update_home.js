const fs = require('fs');

const path = 'src/app/page.tsx';
let data = fs.readFileSync(path, 'utf8');

// 1. Add state import and state variable
data = data.replace(
  `import { useEffect } from 'react';`,
  `import { useEffect, useState } from 'react';`
);

data = data.replace(
  `export default function HomePage() {`,
  `export default function HomePage() {\n  const [featuredYachts, setFeaturedYachts] = useState<any[]>([]);`
);

// 2. Add fetch logic in useEffect
data = data.replace(
  `    return () => observer.disconnect();\n  }, []);`,
  `    return () => observer.disconnect();\n  }, []);\n\n  useEffect(() => {\n    fetch('/api/listings?limit=3')\n      .then(res => res.json())\n      .then(data => {\n        if (data.listings) {\n          setFeaturedYachts(data.listings);\n        }\n      })\n      .catch(console.error);\n  }, []);`
);

// 3. Replace the yachts-grid content
const startIndex = data.indexOf('<div className="yachts-grid reveal">');
const endIndexStr = '</section>';
const sectionEndIndex = data.indexOf(endIndexStr, startIndex);

if (startIndex !== -1 && sectionEndIndex !== -1) {
  const newGrid = `<div className="yachts-grid reveal">
          {featuredYachts.length === 0 ? (
            <div style={{gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--text-light)'}}>
              <div className="spinner" style={{margin: '0 auto'}}></div>
            </div>
          ) : (
            featuredYachts.map((yacht: any) => (
              <Link href={\`/yacht/\${yacht.id}\`} key={yacht.id} className="yacht-card">
                <div className="yacht-img">
                  <div className="yacht-img-inner" style={{ background: yacht.images?.[0]?.url ? \`url(\${yacht.images[0].url}) center/cover\` : 'linear-gradient(135deg, #1a3a5a 0%, #0a2040 100%)' }}></div>
                  {yacht.owner?.advertiserTier === 'PREMIUM' && <span className="yacht-badge" style={{background: 'var(--gold)'}}>Populaire</span>}
                  {yacht.owner?.advertiserTier === 'PLATINIUM' && <span className="yacht-badge" style={{background: 'var(--ocean)'}}>Premium</span>}
                </div>
                <div className="yacht-body">
                  <div className="yacht-type">{yacht.boatType}</div>
                  <div className="yacht-name">{yacht.title}</div>
                  <div className="yacht-specs">
                    <span className="spec"><strong>{yacht.boatLength || '-'}m</strong> longueur</span>
                    <span className="spec"><strong>{yacht.maxAdults}</strong> adultes</span>
                    <span className="spec"><strong>{Math.max(1, Math.floor(yacht.maxAdults/2))}</strong> cabines</span>
                  </div>
                  <div className="yacht-footer">
                    <div className="yacht-price">€{yacht.price.toLocaleString()} <span>/ jour</span></div>
                    <button className="book-btn" onClick={(e) => { e.preventDefault(); window.location.href = \`/yacht/\${yacht.id}\`; }}>Réserver</button>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      `;
  
  data = data.slice(0, startIndex) + newGrid + data.slice(sectionEndIndex);
  fs.writeFileSync(path, data);
  console.log("Updated home page.");
} else {
  console.log("Could not find grid index.");
}
