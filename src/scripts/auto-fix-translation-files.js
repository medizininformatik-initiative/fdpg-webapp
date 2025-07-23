const fs = require('fs');
const path = require('path');

// Recursively process all string values in the object
function fixStringValues(obj) {
  if (typeof obj === 'string') {
    // Escape invalid control characters except \n and \t
    let fixed = obj.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');
    // Replace all @ with ' (at) '
    fixed = fixed.replace(/@/g, ' (at) ');
    return fixed;
  } else if (Array.isArray(obj)) {
    return obj.map(fixStringValues);
  } else if (typeof obj === 'object' && obj !== null) {
    for (const key in obj) {
      obj[key] = fixStringValues(obj[key]);
    }
    return obj;
  }
  return obj;
}

function fixTranslationFile(filePath) {
  try {
    console.log(`\n🔍 Processing: ${path.basename(filePath)}`);
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    // Parse JSON
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      console.error(`  ❌ JSON parse error: ${e.message}`);
      return false;
    }

    // Fix all string values
    const fixed = fixStringValues(parsed);
    fs.writeFileSync(filePath, JSON.stringify(fixed, null, 2), 'utf8');
    console.log(`  💾 Processed and saved: ${path.basename(filePath)}`);
    return true;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Main execution
const translationDir = path.join(__dirname, '../locales');
const files = ['en.json', 'de.json'];

console.log('🚀 Translation File Fixer (escape invalid chars, replace @ with (at))\n');
let allFixed = true;
files.forEach(file => {
  const filePath = path.join(translationDir, file);
  if (fs.existsSync(filePath)) {
    const result = fixTranslationFile(filePath);
    if (!result) allFixed = false;
  } else {
    console.log(`❌ File not found: ${file}`);
    allFixed = false;
  }
});

if (allFixed) {
  console.log('\n✅ All files processed successfully!');
  console.log('🎉 All invalid chars escaped and @ replaced with (at) in JSON');
} else {
  console.log('\n❌ Some files could not be processed.');
}
