import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { resolve } from 'path';
import { cpSync, mkdirSync, existsSync, readFileSync, writeFileSync } from 'fs';

// Custom plugin to copy extension files and fix paths after build
function copyExtensionFiles() {
  return {
    name: 'copy-extension-files',
    closeBundle() {
      const dist = resolve(__dirname, 'dist');

      // Copy manifest.json
      cpSync(resolve(__dirname, 'manifest.json'), resolve(dist, 'manifest.json'));

      // Copy icons
      const iconsDir = resolve(dist, 'assets', 'icons');
      if (!existsSync(iconsDir)) mkdirSync(iconsDir, { recursive: true });
      const srcIcons = resolve(__dirname, 'src', 'assets', 'icons');
      if (existsSync(srcIcons)) {
        cpSync(srcIcons, iconsDir, { recursive: true });
      }

      // Move HTML files to correct paths and fix asset references
      // Vite outputs them at dist/src/panel/ and dist/src/popup/
      // We need them at dist/panel/ and dist/popup/
      const htmlMoves = [
        { src: 'src/panel/index.html', dest: 'panel/index.html' },
        { src: 'src/popup/popup.html', dest: 'popup/popup.html' },
      ];

      for (const { src, dest } of htmlMoves) {
        const srcPath = resolve(dist, src);
        const destDir = resolve(dist, dest.split('/')[0]);
        const destPath = resolve(dist, dest);

        if (existsSync(srcPath)) {
          if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true });
          // Read, fix paths (../../assets/ -> ../assets/), write
          let html = readFileSync(srcPath, 'utf-8');
          html = html.replace(/\.\.\/\.\.\/assets\//g, '../assets/');
          writeFileSync(destPath, html);
        }
      }
    }
  };
}

export default defineConfig({
  plugins: [preact(), copyExtensionFiles()],
  base: './',
  build: {
    rollupOptions: {
      input: {
        content: resolve(__dirname, 'src/content/index.js'),
        background: resolve(__dirname, 'src/background/service-worker.js'),
        panel: resolve(__dirname, 'src/panel/index.html'),
        popup: resolve(__dirname, 'src/popup/popup.html'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'content') return 'content.js';
          if (chunkInfo.name === 'background') return 'service-worker.js';
          return 'assets/[name]-[hash].js';
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2020',
    minify: false,
  },
  resolve: {
    alias: {
      'react': 'preact/compat',
      'react-dom': 'preact/compat'
    }
  }
});
