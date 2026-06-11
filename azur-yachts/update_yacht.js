const fs = require('fs');

const path = 'src/app/(public)/yacht/[id]/page.tsx';
let data = fs.readFileSync(path, 'utf8');

// Replace the specs table
const specsStart = data.indexOf('<table className="specs-table">');
const specsEndStr = '</table>';
const specsEnd = data.indexOf(specsEndStr, specsStart) + specsEndStr.length;

if (specsStart !== -1 && specsEnd !== -1) {
  const newSpecs = `<table className="specs-table">
              <tbody>
                <tr><td>Type</td><td>{yacht.boatType || '-'}</td></tr>
                <tr><td>Année</td><td>{yacht.boatYear || '-'}</td></tr>
                <tr><td>Longueur</td><td>{yacht.boatLength ? \`\${yacht.boatLength} m\` : '-'}</td></tr>
                <tr><td>Capacité adultes</td><td>{yacht.maxAdults || '-'}</td></tr>
                <tr><td>Capacité enfants</td><td>{yacht.maxChildren || '0'}</td></tr>
                <tr><td>Location max</td><td>{yacht.maxRentalHours ? \`\${yacht.maxRentalHours} heures\` : 'Sans limite'}</td></tr>
                <tr><td>Frais de nettoyage</td><td>{yacht.cleaningFee ? \`€\${yacht.cleaningFee}\` : 'Inclus'}</td></tr>
                <tr><td>Livraison disponible</td><td>{yacht.deliveryAvailable ? \`Oui (€\${yacht.deliveryFee})\` : 'Non'}</td></tr>
              </tbody>
            </table>`;
            
  data = data.slice(0, specsStart) + newSpecs + data.slice(specsEnd);
}

// Replace the chat initial message
data = data.replace(
  `{ type: 'incoming', text: "Bonjour ! N'hésitez pas si vous avez des questions sur l'Azura Prestige 68.", time: "10:15" }`,
  `{ type: 'incoming', text: \`Bonjour ! N'hésitez pas si vous avez des questions sur le \${yacht?.title || 'bateau'}.\`, time: "10:15" }`
);

// We need to move the state initialization of chatMsgs into a useEffect if we want it to be dynamic based on yacht, 
// or just use yacht.title in the render. Wait, if it's useState, yacht is initially null!
// Let's replace the Chat Msgs state with empty, and populate it in a useEffect when yacht loads.

fs.writeFileSync(path, data);
console.log("Updated yacht page specs.");
