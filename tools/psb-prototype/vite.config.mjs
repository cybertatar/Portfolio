import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';

// Builds the clickable PSB prototype into one script for the case page. The app itself
// lives in the PSB repo (github.com/gremten/psb); point PSB_DIR at its checkout.
const root = path.dirname(fileURLToPath(import.meta.url));
export const project = path.resolve(process.env.PSB_DIR || path.join(root, '../../../PSB'));
const modules = path.join(root, 'node_modules');
const shim = path.join(root, 'src', 'shims');
export const outDir = path.resolve(root, '../../public/assets/cases/psb/live');

const portfolioViewport = {
  name: 'portfolio-viewport-adapter',
  enforce: 'pre',
  transform(source, id) {
    if (
      !id.includes('/src/app/(participant)/page.tsx') &&
      !id.includes('/src/app/(participant)/cashback/page.tsx')
    )
      return null;
    return source
      .replaceAll(
        'document.querySelector<HTMLElement>(".participant-phone")',
        'window.__psbPortfolioViewport?.() ?? null',
      )
      .replaceAll('window.location.search', 'window.__psbPortfolioSearch?.() ?? ""');
  },
};

export default {
  root,
  publicDir: false,
  plugins: [portfolioViewport, react()],
  define: { 'process.env.NODE_ENV': JSON.stringify('production') },
  resolve: {
    alias: [
      { find: 'next/image', replacement: path.join(shim, 'image.tsx') },
      { find: 'next/link', replacement: path.join(shim, 'link.tsx') },
      { find: 'next/navigation', replacement: path.join(shim, 'navigation.tsx') },
      { find: '@samasante/liquid-glass', replacement: path.join(shim, 'glass.tsx') },
      {
        find: '@/features/usability/participant-provider',
        replacement: path.join(shim, 'participant-provider.tsx'),
      },
      {
        find: '@/features/usability/demo-feedback',
        replacement: path.join(shim, 'demo-feedback.ts'),
      },
      { find: '@/lib/testing/tracking', replacement: path.join(shim, 'tracking.ts') },
      { find: /^@routes\//, replacement: path.join(project, 'src/app/(participant)') + '/' },
      { find: /^@\//, replacement: path.join(project, 'src') + '/' },
      { find: /^react$/, replacement: path.join(modules, 'react') },
      { find: /^react-dom$/, replacement: path.join(modules, 'react-dom') },
      { find: /^react-dom\//, replacement: path.join(modules, 'react-dom') + '/' },
      { find: /^react\//, replacement: path.join(modules, 'react') + '/' },
      {
        find: /^@fontsource-variable\//,
        replacement: path.join(modules, '@fontsource-variable') + '/',
      },
    ],
  },
  build: {
    outDir,
    emptyOutDir: true,
    cssCodeSplit: false,
    lib: {
      entry: path.join(root, 'src/main.tsx'),
      name: 'PSBPortfolio',
      formats: ['iife'],
      fileName: () => 'app.js',
      cssFileName: 'style',
    },
  },
};
