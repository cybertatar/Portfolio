import fs from 'node:fs';
import path from 'node:path';
import { outDir, project } from './vite.config.mjs';

// Vite's library build inlines everything into style.css. The app's styles go into the
// shadow root (style-data.js), but @font-face is ignored there, so the fonts are written
// out as files and declared on the page itself (fonts.css). The images come from PSB/public.
const cssFile = path.join(outDir, 'style.css');
let css = fs.readFileSync(cssFile, 'utf8');

const faces = [];
css = css.replace(/@font-face\{[^}]*\}/g, (face) => {
  const n = faces.length;
  fs.mkdirSync(path.join(outDir, 'fonts'), { recursive: true });
  faces.push(
    face.replace(/url\(data:font\/woff2;base64,([^)]*)\)/, (_, data) => {
      fs.writeFileSync(path.join(outDir, `fonts/onest-${n}.woff2`), Buffer.from(data, 'base64'));
      return `url(fonts/onest-${n}.woff2)`;
    }),
  );
  return '';
});
fs.writeFileSync(path.join(outDir, 'fonts.css'), faces.join('\n') + '\n');

css = css.replace(/:root(?=[\s,{])/g, ':host');
fs.writeFileSync(
  path.join(outDir, 'style-data.js'),
  `window.__psbPortfolioCss=${JSON.stringify(css)};\n`,
);
fs.rmSync(cssFile);

fs.cpSync(path.join(project, 'public/figma'), path.join(outDir, 'figma'), { recursive: true });
