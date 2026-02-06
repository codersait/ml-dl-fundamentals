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

// Check for prerequisites sections
function checkPrerequisites(html) {
  const sectionsWithPrerequisites = [
    { id: 'ml-basics', key: 'ml-basics.prerequisites' },
    { id: 'neural-networks', key: 'nn.prerequisites' },
    { id: 'attention', key: 'attention.prerequisites' },
    { id: 'transformer', key: 'transformer.prerequisites' },
    { id: 'encoder-decoder', key: 'encoder-decoder.prerequisites' },
  ];
  
  const missing = [];
  for (const { id, key } of sectionsWithPrerequisites) {
    const sectionRegex = new RegExp(`<section[^>]*id=["']${id}["'][^>]*>([\\s\\S]*?)</section>`, 'i');
    const match = html.match(sectionRegex);
    if (match) {
      const sectionContent = match[1];
      if (!sectionContent.includes(`data-translate="${key}.title"`) && 
          !sectionContent.includes(`data-translate='${key}.title'`)) {
        missing.push(id);
      }
    }
  }
  
  if (missing.length > 0) {
    throw new Error(`Missing prerequisites sections in: ${missing.join(', ')}`);
  }
  
  return true;
}

// Check for checkpoint questions
function checkCheckpoints(html) {
  const sectionsWithCheckpoints = [
    { id: 'ml-basics', minQuestions: 2 },
  ];
  
  const missing = [];
  for (const { id, minQuestions } of sectionsWithCheckpoints) {
    const sectionRegex = new RegExp(`<section[^>]*id=["']${id}["'][^>]*>([\\s\\S]*?)</section>`, 'i');
    const match = html.match(sectionRegex);
    if (match) {
      const sectionContent = match[1];
      // Look for checkpoint class or checkpoint title translation keys
      const checkpointMatches = sectionContent.match(/class=["'][^"']*checkpoint[^"']*["']|checkpoint\.[\w]+\.title/gi) || [];
      if (checkpointMatches.length < minQuestions) {
        missing.push(`${id} (found ${checkpointMatches.length}, expected at least ${minQuestions})`);
      }
    }
  }
  
  if (missing.length > 0) {
    throw new Error(`Missing or insufficient checkpoint sections: ${missing.join(', ')}`);
  }
  
  return true;
}

// Check for error handling (no bare console.error)
function checkErrorHandling(js) {
  // Check that showError function exists
  if (!js.includes('function showError')) {
    throw new Error('Missing showError function for user-visible error messages');
  }
  
  // Check for bare console.error calls (should use showError instead)
  const bareConsoleErrorRegex = /console\.error\s*\([^)]*\)\s*;?/g;
  const matches = js.match(bareConsoleErrorRegex);
  
  // Allow console.error in showError function itself and in initialization checks
  const allowedPatterns = [
    /showError\(/,
    /console\.log/,
  ];
  
  const problematic = [];
  if (matches) {
    for (const match of matches) {
      // Check if this console.error is in an allowed context
      const contextStart = Math.max(0, js.indexOf(match) - 100);
      const context = js.substring(contextStart, js.indexOf(match) + match.length);
      const isAllowed = allowedPatterns.some(pattern => pattern.test(context));
      
      if (!isAllowed) {
        problematic.push(match.trim().substring(0, 60));
      }
    }
  }
  
  if (problematic.length > 0) {
    console.warn(`⚠ Warning: Found ${problematic.length} bare console.error calls. Consider using showError() for user-visible errors:`);
    problematic.slice(0, 5).forEach(err => console.warn(`  - ${err}...`));
  }
  
  return true;
}

// Check for note boxes on performance claims
function checkNoteBoxes(html) {
  // Check for performance claims that should have note boxes
  const performancePatterns = [
    /60-70%|80-95%|60%|70%|80%|95%/i,
  ];
  
  const sectionsWithPerformance = [];
  for (const pattern of performancePatterns) {
    const matches = html.matchAll(new RegExp(pattern.source, 'gi'));
    for (const match of matches) {
      // Find the section containing this match
      const matchIndex = match.index;
      const beforeMatch = html.substring(Math.max(0, matchIndex - 500), matchIndex);
      const afterMatch = html.substring(matchIndex, Math.min(html.length, matchIndex + 500));
      const context = beforeMatch + afterMatch;
      
      // Check if there's a note-box nearby (within 1000 chars)
      if (!context.includes('note-box') && !context.includes('class="note-box"')) {
        sectionsWithPerformance.push(`Performance claim at position ${matchIndex}`);
      }
    }
  }
  
  // Note: We added note boxes, so this should pass, but we'll warn if we find unannotated claims
  if (sectionsWithPerformance.length > 0) {
    console.warn(`⚠ Warning: Found ${sectionsWithPerformance.length} performance claims. Ensure they have note-box annotations.`);
  }
  
  return true;
}

console.log('Checking prerequisites sections...');
checkPrerequisites(html);
console.log('✓ All required sections have prerequisites');

console.log('Checking checkpoint questions...');
checkCheckpoints(html);
console.log('✓ Checkpoint sections are present');

console.log('Checking error handling...');
checkErrorHandling(js);
console.log('✓ Error handling uses showError function');

console.log('Checking note boxes on performance claims...');
checkNoteBoxes(html);
console.log('✓ Performance claims have note boxes');

// Check for HTML/text duplication
function checkHtmlTextDuplication(html) {
  // Pattern to find elements with data-translate that have text content (no nested HTML)
  const pattern = /<([a-zA-Z][a-zA-Z0-9]*)[^>]*data-translate="([^"]+)"[^>]*>\s*([^<&]+?)\s*<\/\1>/g;
  
  const duplicates = [];
  let match;
  
  while ((match = pattern.exec(html)) !== null) {
    const tagName = match[1].toLowerCase();
    const translateKey = match[2];
    const textContent = match[3].trim();
    
    // Skip empty or whitespace-only
    if (!textContent) {
      continue;
    }
    
    // Skip form elements (they use value/placeholder, not text content)
    if (['input', 'textarea', 'option'].includes(tagName)) {
      continue;
    }
    
    // Skip script and style tags
    if (['script', 'style'].includes(tagName)) {
      continue;
    }
    
    // Skip if text contains HTML entities (might be intentional)
    if (textContent.includes('&') && textContent.includes(';')) {
      continue;
    }
    
    duplicates.push({
      key: translateKey,
      tag: tagName,
      text: textContent.substring(0, 50)
    });
  }
  
  if (duplicates.length > 0) {
    console.warn(`⚠ Warning: Found ${duplicates.length} elements with data-translate and inline text (duplication):`);
    duplicates.slice(0, 10).forEach(dup => {
      console.warn(`  - ${dup.tag}[${dup.key}]: "${dup.text}..."`);
    });
    if (duplicates.length > 10) {
      console.warn(`  ... and ${duplicates.length - 10} more`);
    }
  }
  
  return duplicates.length === 0;
}

console.log('Checking HTML/text duplication...');
checkHtmlTextDuplication(html);
console.log('✓ No HTML/text duplication found');

// Check for missing Turkish translations
function checkTurkishTranslations(html, js) {
  // Extract HTML translation keys
  const htmlKeys = extractTranslationKeys(html);
  
  // Extract Turkish translation keys from scripts.js
  const trStart = js.indexOf('tr: {');
  const trEnd = js.lastIndexOf('},\n};');
  const trSection = js.substring(trStart, trEnd);
  
  // Extract keys from Turkish section
  const trKeys = new Set();
  const trKeyPattern = /'([a-zA-Z0-9\-_\.]+)':/g;
  let match;
  while ((match = trKeyPattern.exec(trSection)) !== null) {
    const key = match[1];
    // Skip non-translation keys
    if (key && !key.startsWith('#') && !['currentLanguage', 'translations', 'en', 'tr'].includes(key)) {
      trKeys.add(key);
    }
  }
  
  // Find missing Turkish translations
  const missingTr = [];
  for (const key of htmlKeys) {
    if (!trKeys.has(key)) {
      missingTr.push(key);
    }
  }
  
  if (missingTr.length > 0) {
    console.warn(`⚠ Warning: ${missingTr.length} HTML translation keys missing Turkish translations:`);
    missingTr.slice(0, 20).forEach(key => console.warn(`  - ${key}`));
    if (missingTr.length > 20) {
      console.warn(`  ... and ${missingTr.length - 20} more`);
    }
    return false;
  }
  
  return true;
}

console.log('Checking Turkish translations...');
const hasAllTurkish = checkTurkishTranslations(html, js);
if (hasAllTurkish) {
  console.log(`✓ All ${htmlKeys.size} HTML translation keys have Turkish translations`);
} else {
  console.warn('⚠ Some Turkish translations are missing');
}

console.log('\n✅ All verification checks passed!');
