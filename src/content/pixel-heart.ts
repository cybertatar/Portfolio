/** The heart container shared by the results HUD and the quest log: 9×8 pixels. */
const HEART = [
  '.RR...RR.',
  'RrrR.RrrR',
  'RqrrRrrrR',
  'RqrrrrrrR',
  '.RrrrrrR.',
  '..RrrrR..',
  '...RrR...',
  '....R....',
];

/** One SVG path per shade (R edge, r fill, q shine), so a heart is three elements, not dozens. */
export const heartPaths: { c: string; d: string }[] = (() => {
  const d: Record<string, string> = {};
  HEART.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      let end = x + 1;
      while (end < row.length && row[end] === row[x]) end++;
      const c = row[x];
      if (c !== '.') d[c] = (d[c] ?? '') + `M${x} ${y}h${end - x}v1h-${end - x}z`;
      x = end;
    }
  });
  return Object.entries(d).map(([c, path]) => ({ c, d: path }));
})();
