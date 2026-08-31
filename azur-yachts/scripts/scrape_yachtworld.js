const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const cheerio = require('cheerio');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const urls = [
  "https://www.yachtworld.fr/yacht/2001-sunseeker-camargue-44-9581379/",
  "https://www.yachtworld.fr/yacht/2002-sunseeker-camargue-44-10141494/",
  "https://www.yachtworld.fr/yacht/2016-prestige-500-10297337/",
  "https://www.yachtworld.fr/yacht/2022-custom-line-120-10002046/",
  "https://www.yachtworld.fr/yacht/2016-princess-v48-open-10214290/",
  "https://www.yachtworld.fr/yacht/2010-sunseeker-predator-74-9884847/",
  "https://www.yachtworld.fr/yacht/2002-sanlorenzo-sl82-10252643/",
  "https://www.yachtworld.fr/yacht/1996-mangusta-100-9966150/",
  "https://www.yachtworld.fr/yacht/2011-princess-64-10025036/",
  "https://www.yachtworld.fr/yacht/2018-pershing-5x-9916352/",
  "https://www.yachtworld.fr/yacht/2019-numarine-32xp-10126223/",
  "https://www.yachtworld.fr/yacht/2020-iliad-50-10237280/",
  "https://www.yachtworld.fr/yacht/2023-mangusta-mangusta-104-rev-10093392/",
  "https://www.yachtworld.fr/yacht/2011-pershing-72-10220723/",
  "https://www.yachtworld.fr/yacht/2024-riva-76-perseo-super-10115874/",
  "https://www.yachtworld.fr/yacht/2014-azimut-magellano-50-9757800/",
  "https://www.yachtworld.fr/yacht/1990-lowland-netship-97-10193449/",
  "https://www.yachtworld.fr/yacht/2006-atlantis-55-10260434/",
  "https://www.yachtworld.fr/yacht/2014-palmer-johnson-custom-8833997/",
  "https://www.yachtworld.fr/yacht/2008-princess-v58-3879768/",
  "https://www.yachtworld.fr/yacht/2010-riviera-3600-sport-yacht-10278140/",
  "https://www.yachtworld.fr/yacht/1995-mondomarine-mondomarine-30-10008389/",
  "https://www.yachtworld.fr/yacht/2005-mochi-craft-74-dolphin-9174108/",
  "https://www.yachtworld.fr/yacht/2015-prestige-420s-6419596/",
  "https://www.yachtworld.fr/yacht/2018-rinker-ex-370-10077084/",
  "https://www.yachtworld.fr/yacht/2008-rinker-350-express-cruiser-10190022/",
  "https://www.yachtworld.fr/yacht/2012-rinker-310-express-cruiser-10215953/",
  "https://www.yachtworld.fr/yacht/2010-rinker-310-express-cruiser-9906160/",
  "https://www.yachtworld.fr/yacht/2002-rinker-fiesta-vee-342-10291067/",
  "https://www.yachtworld.fr/yacht/2002-rinker-fiesta-vee-342-9962338/",
  "https://www.yachtworld.fr/yacht/2014-rinker-310-express-cruiser-10209344/",
  "https://www.yachtworld.fr/yacht/2018-pershing-5x-10266071/",
  "https://www.yachtworld.fr/yacht/2004-fairline-targa-40-10237988/",
  "https://www.yachtworld.fr/yacht/2026-prestige-f5-7-9524822/",
  "https://www.yachtworld.fr/yacht/2025-beneteau-gran-turismo-41-10190958/",
  "https://www.yachtworld.fr/yacht/2022-pardo-yachts-p38-10281514/",
  "https://www.yachtworld.fr/yacht/2023-azimut-magellano-66-10200908/",
  "https://www.yachtworld.fr/yacht/2021-princess-v50-open-10267248/",
  "https://www.yachtworld.fr/yacht/2020-pardo-yachts-43-9785190/",
  "https://www.yachtworld.fr/yacht/2024-sunseeker-90-ocean-9490603/",
  "https://www.yachtworld.fr/yacht/2023-cobra-yachts-futura-36-premium-fly-10272048/",
  "https://www.yachtworld.fr/yacht/2013-jeanneau-nc-9-10144327/",
  "https://www.yachtworld.fr/yacht/2013-prestige-620-10067451/",
  "https://www.yachtworld.fr/yacht/1996-azimut-54-9498689/",
  "https://www.yachtworld.fr/yacht/2020-invictus-tt460-9868757/",
  "https://www.yachtworld.fr/yacht/2023-tiara-yachts-c49-coupe-9660249/",
  "https://www.yachtworld.fr/yacht/2015-sunseeker-68-sport-yacht-6873629/",
  "https://www.yachtworld.fr/yacht/2007-absolute-56-9925559/",
  "https://www.yachtworld.fr/yacht/2020-poseidon-cml-yacht-poseidon-3-0-9636670/",
  "https://www.yachtworld.fr/yacht/2008-fairline-squadron-58-9023555/"
];

(async () => {
  // Get an admin user to assign as owner
  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (!admin) {
    console.error("No ADMIN user found in DB. Please create one first.");
    process.exit(1);
  }

  console.log("Ouverture du navigateur...");
  const browser = await puppeteer.launch({ headless: false, defaultViewport: null });
  const page = await browser.newPage();

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    console.log(`\n[${i+1}/${urls.length}] Traitement de ${url}`);
    
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 0 });
      
      // Wait for the JSON-LD script tag to appear (which means Cloudflare is passed)
      await page.waitForFunction(() => {
        const scripts = document.querySelectorAll('script[type="application/ld+json"]');
        for (let s of scripts) {
          if (s.innerText.includes('"@type":"Product"')) return true;
        }
        return false;
      }, { timeout: 60000 }); // Wait up to 60s in case captcha is needed
      
      const html = await page.content();
      const $ = cheerio.load(html);
      
      let productData = null;
      $('script[type="application/ld+json"]').each((_, el) => {
        try {
          const json = JSON.parse($(el).html());
          if (json['@type'] === 'Product') {
            productData = json;
          }
        } catch(e) {}
      });

      if (!productData) {
        console.log("❌ Données produit introuvables.");
        continue;
      }

      const title = productData.name || "Bateau Inconnu";
      const description = productData.description || "Description non disponible.";
      const price = productData.offers && productData.offers.price ? parseFloat(productData.offers.price) : 5000;
      const imageUrl = productData.image;
      
      // Parse year/length from title if possible (e.g. "2001 Sunseeker Camargue 44 | 14,0 m")
      let year = 2020;
      let length = 10;
      const yearMatch = title.match(/(\d{4})/);
      if (yearMatch) year = parseInt(yearMatch[1]);
      
      const lengthMatch = title.match(/(\d+,\d+)\s*m/);
      if (lengthMatch) length = parseFloat(lengthMatch[1].replace(',', '.'));

      // Save to database
      const listing = await prisma.listing.create({
        data: {
          title: title,
          description: description,
          price: price,
          country: "France",
          location: "Côte d'Azur", // default
          status: "ACTIVE",
          maxAdults: 8,
          maxChildren: 2,
          boatType: "Yacht",
          boatYear: year,
          boatLength: length,
          cabins: 2,
          cleaningFee: 0,
          ownerId: admin.id,
          images: imageUrl ? {
            create: [
              { url: imageUrl, publicId: 'yachtworld_import', order: 0 }
            ]
          } : undefined
        }
      });
      
      console.log(`✅ Ajouté en base : ${title} (${price}€)`);
      
      // Petit délai pour ne pas bombarder le serveur
      await new Promise(r => setTimeout(r, 2000));
      
    } catch (err) {
      console.log(`❌ Erreur sur ${url}:`, err.message);
    }
  }

  await browser.close();
  console.log("\nTerminé !");
})();
