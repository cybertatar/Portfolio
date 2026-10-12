/**
 * No hanging prepositions, in Russian and in English: the space after a preposition, a
 * conjunction, an article or another function word becomes a non-breaking one, so the word
 * moves to the next line together with the word it belongs to. Numbers stay with what they
 * count ("12 шагов"), a dash never starts a line, particles (же, ли, бы) never start one either.
 * Only function words, not every short word: chains like "how to do it and how to see" glued
 * whole would not fit a phone. Runs over the whole page in src/middleware.ts: text, and the
 * data-* attributes scripts put on screen (data-en, race captions, typed lines).
 */

const NBSP = '\u00A0';
/** A tag between two pieces of text, and a space that sits alone between two tags. */
const TAG = '\u0000';
const LONE = '\u0002';

/** Russian: any word of one or two letters (в, на, и, не, мы…), and these longer ones. */
const RU = [
  'без',
  'для',
  'над',
  'под',
  'при',
  'про',
  'обо',
  'изо',
  'ото',
  'что',
  'как',
  'или',
  'чем',
  'где',
  'через',
  'перед',
  'после',
  'около',
  'между',
  'вместо',
  'среди',
  'кроме',
  'возле',
  'вокруг',
  'против',
];
/** English: articles, prepositions, conjunctions, I and possessives. */
const EN = [
  'a',
  'an',
  'the',
  'i',
  'to',
  'of',
  'in',
  'on',
  'at',
  'by',
  'for',
  'per',
  'via',
  'and',
  'or',
  'but',
  'nor',
  'as',
  'if',
  'so',
  'no',
  'not',
  'my',
  'our',
  'its',
  'your',
  'their',
  'with',
  'from',
  'into',
  'onto',
  'over',
  'upon',
  'than',
  'about',
  'after',
  'before',
  'under',
  'without',
];
const WORDS = `\\p{Script=Cyrillic}{1,2}|${[...RU, ...EN].join('|')}`;

// A gap: spaces, maybe across tags. Only plain spaces are rewritten.
const GAP = `([ \\t\\n\\r${TAG}${LONE}]*[ \\t\\n\\r${LONE}][ \\t\\n\\r${TAG}${LONE}]*)`;
const SHORT = new RegExp(
  `(?<![\\p{L}\\p{N}&#'’\\-])(${WORDS})${GAP}(?=[^\\s${TAG}${LONE}])`,
  'giu',
);
const NUMBER = new RegExp(`(?<![\\p{L}\\p{N}])(\\p{N}[\\p{N},.:/%]*)${GAP}(?=\\p{L})`, 'gu');
const DASH = new RegExp(`(?<=[^\\s${TAG}${LONE}])${GAP}(?=[—–][\\s${TAG}${LONE}])`, 'gu');
const PARTICLE = new RegExp(
  `(?<=[^\\s${TAG}${LONE}])${GAP}(?=(?:же|ли|ль|бы|б)(?![\\p{L}\\p{N}]))`,
  'giu',
);

/** One non-breaking space for the gap, keeping its tags. A space alone between two tags can't
 *  be told from layout whitespace (a flex gap), so a gap with one is left as it is. */
function bind(gap: string) {
  if (gap.includes(LONE)) return gap;
  let done = false;
  return gap.replace(/[ \t\n\r]+/g, () => (done ? '' : ((done = true), NBSP)));
}

/** Plain text, or a run of inline text joined with TAG. */
export function typographText(text: string) {
  return text
    .replace(SHORT, (_, word: string, gap: string) => word + bind(gap))
    .replace(NUMBER, (_, num: string, gap: string) => num + bind(gap))
    .replace(DASH, (gap: string) => bind(gap))
    .replace(PARTICLE, (gap: string) => bind(gap));
}

const INLINE = new Set([
  'a',
  'abbr',
  'b',
  'bdi',
  'cite',
  'em',
  'i',
  'kbd',
  'mark',
  'q',
  's',
  'small',
  'span',
  'strong',
  'sub',
  'sup',
  'time',
  'u',
]);
const RAW = new Set(['script', 'style', 'svg', 'pre', 'code', 'textarea', 'template']);

const decode = (s: string) =>
  s
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
const encode = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

/** data-* attributes with text a script shows (data-en, captions, typed lines). */
function typographTag(tag: string) {
  return tag.replace(
    /(\sdata-[\w-]+=")([^"]*)(")/g,
    (all, start: string, value: string, end: string) =>
      /\s/.test(value) ? start + encode(typographText(decode(value))) + end : all,
  );
}

export function typograph(html: string) {
  const tokens = html.match(/<!--[\s\S]*?-->|<[^>]*>|[^<]+|</g) ?? [];
  const out: string[] = [];
  // Indices in `out` of the text pieces of the current run of inline text
  let run: number[] = [];
  let raw = '';

  const flush = () => {
    if (!run.length) return;
    const joined = run
      .map((i) => (/^\s+$/.test(out[i]) ? out[i].replace(/\s/g, LONE) : out[i]))
      .join(TAG);
    const parts = typographText(joined).split(TAG);
    run.forEach((i, k) => {
      out[i] = /^\s+$/.test(out[i]) ? out[i] : parts[k];
    });
    run = [];
  };

  for (const t of tokens) {
    if (raw) {
      out.push(t);
      if (new RegExp(`^</${raw}\\s*>$`, 'i').test(t)) raw = '';
      continue;
    }
    if (t.startsWith('<!') || t.startsWith('<?')) {
      out.push(t);
      continue;
    }
    const tag = /^<(\/?)([a-zA-Z][\w-]*)/.exec(t);
    if (tag) {
      const name = tag[2].toLowerCase();
      if (!INLINE.has(name)) flush();
      if (!tag[1] && RAW.has(name) && !t.endsWith('/>')) raw = name;
      // Pieces of text on both sides of an inline tag stay in one run, joined by TAG
      out.push(typographTag(t));
      continue;
    }
    out.push(t);
    run.push(out.length - 1);
  }
  flush();
  return out.join('');
}
