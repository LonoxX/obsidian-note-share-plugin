import { copyFileSync, mkdirSync, existsSync, rmSync } from 'fs';
import { dirname } from 'path';

const buildDir = './build';

// Create/clear build directory
if (existsSync(buildDir)) {
    rmSync(buildDir, { recursive: true, force: true });
}
mkdirSync(buildDir, { recursive: true });

console.log('📦 Copying plugin files to build directory...');

// List of files to copy
const filesToCopy = [
    { src: 'main.js', dest: 'build/main.js' },
    { src: 'manifest.json', dest: 'build/manifest.json' },
    { src: 'styles.css', dest: 'build/styles.css', optional: true }
];

// Copy files
filesToCopy.forEach(({ src, dest, optional = false }) => {
    try {
        if (existsSync(src)) {
            // Create target directory if necessary
            mkdirSync(dirname(dest), { recursive: true });
            copyFileSync(src, dest);
            console.log(`✅ Copied: ${src} → ${dest}`);
        } else if (!optional) {
            console.error(`❌ Required file not found: ${src}`);
            process.exit(1);
        } else {
            console.log(`⚠️  Optional file skipped: ${src}`);
        }
    } catch (error) {
        console.error(`❌ Error copying ${src}:`, error.message);
        process.exit(1);
    }
});

console.log('✅ Plugin build completed successfully!');
console.log(`📁 All files ready in: ${buildDir}/`);
console.log('');
console.log('🚀 To install in Obsidian:');
console.log('   1. Open Obsidian settings');
console.log('   2. Go to Community plugins → Browse');
console.log('   3. Enable "Community plugins" if not already enabled');
console.log('   4. Copy contents of build/ folder to:');
console.log('      Windows: %APPDATA%\\Obsidian\\plugins\\secure-note-share\\');
console.log('      macOS: ~/.obsidian/plugins/secure-note-share/');
console.log('      Linux: ~/.config/obsidian/plugins/secure-note-share/');
console.log('   5. Restart Obsidian or reload plugins');
console.log('   6. Enable "Secure Note Share" in Community plugins');
