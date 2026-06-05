const fs = require('fs');

// Read the backup file
let content = fs.readFileSync('src/pages/index.astro.backup', 'utf8');

// Fix 1: Add missing hyphens to ALL CSS properties
const cssFixes = {
  'box-shadow': 'box-shadow',
  'text-shadow': 'text-shadow',
  'line-height': 'line-height',
  'letter-spacing': 'letter-spacing',
  'background-clip': 'background-clip',
  'text-fill-color': 'text-fill-color',
  'backdrop-filter': 'backdrop-filter',
  'align-items': 'align-items',
  'justify-content': 'justify-content',
  'flex-direction': 'flex-direction',
  'flex-wrap': 'flex-wrap',
  'grid-template-columns': 'grid-template-columns',
  'border-radius': 'border-radius',
  'border-color': 'border-color',
  'background-color': 'background-color',
  'font-weight': 'font-weight',
  'font-size': 'font-size',
  'font-family': 'font-family',
  'text-transform': 'text-transform',
  'margin-bottom': 'margin-bottom',
  'padding-bottom': 'padding-bottom',
  'border-bottom': 'border-bottom',
  'list-style': 'list-style',
  'min-height': 'min-height',
  'max-width': 'max-width',
  'object-fit': 'object-fit',
  'box-sizing': 'box-sizing',
  'word-break': 'word-break',
  'flex-shrink': 'flex-shrink',
  'inline-block': 'inline-block',
  'radial-gradient': 'radial-gradient',
  'linear-gradient': 'linear-gradient'
};

for (const [wrong, correct] of Object.entries(cssFixes)) {
  content = content.split(wrong).join(correct);
}

// Fix 2: Fix transform functions (missing colons)
content = content.replace(/transform(\s+)translateY/g, 'transform: translateY');
content = content.replace(/transform(\s+)translateX/g, 'transform: translateX');
content = content.replace(/transform(\s+)scaleX/g, 'transform: scaleX');
content = content.replace(/transform(\s+)scaleY/g, 'transform: scaleY');
content = content.replace(/transform(\s+)scale\(/g, 'transform: scale(');

// Fix 3: Fix rgba values (missing commas)
content = content.replace(/rgba\((\d+)\s+(\d+)\s+(\d+)\s+([\d.]+)\)/g, 'rgba($1, $2, $3, $4)');

// Fix 4: Add proper container padding and section spacing
// (These should already be in BaseLayout, but let's verify)

// Write the fixed file
fs.writeFileSync('src/pages/index.astro', content);
console.log('Fixed all CSS syntax issues');
