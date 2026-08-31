const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('yacht_test_visible.html', 'utf8');
const $ = cheerio.load(html);

$('script').each((i, el) => {
  const text = $(el).html();
  if (text && text.includes('{')) {
    fs.writeFileSync('script_data_'+i+'.js', text.substring(0, 1000) + '...');
    console.log('Found script data:', i);
  }
});
