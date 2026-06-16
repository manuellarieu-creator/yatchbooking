const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    if (!fs.existsSync(dir)) return results;
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory() && !file.includes('node_modules') && !file.includes('.next') && !file.includes('.git')) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.md')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk(path.join(__dirname, 'src'));
files.push(path.join(__dirname, 'RECAPITULATIF.md'));
files.push(path.join(__dirname, 'OPTIMISATION_SUPABASE.md'));

let changedCount = 0;

files.forEach(file => {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Logos / ALL CAPS
    content = content.replace(/AZUR\s*YACHTS?/g, 'VOYYACHT');
    content = content.replace(/AZUR<span>&nbsp;YACHTS<\/span>/g, 'VOY<span>&nbsp;YACHT</span>');
    
    // Normal Text
    content = content.replace(/Azur Yachts/g, 'VoyYacht');
    content = content.replace(/Azur Yacht/g, 'VoyYacht');
    
    // Lowercase / URLs / Emails
    content = content.replace(/azuryachts\.com/g, 'voyyacht.com');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        changedCount++;
        console.log('Modified:', file);
    }
});

console.log('Total files modified:', changedCount);
