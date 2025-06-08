// .github/scripts/generate-linktree.js
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { extname, basename } from 'path';


// CONFIG
const README = 'README.md';
const START  = '<!-- LINKS:START -->';
const END    = '<!-- LINKS:END -->';
const IMAGE_DIR = 'images';       // images/ folder in your repo
const LINK_REGEX = /^\s*-\s*\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/gm;

// 1. Load README
let md = readFileSync(README, 'utf8');

// 2. Extract all markdown links
let matches = [...md.matchAll(LINK_REGEX)];

// 3. Find all image files in images/
let imageFiles = existsSync(IMAGE_DIR)
  ? readdirSync(IMAGE_DIR).filter(f => /\.(png|jpe?g|gif|svg)$/i.test(f))
  : [];

// 4. Build new lines
let lines = matches.map(m => {
  const label = m[1].trim();
  const url   = m[2].trim();
  // look for an image whose basename matches label (case-insensitive)
  const img = imageFiles.find(f => 
    basename(f, extname(f)).toLowerCase() === label.toLowerCase()
  );
  if (img) {
    return `- ![${label}](${IMAGE_DIR}/${img}) [${label}](${url})`;
  } else {
    return `- [${label}](${url})`;
  }
});

// 5. Splice back into README
const before = md.split(START)[0] + START + '\n';
const after  = '\n' + END + md.split(END)[1];
const newSection = lines.join('\n');
const newMd = before + newSection + after;

writeFileSync(README, newMd);
console.log(`Generated ${lines.length} link entries in ${README}`);
