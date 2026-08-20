#!/usr/bin/env node
/**
 * Stock sourcing from licensed APIs. Two providers, tried in order:
 *
 *   wikimedia  Wikimedia Commons. No key, generous limits, and every file carries
 *              machine-readable licence and author metadata. This is the default.
 *   openverse  The Openverse aggregator. Now returns 401 to unauthenticated
 *              clients, so it only runs when OPENVERSE_TOKEN is set.
 *
 * Licences are restricted to public domain, CC0 and CC BY. CC BY-SA is excluded
 * deliberately: we resize and crop, and a share-alike claim over a derivative is
 * an argument a commercial storefront does not need.
 *
 * Files are downloaded and self-hosted. Nothing is hotlinked. Attribution is
 * written to assets/CREDITS.md and kept in assets/credits.json across runs.
 *
 *   node scripts/source-stock.mjs               # fill every empty stock slot
 *   node scripts/source-stock.mjs home-hero     # one slot
 *   node scripts/source-stock.mjs --refresh     # re-source even if a file exists
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const MANIFEST = path.join(ROOT, 'assets/manifest.json');
const LEDGER = path.join(ROOT, 'assets/credits.json');
const DOWNLOADS = path.join(ROOT, 'public/images/source');
const UA = 'quwa-build/1.0 (https://github.com/LoriT0T/quwa; build script)';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const OK_LICENCES = /^(cc0|pd|public domain|cc by [0-9.]+|attribution)/i;
const BAD_LICENCES = /(share.?alike|sa\b|nc\b|nd\b|non.?commercial|fair use)/i;

/**
 * Commons is a catalogue as much as a photo library, so a search for "salad bowl"
 * returns a 1987 museum accession of a ceramic bowl, and "rice bowl" returns a
 * Japanese plastic food display. These patterns are what separates a photograph
 * of the thing from a catalogue record about the thing.
 */
const REJECT = new RegExp([
  '\\b[A-Z]{2}\\s?\\d{4}[.\\-]\\d',      // accession numbers: AM 1987.404-4
  'museum', 'collection of', 'accession', 'replica', 'plastic food', 'food model',
  'display case', 'ceramic', 'porcelain', 'earthenware', 'pottery', 'artefact', 'artifact',
  'painting', 'drawing', 'engraving', 'lithograph', 'woodcut', 'illustration from',
  'page of', 'plate from', 'title page', 'coat of arms', 'logo', 'diagram', 'map of',
  'stamp', 'coin', 'banknote', 'sculpture', 'statue',
].join('|'), 'i');

/* ── Wikimedia Commons ─────────────────────────────────────────────────────── */

async function searchWikimedia(query, minWidth) {
  const url = new URL('https://commons.wikimedia.org/w/api.php');
  url.search = new URLSearchParams({
    action: 'query', format: 'json', formatversion: '2',
    generator: 'search',
    gsrsearch: `filetype:bitmap ${query}`,
    gsrnamespace: '6', gsrlimit: '40',
    prop: 'imageinfo',
    iiprop: 'url|size|extmetadata',
    iiurlwidth: String(Math.max(minWidth, 1600)),
  }).toString();

  const response = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' } });
  if (!response.ok) throw new Error(`Wikimedia ${response.status}`);
  const data = await response.json();

  return (data.query?.pages ?? [])
    .map((page) => {
      const info = page.imageinfo?.[0];
      if (!info) return null;
      const meta = info.extmetadata ?? {};
      const licence = strip(meta.LicenseShortName?.value ?? meta.License?.value ?? '');
      return {
        title: page.title.replace(/^File:/, '').replace(/\.\w+$/, ''),
        downloadUrl: info.thumburl ?? info.url,
        width: info.thumbwidth ?? info.width,
        height: info.thumbheight ?? info.height,
        fullWidth: info.width,
        fullHeight: info.height,
        licence,
        licenceUrl: meta.LicenseUrl?.value ?? '',
        creator: strip(meta.Artist?.value ?? 'Unknown'),
        sourceUrl: info.descriptionurl,
        provider: 'Wikimedia Commons',
        categories: strip(meta.Categories?.value ?? ''),
      };
    })
    .filter(Boolean)
    .filter((r) => OK_LICENCES.test(r.licence) && !BAD_LICENCES.test(r.licence))
    .filter((r) => r.fullWidth >= minWidth);
}

/* ── Openverse (only with a token) ─────────────────────────────────────────── */

async function searchOpenverse(query, minWidth) {
  const token = process.env.OPENVERSE_TOKEN;
  if (!token) return [];
  const url = new URL('https://api.openverse.org/v1/images/');
  url.search = new URLSearchParams({
    q: query, license: 'cc0,pdm,by', page_size: '40', mature: 'false',
  }).toString();
  const response = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: 'application/json', authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error(`Openverse ${response.status}`);
  const data = await response.json();
  return (data.results ?? [])
    .filter((r) => r.width >= minWidth)
    .map((r) => ({
      title: r.title, downloadUrl: r.url, width: r.width, height: r.height,
      fullWidth: r.width, fullHeight: r.height,
      licence: `${r.license?.toUpperCase()} ${r.license_version ?? ''}`.trim(),
      licenceUrl: r.license_url ?? '', creator: r.creator ?? 'Unknown',
      sourceUrl: r.foreign_landing_url ?? r.url, provider: r.provider ?? 'Openverse',
      categories: (r.tags ?? []).map((t) => t.name).join(' '),
    }));
}

const PROVIDERS = [searchWikimedia, searchOpenverse];

/* ── Run ───────────────────────────────────────────────────────────────────── */

const args = process.argv.slice(2);
const refresh = args.includes('--refresh');
const only = args.filter((a) => !a.startsWith('--'));

const manifest = JSON.parse(await fs.readFile(MANIFEST, 'utf8'));
const ledger = await readJson(LEDGER, {});
await fs.mkdir(DOWNLOADS, { recursive: true });

const slots = manifest.slots.filter(
  (s) => s.source === 'stock' && !s.blocked && (only.length === 0 || only.includes(s.id)),
);

for (const slot of slots) {
  const target = path.join(DOWNLOADS, `${slot.id}.jpg`);
  if (!refresh && (await exists(target)) && ledger[slot.id]) {
    console.log(`skip   ${slot.id} (have file + credit)`);
    continue;
  }

  const [wRatio, hRatio] = slot.ratio.split(':').map(Number);
  const wanted = wRatio / hRatio;
  const queries = Array.isArray(slot.query) ? slot.query : [slot.query];
  /* Full-text image search will happily return a scanned 1901 railway journal for
     "weight plates stacked". Requiring a real term overlap is the difference
     between an illustrated page and a wrong one. */
  const terms = queries.join(' ').toLowerCase().split(/\s+/).filter((w) => w.length > 3);
  const relevant = (r) => {
    const haystack = `${r.title} ${r.categories}`.toLowerCase();
    return terms.some((t) => haystack.includes(t));
  };

  let pick = null;
  outer: for (const search of PROVIDERS) {
    for (const query of queries) {
      try {
        const found = await search(query, Math.round(slot.width * 0.9));
        const ranked = found
          .filter(relevant)
          .map((r) => ({ ...r, delta: Math.abs(r.fullWidth / r.fullHeight - wanted) }))
          // Prefer the right shape, then the bigger file — a heavy crop of a
          // wrongly-shaped photo loses the composition the slot was specified for.
          .sort((a, b) => a.delta - b.delta || b.fullWidth - a.fullWidth);
        if (ranked[0]) { pick = ranked[0]; break outer; }
      } catch (error) {
        console.log(`       ${search.name} "${query}": ${error.message}`);
      }
      await sleep(400);
    }
  }

  if (!pick) {
    console.log(`MISS   ${slot.id} — no licensed, relevant result. Slot stays a flagged block.`);
    continue;
  }

  try {
    const image = await fetch(pick.downloadUrl, { headers: { 'User-Agent': UA } });
    if (!image.ok) throw new Error(`download ${image.status}`);
    const buffer = Buffer.from(await image.arrayBuffer());
    if (buffer.length < 20000) throw new Error(`suspiciously small (${buffer.length} bytes)`);
    await fs.writeFile(target, buffer);

    ledger[slot.id] = {
      slot: slot.id, title: pick.title, creator: pick.creator, licence: pick.licence,
      licenceUrl: pick.licenceUrl, sourceUrl: pick.sourceUrl, provider: pick.provider,
      dimensions: `${pick.fullWidth}×${pick.fullHeight}`,
    };
    console.log(`OK     ${slot.id} ← "${pick.title.slice(0, 46)}" (${pick.licence}) ${pick.fullWidth}×${pick.fullHeight}`);
  } catch (error) {
    console.log(`ERR    ${slot.id}: ${error.message}`);
  }
  await sleep(500);
}

await fs.writeFile(LEDGER, JSON.stringify(ledger, null, 2) + '\n');
await writeCredits(manifest, ledger);

async function readJson(file, fallback) {
  try { return JSON.parse(await fs.readFile(file, 'utf8')); } catch { return fallback; }
}
async function exists(p) { try { await fs.access(p); return true; } catch { return false; } }
function strip(html) {
  return String(html).replace(/<[^>]*>/g, ' ').replace(/&[a-z]+;/gi, ' ').replace(/\s+/g, ' ').trim().slice(0, 90);
}

async function writeCredits(manifest, ledger) {
  const stockSlots = manifest.slots.filter((s) => s.source === 'stock');
  const rows = stockSlots
    .filter((s) => ledger[s.id])
    .map((s) => {
      const c = ledger[s.id];
      return `| \`${s.id}\` | ${c.title} | ${c.creator} | ${c.licence} | ${c.provider} | [source](${c.sourceUrl}) |`;
    });
  const unfilled = stockSlots.filter((s) => !ledger[s.id]).map((s) => `- \`${s.id}\` — no licensed, relevant result. Renders as a flagged flat block at ${s.ratio}.`);
  const blocked = manifest.slots.filter((s) => s.blocked).map((s) => `- \`${s.id}\` — ${s.why}`);

  const body = `# Image credits

Every photograph shipped here was found through a licensed API, downloaded, and
self-hosted. Nothing is hotlinked. Licences are limited to public domain, CC0 and
CC BY; CC BY-SA is excluded because we crop and resize.

Regenerate with \`npm run images:source\`, then \`npm run images:optimize\`.

Slots marked \`generate\` in \`assets/manifest.json\` are produced by
\`scripts/generate-images.mjs\` and need no attribution.

| Slot | Title | Creator | Licence | Provider | Source |
|---|---|---|---|---|---|
${rows.join('\n') || '| — | — | — | — | — | — |'}

${unfilled.length ? `## Unfilled stock slots\n\nThese render as neutral blocks at the correct ratio, so there is no layout shift —\nbut they are placeholders and should be filled before launch.\n\n${unfilled.join('\n')}\n` : ''}
${blocked.length ? `## Blocked slots — shoot required\n\n${blocked.join('\n')}\n\nBrief: [docs/SHOT-LIST.md](../docs/SHOT-LIST.md)\n` : ''}
_Last run: ${new Date().toISOString().slice(0, 10)}_
`;
  await fs.writeFile(path.join(ROOT, 'assets/CREDITS.md'), body);
  console.log(`\nWROTE  assets/CREDITS.md — ${rows.length} credited, ${unfilled.length} unfilled, ${blocked.length} blocked`);
}
