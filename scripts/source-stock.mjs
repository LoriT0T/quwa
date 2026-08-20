#!/usr/bin/env node
/**
 * Stock sourcing via the Openverse API — a licensed aggregator that needs no key,
 * which is why it is the one that can run unattended in this repo. Results are
 * restricted to CC0 and Public Domain Mark so nothing we ship carries a
 * share-alike obligation. Files are downloaded and self-hosted; nothing is hotlinked.
 *
 *   node scripts/source-stock.mjs            # fill every empty stock slot
 *   node scripts/source-stock.mjs home-hero  # one slot
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const MANIFEST = path.join(ROOT, 'assets/manifest.json');
const DOWNLOADS = path.join(ROOT, 'public/images/source');
const API = 'https://api.openverse.org/v1/images/';
/* CC0, PDM and CC BY. BY permits adaptation (we resize and crop) provided we
   attribute, which assets/CREDITS.md does. BY-SA is excluded deliberately: a
   share-alike claim over a resized derivative is an argument we do not need. */
const LICENSES = 'cc0,pdm,by';
const UA = 'quwa-build/1.0 (+https://github.com/LoriT0T/quwa)';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Openverse is anonymous-rate-limited and fronted by Cloudflare, which serves a
 * challenge page (HTML, not JSON) once you trip it. Backing off properly is the
 * difference between filling the remaining slots and being locked out for an hour.
 */
async function getJson(url, attempt = 0) {
  const response = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' } });
  if (response.status === 429 || response.status >= 500) {
    if (attempt >= 4) throw new Error(`Openverse ${response.status} after ${attempt} retries`);
    const wait = Number(response.headers.get('retry-after')) * 1000 || 5000 * 2 ** attempt;
    console.log(`       rate limited (${response.status}), waiting ${Math.round(wait / 1000)}s…`);
    await sleep(wait);
    return getJson(url, attempt + 1);
  }
  if (!response.ok) throw new Error(`Openverse ${response.status}`);
  const text = await response.text();
  if (text.trimStart().startsWith('<')) throw new Error('Openverse returned a challenge page, not JSON');
  return JSON.parse(text);
}

const manifest = JSON.parse(await fs.readFile(MANIFEST, 'utf8'));
const only = process.argv.slice(2);
const LEDGER = path.join(ROOT, 'assets/credits.json');
const ledger = await readJson(LEDGER, {});
const slots = manifest.slots.filter(
  (s) => s.source === 'stock' && (only.length === 0 || only.includes(s.id)),
);

await fs.mkdir(DOWNLOADS, { recursive: true });
const credits = [];

for (const slot of slots) {
  const target = path.join(DOWNLOADS, `${slot.id}.jpg`);
  if (await exists(target)) {
    console.log(`skip   ${slot.id} (already downloaded)`);
    if (ledger[slot.id]) credits.push(ledger[slot.id]);
    continue;
  }

  const [wRatio, hRatio] = slot.ratio.split(':').map(Number);
  const wanted = wRatio / hRatio;
  const queries = Array.isArray(slot.query) ? slot.query : [slot.query];
  /* Openverse full-text search will happily return a scanned 1901 railway journal
     for "weight plates stacked". Requiring a real term overlap with the query is
     the difference between an illustrated page and a wrong one. */
  const terms = queries.join(' ').toLowerCase().split(/\s+/).filter((w) => w.length > 3);
  const relevant = (r) => {
    const haystack = `${r.title ?? ''} ${(r.tags ?? []).map((t) => t.name).join(' ')}`.toLowerCase();
    return terms.some((term) => haystack.includes(term));
  };

  let pick = null;
  try {
    for (const query of queries) {
      for (const minWidth of [slot.width, Math.round(slot.width * 0.75)]) {
        const url = new URL(API);
        url.searchParams.set('q', query);
        url.searchParams.set('license', LICENSES);
        url.searchParams.set('page_size', '40');
        url.searchParams.set('mature', 'false');

        const data = await getJson(url);

        const candidates = (data.results ?? [])
          .filter((r) => r.width >= minWidth && r.height >= Math.round(slot.height * 0.6))
          .filter(relevant)
          .map((r) => ({ ...r, delta: Math.abs(r.width / r.height - wanted) }))
          .sort((a, b) => a.delta - b.delta || b.width - a.width);

        if (candidates[0]) { pick = candidates[0]; break; }
        await sleep(1500);
      }
      if (pick) break;
    }

    if (!pick) {
      console.log(`MISS   ${slot.id} — no relevant result at ${slot.width}px under ${LICENSES}. Slot stays a flagged block.`);
      credits.push({ slot: slot.id, missing: true });
      continue;
    }

    const image = await fetch(pick.url, { headers: { 'User-Agent': UA } });
    if (!image.ok) throw new Error(`download ${image.status}`);
    await fs.writeFile(target, Buffer.from(await image.arrayBuffer()));

    const credit = {
      slot: slot.id,
      title: pick.title,
      creator: pick.creator ?? 'Unknown',
      creatorUrl: pick.creator_url ?? '',
      license: `${pick.license?.toUpperCase()} ${pick.license_version ?? ''}`.trim(),
      licenseUrl: pick.license_url ?? '',
      sourceUrl: pick.foreign_landing_url ?? pick.url,
      provider: pick.provider ?? 'openverse',
      dimensions: `${pick.width}×${pick.height}`,
    };
    ledger[slot.id] = credit;
    credits.push(credit);
    console.log(`OK     ${slot.id} ← ${pick.title} (${pick.license}) ${pick.width}×${pick.height}`);
  } catch (error) {
    console.log(`ERR    ${slot.id}: ${error.message}`);
    credits.push({ slot: slot.id, error: error.message });
  }
}

await fs.writeFile(LEDGER, JSON.stringify(ledger, null, 2) + '\n');
await writeCredits(Object.values(ledger).concat(credits.filter((c) => !c.title)));

async function readJson(file, fallback) {
  try { return JSON.parse(await fs.readFile(file, 'utf8')); } catch { return fallback; }
}

async function exists(p) { try { await fs.access(p); return true; } catch { return false; } }

async function writeCredits(entries) {
  const file = path.join(ROOT, 'assets/CREDITS.md');
  const rows = entries
    .filter((e) => e.title)
    .map((e) => `| \`${e.slot}\` | ${e.title} | ${e.creator} | ${e.license} | [source](${e.sourceUrl}) |`);
  const missing = entries.filter((e) => e.missing || e.error).map((e) => `- \`${e.slot}\` — ${e.error ?? 'no licensed result found'}`);

  const body = `# Image credits

Every photograph here was sourced through the Openverse API under CC0 or Public Domain Mark,
downloaded, and self-hosted. Nothing is hotlinked. Regenerate with \`npm run images:source\`.

Slots marked \`generate\` are produced by \`scripts/generate-images.mjs\` and need no credit.
Slots marked \`shoot\` are blocked and render as flagged flat blocks — see \`docs/SHOT-LIST.md\`.

| Slot | Title | Creator | Licence | Source |
|---|---|---|---|---|
${rows.join('\n') || '| — | — | — | — | — |'}

${missing.length ? `## Unfilled slots\n\n${missing.join('\n')}\n` : ''}
_Last run: ${new Date().toISOString().slice(0, 10)}_
`;
  await fs.writeFile(file, body);
  console.log(`\nWROTE  assets/CREDITS.md (${rows.length} credited, ${missing.length} unfilled)`);
}
