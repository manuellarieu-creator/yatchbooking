const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const fs = require('fs');

(async () => {
  console.log("Ouverture du navigateur... Regardez votre écran !");
  // headless: false opens a visible browser window on the user's desktop
  const browser = await puppeteer.launch({ headless: false, defaultViewport: null });
  const page = await browser.newPage();
  
  console.log("Navigation vers YachtWorld...");
  try {
    await page.goto('https://www.yachtworld.fr/yacht/2001-sunseeker-camargue-44-9581379/', { waitUntil: 'domcontentloaded', timeout: 0 });
  } catch (e) {
    console.log("Goto error ignorée : ", e);
  }
  
  console.log("Veuillez passer le captcha Cloudflare s'il y en a un dans le navigateur qui vient de s'ouvrir.");
  console.log("Le script attend de voir le contenu de la page (max 60 secondes)...");
  
  try {
    // Wait for a generic element that indicates the page loaded (like a main container or h1)
    await page.waitForSelector('h1', { timeout: 60000 });
    
    // Wait an extra 2 seconds for dynamic content
    await new Promise(r => setTimeout(r, 2000));
    
    const html = await page.content();
    fs.writeFileSync('yacht_test_visible.html', html);
    console.log("Succès ! Code HTML sauvegardé. Fermeture du navigateur.");
  } catch (err) {
    console.error("Délai dépassé ou erreur :", err);
  } finally {
    await browser.close();
  }
})();
