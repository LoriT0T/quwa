import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const ROUND = process.argv[2] ?? '1';
const BASE = process.argv[3] ?? 'http://localhost:4321/quwa';
const OUT = path.resolve(`../out/round-${ROUND}`);
fs.mkdirSync(OUT, { recursive: true });

const PAGES = [
  { id: 'home', p: '' },
  { id: 'programs', p: 'programs' },
  { id: 'product', p: 'programs/hypertrophy-foundations' },
  { id: 'membership', p: 'membership' },
  { id: 'tools', p: 'tools' },
  { id: 'tool', p: 'tools/tdee' },
  { id: 'blog', p: 'blog' },
  { id: 'cart', p: 'cart' },
];
const VIEWPORTS = [
  { id: 'm390', w: 390, h: 844, mobile: true },
  { id: 't768', w: 768, h: 1024, mobile: true },
  { id: 'd1024', w: 1024, h: 800, mobile: false },
  { id: 'd1440', w: 1440, h: 900, mobile: false },
];
const LOCALES = ['en', 'ar'];

const EXTRACT = () => {
  const tally = (m, k) => { if (k == null || k === '') return; m[k] = (m[k] || 0) + 1; };
  const px = (v) => { const n = parseFloat(v); return Number.isFinite(n) ? Math.round(n * 100) / 100 : null; };
  const fontSizes = {}, fontFamilies = {}, fontWeights = {}, colors = {}, bgs = {}, radii = {},
        pads = {}, gaps = {}, lineHeights = {}, maxWidths = {}, containers = {};
  const all = Array.from(document.querySelectorAll('body *'));
  for (const el of all) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none') continue;
    const hasText = Array.from(el.childNodes).some((n) => n.nodeType === 3 && n.textContent.trim().length > 1);
    if (hasText) {
      tally(fontSizes, px(cs.fontSize));
      tally(fontFamilies, cs.fontFamily.split(',')[0].replace(/["']/g, '').trim());
      tally(fontWeights, cs.fontWeight);
      tally(colors, cs.color);
      const lh = cs.lineHeight === 'normal' ? 'normal' : (px(cs.lineHeight) / px(cs.fontSize)).toFixed(2);
      tally(lineHeights, `${px(cs.fontSize)}/${lh}`);
    }
    const bg = cs.backgroundColor;
    if (bg && bg !== 'rgba(0, 0, 0, 0)' && r.width * r.height > 400) tally(bgs, bg);
    if (cs.borderRadius !== '0px') tally(radii, cs.borderRadius);
    for (const s of ['paddingTop', 'paddingBottom']) if (px(cs[s]) > 0) tally(pads, px(cs[s]));
    if (cs.display.includes('flex') || cs.display.includes('grid')) {
      if (px(cs.rowGap) > 0) tally(gaps, px(cs.rowGap));
      if (px(cs.columnGap) > 0) tally(gaps, px(cs.columnGap));
    }
    if (cs.maxWidth !== 'none' && px(cs.maxWidth) > 300) tally(maxWidths, px(cs.maxWidth));
    if (r.width > 300 && r.width < window.innerWidth - 1 && el.children.length > 1) tally(containers, Math.round(r.width));
  }

  const sections = Array.from(document.querySelectorAll('main > section, main > div > section, main section.section, main section.section-tight'))
    .map((el) => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      const h = el.querySelector('h1,h2,h3');
      return {
        h: Math.round(r.height), top: Math.round(r.top + window.scrollY),
        padTop: cs.paddingTop, padBottom: cs.paddingBottom,
        heading: h ? h.innerText.trim().slice(0, 60) : null,
        words: (el.innerText || '').trim().split(/\s+/).filter(Boolean).length,
        imgs: el.querySelectorAll('img,picture,video,[role=img]').length,
      };
    }).filter((s) => s.h > 40);

  // Accessibility + structural checks
  const issues = [];
  const h1s = document.querySelectorAll('h1');
  if (h1s.length !== 1) issues.push(`h1 count = ${h1s.length}`);
  document.querySelectorAll('img').forEach((img) => { if (!img.alt && img.alt !== '') issues.push(`img without alt: ${img.src.slice(-40)}`); });
  document.querySelectorAll('input, select, textarea').forEach((el) => {
    const id = el.id;
    const labelled = (id && document.querySelector(`label[for="${id}"]`)) || el.closest('label')
      || el.getAttribute('aria-label') || el.getAttribute('aria-labelledby');
    if (!labelled && el.type !== 'hidden' && el.type !== 'radio' && el.type !== 'checkbox') {
      issues.push(`unlabelled control: ${el.tagName}#${id || '(no id)'}`);
    }
  });
  document.querySelectorAll('a').forEach((a) => {
    if (!a.textContent.trim() && !a.getAttribute('aria-label') && !a.querySelector('img[alt]')) {
      issues.push(`link without accessible name: ${a.getAttribute('href')}`);
    }
  });
  // Touch targets on mobile
  if (window.innerWidth < 768) {
    document.querySelectorAll('a.btn, button, input[type=submit]').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.height > 0 && r.height < 44) issues.push(`touch target ${Math.round(r.height)}px: ${(el.textContent || '').trim().slice(0, 25)}`);
    });
  }

  const de = document.documentElement;
  const overflowX = document.body.scrollWidth > window.innerWidth + 1
    ? `body scrollWidth ${document.body.scrollWidth} > viewport ${window.innerWidth}` : null;
  if (overflowX) issues.push(overflowX);

  const styles = getComputedStyle(de);
  const tokens = {};
  for (const t of ['--fs-body','--fs-lead','--fs-h2','--fs-display','--fs-eyebrow','--fs-card-title','--fs-h3',
                   '--space-section','--space-section-tight','--container','--page-x','--measure-card','--measure-prose',
                   '--r-card','--r-control','--lh-body','--lh-heading','--font-scale']) {
    tokens[t] = styles.getPropertyValue(t).trim();
  }

  // x-height of the two families, measured rather than assumed
  const probe = (family) => {
    const el = document.createElement('span');
    el.textContent = 'x';
    el.style.cssText = `position:absolute;visibility:hidden;font-size:100px;line-height:1;font-family:${family}`;
    document.body.appendChild(el);
    const h = el.getBoundingClientRect().height;
    const c = document.createElement('canvas').getContext('2d');
    c.font = `100px ${family}`;
    const m = c.measureText('x');
    el.remove();
    return { box: Math.round(h), xHeight: Math.round((m.actualBoundingBoxAscent ?? 0) * 100) / 100 };
  };

  const sortTop = (o, n = 20) => Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, n);
  return {
    dir: de.getAttribute('dir'), lang: de.getAttribute('lang'),
    vw: window.innerWidth, docHeight: de.scrollHeight,
    fontSizes: sortTop(fontSizes, 24), fontFamilies: sortTop(fontFamilies, 6), fontWeights: sortTop(fontWeights, 6),
    colors: sortTop(colors, 12), bgs: sortTop(bgs, 12), radii: sortTop(radii, 8),
    pads: sortTop(pads, 20), gaps: sortTop(gaps, 14), lineHeights: sortTop(lineHeights, 12),
    maxWidths: sortTop(maxWidths, 10), containers: sortTop(containers, 8),
    sections, issues, tokens,
    xHeight: { inter: probe('Inter'), arabic: probe('"IBM Plex Sans Arabic"') },
  };
};

const browser = await chromium.launch();
const results = {};
const consoleErrors = [];

for (const locale of LOCALES) {
  for (const page of PAGES) {
    for (const vp of VIEWPORTS) {
      const key = `${page.id}-${locale}-${vp.id}`;
      const ctx = await browser.newContext({
        viewport: { width: vp.w, height: vp.h },
        isMobile: vp.mobile, hasTouch: vp.mobile, deviceScaleFactor: 1,
        locale: locale === 'ar' ? 'ar-SA' : 'en-US',
      });
      const p = await ctx.newPage();
      p.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(`${key}: ${m.text().slice(0, 160)}`); });
      p.on('pageerror', (e) => consoleErrors.push(`${key}: PAGEERROR ${e.message.slice(0, 160)}`));
      try {
        const url = `${BASE}/${locale}${page.p ? '/' + page.p : ''}`;
        const resp = await p.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        await p.waitForTimeout(500);
        const data = await p.evaluate(EXTRACT);
        data.status = resp?.status();
        data.url = url;
        results[key] = data;
        // Screenshot the two headline viewports only, to keep the round reviewable.
        if (vp.id === 'm390' || vp.id === 'd1440') {
          await p.screenshot({ path: `${OUT}/${key}.png`, fullPage: true });
        }
      } catch (e) {
        results[key] = { error: e.message.split('\n')[0] };
        console.log(`ERR ${key}: ${e.message.split('\n')[0]}`);
      }
      await ctx.close();
    }
  }
}

// ── Functional pass ─────────────────────────────────────────────────────────
const func = {};
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => consoleErrors.push(`FUNC: PAGEERROR ${e.message.slice(0, 160)}`));
  p.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(`FUNC: ${m.text().slice(0, 160)}`); });

  // 1. Calculator
  await p.goto(`${BASE}/en/tools/tdee`, { waitUntil: 'networkidle' });
  await p.click('button[type=submit]');
  await p.waitForTimeout(400);
  func.calculatorResult = await p.locator('[data-result-body]').innerText().catch(() => 'NO RESULT');
  func.calculatorVisible = await p.locator('[data-calc-result]').isVisible().catch(() => false);

  // 1b. Calorie floor
  await p.fill('input[name=weight]', '40');
  await p.fill('input[name=age]', '70');
  await p.selectOption('select[name=activity]', 'sedentary');
  await p.check('input[name=sex][value=female]');
  await p.click('button[type=submit]');
  await p.waitForTimeout(300);
  func.floorWarningShown = await p.locator('[data-floor-warning]').isVisible().catch(() => false);
  func.flooredResult = await p.locator('[data-result-body]').innerText().catch(() => '');

  // 2. Email gate
  await p.fill('form[data-email-form] input[type=email]', 'test@example.com');
  await p.click('form[data-email-form] button[type=submit]');
  await p.waitForTimeout(300);
  func.emailGateMessage = await p.locator('form[data-email-form] [data-form-message]').first().innerText().catch(() => 'NONE');

  // 3. Product page → add to cart
  await p.goto(`${BASE}/en/programs/hypertrophy-foundations`, { waitUntil: 'networkidle' });
  await p.click('[data-add-to-cart]');
  await p.waitForTimeout(400);
  func.cartCount = await p.locator('[data-cart-count]').first().innerText().catch(() => 'NONE');

  // 3b. Sticky CTA appears after the fold
  await p.evaluate(() => window.scrollTo(0, 2000));
  await p.waitForTimeout(600);
  func.stickyVisible = await p.locator('[data-sticky-cta][data-visible]').count() > 0;

  // 4. Cart + order bump
  await p.goto(`${BASE}/en/cart`, { waitUntil: 'networkidle' });
  await p.waitForTimeout(400);
  func.cartLines = await p.locator('[data-cart-items] li').count();
  func.cartTotalBefore = await p.locator('[data-cart-total]').innerText().catch(() => '');
  const bump = p.locator('[data-bump-toggle]');
  func.bumpPresent = await bump.count() > 0 && await p.locator('[data-bump-wrap]').isVisible();
  if (func.bumpPresent) {
    await bump.check();
    await p.waitForTimeout(400);
    func.cartLinesAfterBump = await p.locator('[data-cart-items] li').count();
    func.cartTotalAfter = await p.locator('[data-cart-total]').innerText().catch(() => '');
  }

  // 5. Checkout → thank-you
  await p.goto(`${BASE}/en/checkout`, { waitUntil: 'networkidle' });
  await p.fill('#co-email', 'buyer@example.com');
  await p.click('[data-place-order]');
  await p.waitForTimeout(1800);
  func.landedOn = p.url().replace(BASE, '');
  func.thankYouDownloads = await p.locator('[data-download-list] li').count().catch(() => 0);
  func.upsellVisible = await p.locator('[data-upsell]').isVisible().catch(() => false);
  func.upsellCta = await p.locator('[data-upsell-accept]').innerText().catch(() => 'NONE');

  // 6. Currency switcher
  await p.goto(`${BASE}/en/programs`, { waitUntil: 'networkidle' });
  func.priceUSD = await p.locator('[data-price]').first().innerText();
  // The footer switcher, not the header one — at 390 the header control sits
  // behind the menu button, so targeting it silently tested nothing.
  await p.locator('footer [data-currency-select]').selectOption('SAR');
  await p.waitForTimeout(400);
  func.priceSAR = await p.locator('[data-price]').first().innerText();
  await p.reload({ waitUntil: 'networkidle' });
  await p.waitForTimeout(400);
  func.pricePersisted = await p.locator('[data-price]').first().innerText();
  await p.goto(`${BASE}/ar/programs`, { waitUntil: 'networkidle' });
  await p.waitForTimeout(400);
  func.priceArabic = await p.locator('[data-price]').first().innerText();

  // 7. Membership trial + subscription add
  await p.goto(`${BASE}/en/membership`, { waitUntil: 'networkidle' });
  await p.click('[data-add-to-cart="membership-annual"]');
  await p.waitForTimeout(400);
  func.membershipInCart = await p.locator('[data-cart-count]').first().innerText().catch(() => 'NONE');

  // 8. Language switch preserves the page
  await p.goto(`${BASE}/en/programs/strength-base`, { waitUntil: 'networkidle' });
  await p.click('[data-locale-switch]');
  await p.waitForLoadState('networkidle');
  func.localeSwitchLandedOn = p.url().replace(BASE, '');

  await ctx.close();
}

await browser.close();
fs.writeFileSync(`${OUT}/audit.json`, JSON.stringify({ results, func, consoleErrors }, null, 2));
console.log(`\nconsole errors: ${consoleErrors.length}`);
consoleErrors.slice(0, 12).forEach((e) => console.log('  ' + e));
console.log('\nFUNCTIONAL:');
for (const [k, v] of Object.entries(func)) console.log(`  ${k}: ${String(v).replace(/\n/g, ' | ').slice(0, 120)}`);
const allIssues = Object.entries(results).flatMap(([k, r]) => (r.issues ?? []).map((i) => `${k}: ${i}`));
console.log(`\nstructural/a11y issues: ${allIssues.length}`);
[...new Set(allIssues.map((i) => i.replace(/^[^:]+: /, '')))].slice(0, 25).forEach((i) => console.log('  ' + i));
console.log(`\nWROTE ${OUT}/audit.json`);
