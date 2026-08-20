import { chromium } from 'playwright';
import fs from 'node:fs';
import { createRequire } from 'node:module';
const sharp = createRequire(import.meta.url)('../node_modules/sharp');

const OUT = '../out/comparison';
fs.mkdirSync(OUT, { recursive: true });
const LIVE = 'https://lorit0t.github.io/quwa';

const PAIRS = [
  { id: 'home', ours: `${LIVE}/en`, oursAr: `${LIVE}/ar`, ref: '../out/reference/jeffnippard-{vp}.png', refName: 'jeffnippard.com' },
  { id: 'product', ours: `${LIVE}/en/programs/hypertrophy-foundations`, oursAr: `${LIVE}/ar/programs/hypertrophy-foundations`, ref: '../out/reference/bodyboost-{vp}.png', refName: 'bodyboost.rmz.gg' },
];
const VPS = [{ id: 'desktop', w: 1440, h: 900 }, { id: 'mobile', w: 390, h: 844 }];

const browser = await chromium.launch();
for (const pair of PAIRS) {
  for (const vp of VPS) {
    const shots = [];
    for (const [label, url] of [['QUWA en', pair.ours], ['QUWA ar', pair.oursAr]]) {
      const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, isMobile: vp.id === 'mobile', deviceScaleFactor: 1 });
      const p = await ctx.newPage();
      await p.goto(url, { waitUntil: 'networkidle' });
      await p.waitForTimeout(1200);
      shots.push({ label, buf: await p.screenshot({ fullPage: true }) });
      await ctx.close();
    }
    const refPath = pair.ref.replace('{vp}', vp.id);
    if (fs.existsSync(refPath)) shots.push({ label: pair.refName, buf: fs.readFileSync(refPath) });

    // Normalise to equal width and a shared cap height so the pacing is comparable.
    const colW = vp.id === 'desktop' ? 620 : 390;
    const capH = 3400;
    const tiles = [];
    for (const s of shots) {
      const meta = await sharp(s.buf).metadata();
      const scale = colW / meta.width;
      const resized = await sharp(s.buf).resize({ width: colW }).extract({
        left: 0, top: 0, width: colW, height: Math.min(capH, Math.round(meta.height * scale)),
      }).jpeg({ quality: 76 }).toBuffer();
      tiles.push({ ...s, buf: resized, h: Math.min(capH, Math.round(meta.height * scale)), fullH: meta.height });
    }
    const H = Math.max(...tiles.map((t) => t.h)) + 34;
    const W = colW * tiles.length + 12 * (tiles.length - 1);
    const labels = tiles.map((t, i) => ({
      input: Buffer.from(`<svg width="${colW}" height="30"><rect width="${colW}" height="30" fill="#0b0e12"/><text x="8" y="20" fill="#ff6b2c" font-size="14" font-family="sans-serif" font-weight="bold">${t.label}</text><text x="${colW - 8}" y="20" fill="#8a8f96" font-size="12" font-family="sans-serif" text-anchor="end">${t.fullH}px tall</text></svg>`),
      left: i * (colW + 12), top: 0,
    }));
    await sharp({ create: { width: W, height: H, channels: 3, background: '#0b0e12' } })
      .composite([...labels, ...tiles.map((t, i) => ({ input: t.buf, left: i * (colW + 12), top: 34 }))])
      .jpeg({ quality: 78 })
      .toFile(`${OUT}/${pair.id}-${vp.id}.jpg`);
    console.log(`WROTE ${OUT}/${pair.id}-${vp.id}.jpg  (${tiles.map((t) => t.label).join(' | ')})`);
  }
}
await browser.close();
