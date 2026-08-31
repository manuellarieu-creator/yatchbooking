const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const fs = require('fs');

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  console.log('Navigating to Yachtworld...');
  await page.goto('https://www.yachtworld.fr/yacht/2001-sunseeker-camargue-44-9581379/', { waitUntil: 'domcontentloaded' });
  
  // Wait a bit to ensure dynamic content loads
  await new Promise(r => setTimeout(r, 3000));
  
  const html = await page.content();
  fs.writeFileSync('yacht_test.html', html);
  await browser.close();
  console.log('HTML saved to yacht_test.html');
})();
