/**
 * Ad creatives, rendered in the browser so they use the real brand faces rather
 * than whatever librsvg happens to have installed.
 *
 *   Facebook feed   1200 × 628   (1.91:1)
 *   Instagram feed  1080 × 1350  (4:5, the highest-reach feed ratio)
 *
 * Copy follows the same rules as the site: no outcome promises, no timelines, no
 * before/after, nothing that implies a personal attribute — which is also what
 * Meta's health-and-fitness ad policy requires.
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require_ = createRequire(import.meta.url);
const sharp = require_('../node_modules/sharp');

const OUT = path.resolve('../out/ads');
fs.mkdirSync(OUT, { recursive: true });
const BASE = 'http://localhost:4321/quwa';

const INTER = '/quwa/_astro/fonts/1e49bd114953732c.woff2';
const INTER_BOLD = '/quwa/_astro/fonts/e868cdf4720e9ea5.woff2';
const PLEX = '/quwa/_astro/fonts/f5a2d681e1d55986.woff2';
const PLEX_BOLD = '/quwa/_astro/fonts/651ffa9eabf98f0e.woff2';

const b64 = (p) => `data:image/jpeg;base64,${fs.readFileSync(path.resolve(p)).toString('base64')}`;
const HERO = b64('../src/assets/images/home-hero.jpg');
const PLATES = b64('../src/assets/images/program-push-pull-legs.jpg');

const COPY = {
  en: {
    dir: 'ltr', font: 'Inter',
    fb: {
      eyebrow: 'Free tools · No signup',
      headline: 'Train with a plan,\nnot a guess.',
      sub: 'Seven calculators that do the arithmetic properly. Calories, macros, protein, one-rep max — about a minute each.',
      cta: 'Open the calculators',
      foot: 'quwa.fit · English & العربية',
    },
    ig: {
      eyebrow: 'Seven free calculators',
      headline: 'Your calories,\nmacros and\none-rep max.',
      sub: 'In about a minute. No signup, no card, no email required to see the result.',
      cta: 'Try the tools',
      foot: 'Estimates, not prescriptions. Speak to a professional before changing how you train or eat.',
    },
  },
  ar: {
    dir: 'rtl', font: '"IBM Plex Sans Arabic"',
    fb: {
      eyebrow: 'أدوات مجانية · بلا تسجيل',
      headline: 'تدرّب بخطة،\nلا بالتخمين.',
      sub: 'سبع حاسبات تُجري الحساب بدقة. السعرات والماكروز والبروتين وأقصى وزن لتكرار واحد — نحو دقيقة لكل واحدة.',
      cta: 'افتح الحاسبات',
      foot: 'quwa.fit · بالعربية والإنجليزية',
    },
    ig: {
      eyebrow: 'سبع حاسبات مجانية',
      headline: 'سعراتك،\nوماكروزك،\nوأقصى وزن لك.',
      sub: 'في نحو دقيقة. بلا تسجيل، وبلا بطاقة، وبلا بريد لرؤية النتيجة.',
      cta: 'جرّب الأدوات',
      foot: 'تقديرات لا وصفات علاجية. راجع مختصاً قبل تغيير طريقة تدريبك أو غذائك.',
    },
  },
};

const shell = (dir, font, body) => `
<!doctype html><html dir="${dir}"><head><meta charset="utf-8"><style>
  @font-face{font-family:Inter;src:url(${INTER}) format('woff2');font-weight:400;font-display:block}
  @font-face{font-family:Inter;src:url(${INTER_BOLD}) format('woff2');font-weight:700;font-display:block}
  @font-face{font-family:"IBM Plex Sans Arabic";src:url(${PLEX}) format('woff2');font-weight:400;font-display:block}
  @font-face{font-family:"IBM Plex Sans Arabic";src:url(${PLEX_BOLD}) format('woff2');font-weight:700;font-display:block}
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:${font},system-ui,sans-serif;background:#0b0e12;color:#f5f7fa;-webkit-font-smoothing:antialiased}
  h1{line-height:1.04;letter-spacing:-.02em}
  html[dir=rtl] h1{line-height:1.34;letter-spacing:0}
  html[dir=rtl] .word{letter-spacing:0}
  .mark{display:flex;align-items:center;gap:14px}
  .bars{display:flex;gap:6px}
  .bars i{display:block;width:9px;height:30px;border-radius:2px}
  .bars i:nth-child(1){background:#ff6b2c}
  .bars i:nth-child(2){background:#f5f7fa}
  .bars i:nth-child(3){background:#ff6b2c;opacity:.55}
  .word{font-size:26px;font-weight:700;letter-spacing:.04em}
  .eyebrow{font-size:17px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#ff6b2c}
  html[dir=rtl] .eyebrow{text-transform:none;letter-spacing:.04em}
  .cta{display:inline-flex;align-items:center;justify-content:center;background:#ff6b2c;color:#0b0e12;font-weight:700;border-radius:999px}
  .sample{position:absolute;inset-block-start:0;inset-inline-end:0;background:rgba(11,14,18,.72);border:1px solid rgba(245,247,250,.22);border-start-end-radius:0;border-end-start-radius:8px;padding:7px 14px;font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:rgba(245,247,250,.72);font-weight:700}
  html[dir=rtl] .sample{text-transform:none;letter-spacing:0}
  /* Logical-direction scrims: the horizontal one always fades away from the copy. */
  .scrim-h{background:linear-gradient(to right,#0b0e12 0%,rgba(11,14,18,.92) 14%,rgba(11,14,18,.45) 48%,rgba(11,14,18,.12) 100%)}
  html[dir=rtl] .scrim-h{background:linear-gradient(to left,#0b0e12 0%,rgba(11,14,18,.92) 14%,rgba(11,14,18,.45) 48%,rgba(11,14,18,.12) 100%)}
  .scrim-v{background:linear-gradient(to bottom,rgba(11,14,18,.5) 0%,rgba(11,14,18,.06) 30%,rgba(11,14,18,.72) 74%,#0b0e12 100%)}
</style></head><body>${body}</body></html>`;

const fbAd = (c, img) => `
<div style="position:relative;width:1200px;height:628px;display:flex;overflow:hidden">
  <div style="flex:0 0 640px;padding:60px 56px;display:flex;flex-direction:column;justify-content:space-between;z-index:2">
    <div class="mark"><span class="bars"><i></i><i></i><i></i></span><span class="word">QUWA</span></div>
    <div>
      <p class="eyebrow" style="margin-bottom:18px">${c.eyebrow}</p>
      <h1 style="font-size:62px;font-weight:700;white-space:pre-line;margin-bottom:20px">${c.headline}</h1>
      <p style="font-size:21px;line-height:1.5;color:rgba(245,247,250,.78);max-width:30ch">${c.sub}</p>
    </div>
    <div style="display:flex;align-items:center;gap:22px;flex-wrap:wrap">
      <span class="cta" style="height:58px;padding:0 34px;font-size:19px">${c.cta}</span>
      <span style="font-size:15px;color:rgba(245,247,250,.55)">${c.foot}</span>
    </div>
  </div>
  <div style="position:absolute;inset-block:0;inset-inline-end:0;width:640px">
    <img src="${img}" style="width:100%;height:100%;object-fit:cover" alt="">
    <div class="scrim-h" style="position:absolute;inset:0"></div>
  </div>
  <div class="sample">Sample · concept</div>
</div>`;

const igAd = (c, img) => `
<div style="position:relative;width:1080px;height:1350px;display:flex;flex-direction:column;overflow:hidden">
  <div style="position:relative;height:740px;flex:none">
    <img src="${img}" style="width:100%;height:100%;object-fit:cover" alt="">
    <div class="scrim-v" style="position:absolute;inset:0"></div>
    <div style="position:absolute;inset-block-start:48px;inset-inline-start:52px" class="mark">
      <span class="bars"><i></i><i></i><i></i></span><span class="word" style="font-size:30px">QUWA</span>
    </div>
  </div>
  <div style="flex:1;padding:0 56px 52px;display:flex;flex-direction:column;justify-content:flex-end;gap:30px;margin-top:-210px;position:relative;z-index:2">
    <div>
      <p class="eyebrow" style="margin-bottom:20px;font-size:19px">${c.eyebrow}</p>
      <h1 style="font-size:76px;font-weight:700;white-space:pre-line;margin-bottom:22px">${c.headline}</h1>
      <p style="font-size:26px;line-height:1.5;color:rgba(245,247,250,.8);max-width:26ch">${c.sub}</p>
    </div>
    <div>
      <span class="cta" style="height:74px;padding:0 46px;font-size:25px">${c.cta}</span>
      <p style="margin-top:24px;font-size:16px;line-height:1.55;color:rgba(245,247,250,.52);max-width:46ch">${c.foot}</p>
    </div>
  </div>
  <div class="sample">Sample · concept</div>
</div>`;

const browser = await chromium.launch();
const ctx = await browser.newContext({ deviceScaleFactor: 2 });
const page = await ctx.newPage();
// Same origin as the site so the /quwa/_astro font URLs resolve.
await page.goto(`${BASE}/en/`, { waitUntil: 'domcontentloaded' });

const jobs = [
  { file: 'fb-1200x628-en', w: 1200, h: 628, html: shell('ltr', COPY.en.font, fbAd(COPY.en.fb, HERO)) },
  { file: 'ig-1080x1350-en', w: 1080, h: 1350, html: shell('ltr', COPY.en.font, igAd(COPY.en.ig, PLATES)) },
  { file: 'fb-1200x628-ar', w: 1200, h: 628, html: shell('rtl', COPY.ar.font, fbAd(COPY.ar.fb, HERO)) },
  { file: 'ig-1080x1350-ar', w: 1080, h: 1350, html: shell('rtl', COPY.ar.font, igAd(COPY.ar.ig, PLATES)) },
];

for (const job of jobs) {
  await page.setViewportSize({ width: job.w, height: job.h });
  await page.setContent(job.html, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(700);
  const buf = await page.screenshot({ clip: { x: 0, y: 0, width: job.w, height: job.h } });
  // Ship a 1× PNG for upload and a 2× retina PNG for review.
  await sharp(buf).resize(job.w, job.h).png({ compressionLevel: 9 }).toFile(`${OUT}/${job.file}.png`);
  await sharp(buf).jpeg({ quality: 92 }).toFile(`${OUT}/${job.file}@2x.jpg`);
  const s = fs.statSync(`${OUT}/${job.file}.png`);
  console.log(`OK  ${job.file}.png  ${job.w}×${job.h}  ${Math.round(s.size / 1024)}KB`);
}
await browser.close();
