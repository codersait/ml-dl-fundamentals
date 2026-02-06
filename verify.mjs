import fs from 'node:fs/promises';
import path from 'node:path';

const projectRoot = path.resolve(process.cwd());

const requiredHtmlIds = [
  'lang-toggle',
  'ml-basics',
  'neural-networks',
  'nn-canvas',
  'activation-canvas',
  'attention',
  'attention-viz',
  'attention-random',
  'attention-reset',
  'transformer',
  'transformer-viz',
];

const requiredScriptSnippets = [
  "new NeuralNetworkViz('nn-canvas')",
  "new AttentionViz('attention-viz')",
  "new TransformerViz('transformer-viz')",
  "'nav.ml-basics'",
  "'ml-basics.title'",
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function hasId(html, id) {
  const idPattern = new RegExp(`\\bid\\s*=\\s*["']${id}["']`, 'i');
  return idPattern.test(html);
}

function hasNavLink(html, href) {
  const hrefPattern = new RegExp(`\\bhref\\s*=\\s*["']${href.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}["']`, 'i');
  return hrefPattern.test(html);
}

// Check HTML tag matching
function checkHtmlTags(html) {
  const openTags = [];
  const tagStack = [];
  const selfClosingTags = new Set(['br', 'hr', 'img', 'input', 'meta', 'link', 'area', 'base', 'col', 'embed', 'source', 'track', 'wbr']);
  
  // Match all HTML tags
  const tagRegex = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
  let match;
  
  while ((match = tagRegex.exec(html)) !== null) {
    const isClosing = match[0].startsWith('</');
    const tagName = match[1].toLowerCase();
    
    if (selfClosingTags.has(tagName)) {
      continue; // Skip self-closing tags
    }
    
    if (isClosing) {
      if (tagStack.length === 0 || tagStack[tagStack.length - 1] !== tagName) {
        throw new Error(`Mismatched closing tag: </${tagName}>`);
      }
      tagStack.pop();
    } else {
      tagStack.push(tagName);
    }
  }
  
  if (tagStack.length > 0) {
    throw new Error(`Unclosed tags: ${tagStack.join(', ')}`);
  }
  
  return true;
}

// Extract all data-translate attributes from HTML
function extractTranslationKeys(html) {
  const translateRegex = /data-translate\s*=\s*["']([^"']+)["']/gi;
  const keys = new Set();
  let match;
  
  while ((match = translateRegex.exec(html)) !== null) {
    keys.add(match[1]);
  }
  
  return keys;
}

// Extract translation keys from scripts.js
function extractScriptTranslationKeys(js) {
  const keys = new Set();
  // Match both 'key': 'value' and "key": "value" patterns
  const keyRegex = /['"]([^'"]+)['"]\s*:/g;
  let match;
  
  while ((match = keyRegex.exec(js)) !== null) {
    const key = match[1];
    // Only include keys that look like translation keys (contain dots or nav.)
    if (key.includes('.') || key.startsWith('nav.')) {
      keys.add(key);
    }
  }
  
  return keys;
}

// Check navigation links point to existing sections
function checkNavLinks(html) {
  const navLinkRegex = /href\s*=\s*["']#([^"']+)["']/gi;
  const sectionIdRegex = /id\s*=\s*["']([^"']+)["']/gi;
  
  const navLinks = new Set();
  const sectionIds = new Set();
  
  let match;
  while ((match = navLinkRegex.exec(html)) !== null) {
    navLinks.add(match[1]);
  }
  
  while ((match = sectionIdRegex.exec(html)) !== null) {
    sectionIds.add(match[1]);
  }
  
  const brokenLinks = [];
  for (const link of navLinks) {
    if (!sectionIds.has(link)) {
      brokenLinks.push(link);
    }
  }
  
  if (brokenLinks.length > 0) {
    throw new Error(`Navigation links point to non-existent sections: ${brokenLinks.join(', ')}`);
  }
  
  return true;
}

// Check CSS formatting (no root-level indentation)
function checkCssFormatting(css) {
  const lines = css.split('\n');
  let braceDepth = 0;
  let insideAtRule = false;
  let atRuleType = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('/*') || trimmed.startsWith('*/')) {
      continue;
    }
    
    // Track brace depth to detect nested rules
    const openBraces = (line.match(/\{/g) || []).length;
    const closeBraces = (line.match(/\}/g) || []).length;
    const prevBraceDepth = braceDepth;
    braceDepth += openBraces - closeBraces;
    
    // Detect @-rules (media, keyframes, etc.)
    if (trimmed.match(/^@(media|keyframes|import|charset|namespace|page|font-face|supports)/)) {
      insideAtRule = true;
      atRuleType = trimmed.match(/^@(\w+)/)?.[1];
    }
    
    // Only check root-level selectors (when braceDepth is 0 or 1 and we're not inside an @-rule)
    // Root-level means: selectors that start a new rule block at the top level
    if (braceDepth === 0 || (braceDepth === 1 && prevBraceDepth === 0 && !insideAtRule)) {
      // Check if this is a root-level selector (starts with selector character and has opening brace)
      const isRootSelector = /^[a-z#\.:\[*]/.test(trimmed) && trimmed.includes('{');
      
      if (isRootSelector && line.startsWith(' ')) {
        throw new Error(`CSS has root-level indentation at line ${i + 1}: ${line.substring(0, 50)}...`);
      }
    }
    
    // Reset @-rule flag when we exit it (braceDepth returns to 0)
    if (insideAtRule && braceDepth === 0 && prevBraceDepth === 1) {
      insideAtRule = false;
      atRuleType = null;
    }
  }
  
  return true;
}

const indexHtmlPath = path.join(projectRoot, 'index.html');
const scriptsPath = path.join(projectRoot, 'scripts.js');
const stylesPath = path.join(projectRoot, 'styles.css');

const [html, js, css] = await Promise.all([
  fs.readFile(indexHtmlPath, 'utf8'),
  fs.readFile(scriptsPath, 'utf8'),
  fs.readFile(stylesPath, 'utf8'),
]);

// Basic checks
for (const id of requiredHtmlIds) {
  assert(hasId(html, id), `Missing required HTML id="${id}" in index.html`);
}

assert(
  hasNavLink(html, '#ml-basics'),
  'Missing nav link to #ml-basics in index.html',
);

for (const snippet of requiredScriptSnippets) {
  assert(js.includes(snippet), `Missing required snippet in scripts.js: ${snippet}`);
}

// Enhanced checks
console.log('Checking HTML tag matching...');
checkHtmlTags(html);
console.log('✓ HTML tags are properly matched');

console.log('Checking translation key coverage...');
const htmlKeys = extractTranslationKeys(html);
const scriptKeys = extractScriptTranslationKeys(js);

// Check if all HTML translation keys exist in scripts.js
const missingKeys = [];
for (const key of htmlKeys) {
  if (!scriptKeys.has(key)) {
    missingKeys.push(key);
  }
}

if (missingKeys.length > 0) {
  console.warn(`⚠ Warning: ${missingKeys.length} translation keys in HTML not found in scripts.js:`);
  missingKeys.slice(0, 10).forEach(key => console.warn(`  - ${key}`));
  if (missingKeys.length > 10) {
    console.warn(`  ... and ${missingKeys.length - 10} more`);
  }
} else {
  console.log(`✓ All ${htmlKeys.size} translation keys have corresponding entries in scripts.js`);
}

console.log('Checking navigation links...');
checkNavLinks(html);
console.log('✓ All navigation links point to existing sections');

console.log('Checking CSS formatting...');
checkCssFormatting(css);
console.log('✓ CSS formatting is correct (no root-level indentation)');

console.log('\n✅ All verification checks passed!');
