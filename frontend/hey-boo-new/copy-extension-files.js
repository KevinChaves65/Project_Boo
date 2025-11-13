import fs from 'fs';
import path from 'path';

// Function to copy a file
function copyFile(src, dest) {
  try {
    fs.copyFileSync(src, dest);
    console.log(`✓ Copied ${path.basename(src)} to dist/`);
  } catch (error) {
    console.error(`✗ Failed to copy ${path.basename(src)}:`, error.message);
  }
}

// Function to copy a directory recursively
function copyDir(src, dest) {
  try {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    
    const files = fs.readdirSync(src);
    files.forEach(file => {
      const srcPath = path.join(src, file);
      const destPath = path.join(dest, file);
      
      if (fs.statSync(srcPath).isDirectory()) {
        copyDir(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    });
    
    console.log(`✓ Copied directory ${path.basename(src)}/ to dist/`);
  } catch (error) {
    console.error(`✗ Failed to copy directory ${path.basename(src)}:`, error.message);
  }
}

console.log('📦 Copying Chrome extension files...');

// Copy manifest.json
copyFile('public/manifest.json', 'dist/manifest.json');

// Copy background script
copyFile('public/background.js', 'dist/background.js');

// Copy content script
copyFile('public/content.js', 'dist/content.js');

// Copy content CSS if exists
if (fs.existsSync('public/content.css')) {
  copyFile('public/content.css', 'dist/content.css');
}

// Copy icons directory
if (fs.existsSync('public/icons')) {
  copyDir('public/icons', 'dist/icons');
} else {
  console.log('⚠️  Icons directory not found. Please add extension icons to public/icons/');
}

// Copy images directory
if (fs.existsSync('public/images')) {
  copyDir('public/images', 'dist/images');
} else {
  console.log('⚠️  Images directory not found. Creating placeholder...');
  fs.mkdirSync('dist/images', { recursive: true });
}

console.log('✅ Extension files copied successfully!');
console.log('');
console.log('📁 Your extension is ready in the dist/ folder');
console.log('🚀 To install: Open chrome://extensions/, enable Developer mode, and click "Load unpacked"');