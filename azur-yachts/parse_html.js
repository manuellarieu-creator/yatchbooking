const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('yacht_test_visible.html', 'utf8');
const $ = cheerio.load(html);

console.log('Title:', $('title').text());
console.log('H1:', $('h1').text());

// Essai de trouver le prix
console.log('Price (.price):', $('.price').text());
console.log('Price (payment):', $('[class*="price"]').first().text());

// Essai de trouver la description
console.log('Desc:', $('[class*="description"]').first().text().substring(0, 100));

// Essai de trouver la galerie d'images
const images = [];
$('img').each((i, el) => {
  if ($(el).attr('src') && $(el).attr('src').includes('http')) {
    images.push($(el).attr('src'));
  }
});
console.log('Images (first 3):', images.slice(0, 3));
