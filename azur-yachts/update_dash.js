const fs = require('fs');

const path = 'src/app/(public)/dashboard/page.tsx';
let data = fs.readFileSync(path, 'utf8');

// Add useEffect
data = data.replace(
  `import { useState } from 'react';`,
  `import { useState, useEffect } from 'react';`
);

// Add data state
data = data.replace(
  `  const [bookingFilter, setBookingFilter] = useState('');`,
  `  const [bookingFilter, setBookingFilter] = useState('');\n  const [dashboardData, setDashboardData] = useState<any>({ stats: { revenue: 0, views: 0, bookingsCount: 0, occupancyRate: 0 }, listings: [], bookings: [] });\n  const [isLoading, setIsLoading] = useState(true);\n\n  useEffect(() => {\n    fetch('/api/dashboard').then(r => r.json()).then(data => {\n      if (!data.error) setDashboardData(data);\n      setIsLoading(false);\n    }).catch(() => setIsLoading(false));\n  }, []);`
);

// Replace bookings array (it starts at `const bookings = [` and ends at `  ];`)
const bookingsStart = data.indexOf('  const bookings = [');
const bookingsEndStr = '  ];';
const bookingsEnd = data.indexOf(bookingsEndStr, bookingsStart) + bookingsEndStr.length;

if (bookingsStart !== -1 && bookingsEnd !== -1) {
  const newBookings = `  const bookings = dashboardData.bookings.map((b: any) => ({\n    id: b.id,\n    boat: b.listing.title,\n    type: b.listing.boatType,\n    client: b.client.firstName + ' ' + b.client.lastName,\n    dates: new Date(b.startDate).toLocaleDateString() + ' - ' + new Date(b.endDate).toLocaleDateString(),\n    nights: b.totalNights,\n    total: '€' + b.totalPrice.toLocaleString(),\n    payment: 'Stripe',\n    status: b.status === 'CONFIRMED' ? 'confirmed' : (b.status === 'PENDING' ? 'pending' : 'payment'),\n    badge: b.status,\n    badgeClass: 'badge-' + (b.status === 'CONFIRMED' ? 'confirmed' : 'pending')\n  }));`;
  data = data.slice(0, bookingsStart) + newBookings + data.slice(bookingsEnd);
}

// Replace KPIs
data = data.replace(`<div className="kpi-val">€34 200</div>`, `<div className="kpi-val">€{dashboardData.stats.revenue.toLocaleString()}</div>`);
data = data.replace(`<div className="kpi-val">3</div>`, `<div className="kpi-val">{dashboardData.stats.bookingsCount}</div>`);
data = data.replace(`<div className="kpi-val">68%</div>`, `<div className="kpi-val">{dashboardData.stats.occupancyRate}%</div>`);
data = data.replace(`<div className="kpi-val">4.9★</div>`, `<div className="kpi-val">4.9★</div>`); // Keep rating mock or compute it

// Add loading state inside main
data = data.replace(
  `{/* ══════ OVERVIEW ══════ */}`,
  `{/* ══════ OVERVIEW ══════ */}\n          {isLoading && <div style={{padding: '50px', textAlign: 'center'}}>Chargement du tableau de bord...</div>}`
);

fs.writeFileSync(path, data);
console.log('Updated dashboard page.');
