import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const TARGETS = [
  { id: 'jeffnippard', url: 'https://jeffnippard.com/' },
  { id: 'jeffnippard-programs', url: 'https://jeffnippard.com/collections/all-programs' },
  { id: 'rpstrength', url: 'https://rpstrength.com/' },
  { id: 'joinladder', url: 'https://joinladder.com/' },
  { id: 'bodyboost', url: 'https://bodyboost.rmz.gg/' },
];
const VIEWPORTS = [ { id: 'desktop', width: 1440, height: 900 }, { id: 'mobile', width: 390, height: 844 } ];
const OUT = path.resolve('../out/reference');
fs.mkdirSync(OUT, { recursive: true });

const EXTRACT = () => {
  const tally = (m, k) => { if (k == null || k === '') return; m[k] = (m[k] || 0) + 1; };
  const fontSizes = {}, fontFamilies = {}, fontWeights = {}, colors = {}, bgs = {}, radii = {},
        pads = {}, margins = {}, gaps = {}, lineHeights = {}, letterSpacing = {}, maxWidths = {};
  const all = Array.from(document.querySelectorAll('body *'));
  const px = v => { const n = parseFloat(v); return Number.isFinite(n) ? Math.round(n * 100) / 100 : null; };
  for (const el of all) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none' || cs.opacity === '0') continue;
    const hasText = Array.from(el.childNodes).some(n => n.nodeType === 3 && n.textContent.trim().length > 1);
    if (hasText) {
      tally(fontSizes, px(cs.fontSize));
      tally(fontFamilies, cs.fontFamily.split(',')[0].replace(/["']/g, '').trim());
      tally(fontWeights, cs.fontWeight);
      tally(colors, cs.color);
      const lh = cs.lineHeight === 'normal' ? 'normal' : (px(cs.lineHeight) / px(cs.fontSize)).toFixed(2);
      tally(lineHeights, `${px(cs.fontSize)}/${lh}`);
      if (cs.letterSpacing !== 'normal') tally(letterSpacing, `${px(cs.fontSize)}:${cs.letterSpacing}`);
    }
    const bg = cs.backgroundColor;
    if (bg && bg !== 'rgba(0, 0, 0, 0)' && r.width * r.height > 400) tally(bgs, bg);
    if (cs.borderRadius !== '0px') tally(radii, cs.borderRadius);
    for (const s of ['paddingTop','paddingBottom']) if (px(cs[s]) > 0) tally(pads, px(cs[s]));
    for (const s of ['marginTop','marginBottom']) if (px(cs[s]) > 0) tally(margins, px(cs[s]));
    if (cs.display.includes('flex') || cs.display.includes('grid')) { if (px(cs.rowGap) > 0) tally(gaps, px(cs.rowGap)); if (px(cs.columnGap) > 0) tally(gaps, px(cs.columnGap)); }
    if (cs.maxWidth !== 'none' && px(cs.maxWidth) > 300) tally(maxWidths, px(cs.maxWidth));
  }
  // section map: best-effort top-level blocks
  const roots = document.querySelectorAll('body > *, main > *, #MainContent > *, [role=main] > *');
  const sections = [];
  const seen = new Set();
  for (const el of roots) {
    if (seen.has(el)) continue; seen.add(el);
    const r = el.getBoundingClientRect();
    if (r.height < 40) continue;
    const cs = getComputedStyle(el);
    const heading = el.querySelector('h1,h2,h3');
    sections.push({
      tag: el.tagName.toLowerCase(),
      id: el.id || null,
      cls: (el.className && typeof el.className === 'string' ? el.className.slice(0, 90) : null),
      height: Math.round(r.height),
      top: Math.round(r.top + window.scrollY),
      padTop: cs.paddingTop, padBottom: cs.paddingBottom,
      bg: cs.backgroundColor,
      heading: heading ? heading.innerText.trim().slice(0, 90) : null,
      imgs: el.querySelectorAll('img,picture,video').length,
      links: el.querySelectorAll('a').length,
      words: (el.innerText || '').trim().split(/\s+/).filter(Boolean).length,
    });
  }
  // container measurement: widest common inner wrapper
  const containers = {};
  for (const el of all) {
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    if (r.width > 300 && r.width < window.innerWidth - 1 && el.children.length > 1) {
      const w = Math.round(r.width);
      containers[w] = (containers[w] || 0) + 1;
    }
  }
  const sortTop = (o, n = 24) => Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, n);
  return {
    url: location.href, title: document.title, vw: window.innerWidth,
    docHeight: document.documentElement.scrollHeight,
    fontSizes: sortTop(fontSizes, 30), fontFamilies: sortTop(fontFamilies), fontWeights: sortTop(fontWeights),
    colors: sortTop(colors, 30), bgs: sortTop(bgs, 20), radii: sortTop(radii),
    pads: sortTop(pads, 30), margins: sortTop(margins, 20), gaps: sortTop(gaps, 20),
    lineHeights: sortTop(lineHeights, 20), letterSpacing: sortTop(letterSpacing, 15),
    maxWidths: sortTop(maxWidths, 15), containers: sortTop(containers, 15),
    sections,
  };
};

const browser = await chromium.launch();
const results = {};
for (const t of TARGETS) {
  results[t.id] = {};
  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      userAgent: vp.id === 'mobile'
        ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
        : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
      deviceScaleFactor: 1, isMobile: vp.id === 'mobile', hasTouch: vp.id === 'mobile',
    });
    const page = await ctx.newPage();
    try {
      const resp = await page.goto(t.url, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForTimeout(3500);
      await page.evaluate(async () => { await new Promise(res => { let y = 0; const i = setInterval(() => { window.scrollBy(0, 900); y += 900; if (y > document.body.scrollHeight) { clearInterval(i); window.scrollTo(0, 0); res(); } }, 120); }); });
      await page.waitForTimeout(1800);
      const data = await page.evaluate(EXTRACT);
      data.status = resp ? resp.status() : null;
      results[t.id][vp.id] = data;
      await page.screenshot({ path: `${OUT}/${t.id}-${vp.id}.png`, fullPage: true });
      const text = await page.evaluate(() => document.body.innerText);
      fs.writeFileSync(`${OUT}/${t.id}-${vp.id}.txt`, text);
      console.log(`OK  ${t.id} ${vp.id}  status=${data.status} h=${data.docHeight} sections=${data.sections.length}`);
    } catch (e) {
      console.log(`ERR ${t.id} ${vp.id}: ${e.message.split('\n')[0]}`);
      results[t.id][vp.id] = { error: e.message.split('\n')[0] };
    }
    await ctx.close();
  }
}
await browser.close();
fs.writeFileSync(`${OUT}/extract.json`, JSON.stringify(results, null, 2));
console.log('WROTE', `${OUT}/extract.json`);
