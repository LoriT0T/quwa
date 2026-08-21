import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const OUT = path.resolve('../out/industry');
fs.mkdirSync(OUT, { recursive: true });

const SITES = [
  { id: 'ag1',        url: 'https://drinkag1.com/' },
  { id: 'huel',       url: 'https://huel.com/' },
  { id: 'whoop',      url: 'https://www.whoop.com/' },
  { id: 'gymshark',   url: 'https://www.gymshark.com/' },
  { id: 'athleanx',   url: 'https://athleanx.com/' },
  { id: 'macrofactor',url: 'https://macrofactorapp.com/' },
  { id: 'juggernaut', url: 'https://www.juggernautai.app/' },
  { id: 'hevy',       url: 'https://www.hevyapp.com/' },
  { id: 'centr',      url: 'https://centr.com/' },
  { id: 'freeletics', url: 'https://www.freeletics.com/en/' },
  { id: 'sweat',      url: 'https://sweat.com/' },
  { id: 'caliber',    url: 'https://www.caliberstrong.com/' },
];

/** Detects which conversion patterns a page actually ships. */
const EXTRACT = () => {
  const text = document.body.innerText || '';
  const lower = text.toLowerCase();
  const html = document.documentElement.outerHTML;

  const sections = Array.from(document.querySelectorAll('body > *, main > *, main section, [class*=section], section'))
    .map((el) => {
      const r = el.getBoundingClientRect();
      const h = el.querySelector('h1,h2,h3');
      return {
        h: Math.round(r.height),
        top: Math.round(r.top + window.scrollY),
        heading: h ? h.innerText.trim().replace(/\s+/g, ' ').slice(0, 70) : null,
        words: (el.innerText || '').trim().split(/\s+/).filter(Boolean).length,
        imgs: el.querySelectorAll('img,picture,video,svg[class*=icon]').length,
        ctas: Array.from(el.querySelectorAll('a[class*=btn],button,a[class*=cta],a[class*=Button]'))
          .map((b) => (b.innerText || '').trim().replace(/\s+/g, ' ')).filter((t) => t && t.length < 40).slice(0, 3),
      };
    })
    .filter((s) => s.h > 120 && s.heading)
    .filter((s, i, arr) => arr.findIndex((o) => o.heading === s.heading) === i)
    .sort((a, b) => a.top - b.top)
    .slice(0, 30);

  const has = (re) => re.test(lower);
  const patterns = {
    pressBar: has(/as (seen|featured) (in|on)|featured in|as seen in|in the press/),
    quiz: has(/take the quiz|find your plan|build my plan|get my plan|personali[sz]ed plan|answer a few|take our quiz/),
    comparisonTable: !!document.querySelector('table') && has(/vs\.?\s|compare|versus|other apps|the competition/),
    guarantee: has(/money.?back|guarantee|risk.?free|refund|30 days|cancel anytime/),
    trial: has(/free trial|try (it )?free|\d+ days? free|start free/),
    appScreens: has(/app store|google play|download the app|available on ios/),
    coachRoster: has(/meet (the|your) (coach|trainer)|our coaches|expert coaches|certified coach/),
    ugcWall: has(/#\w{4,}|community|join .{0,20}(members|athletes|people)/),
    videoDemo: !!document.querySelector('video, iframe[src*=youtube], iframe[src*=vimeo], iframe[src*=wistia]'),
    stickyCta: Array.from(document.querySelectorAll('*')).some((el) => {
      const cs = getComputedStyle(el);
      return (cs.position === 'fixed' || cs.position === 'sticky')
        && el.getBoundingClientRect().height > 40 && el.getBoundingClientRect().height < 140
        && /get|start|join|buy|shop|try|find/i.test(el.innerText || '');
    }),
    stats: /\d[\d,.]*\s*(m|k|million|thousand|\+)/i.test(text) && has(/members|athletes|workouts|users|customers|downloads|reviews/),
    scienceBacked: has(/clinical|peer.?review|research|study|studies|science|evidence/),
    founderStory: has(/founder|our story|why we|meet the team|about us/),
    reviewsRating: has(/[45]\.\d\s*(out of|\/)\s*5|trustpilot|\d{3,}[\d,]*\s*reviews/),
    faqAccordion: !!document.querySelector('details, [class*=accordion], [class*=faq]'),
    emailCapture: !!document.querySelector('input[type=email]'),
    howItWorks: has(/how it works|3 steps|three steps|step 1|getting started/),
    beforeAfter: has(/before .{0,6}(&|and|\/) ?after|transformation/),
    urgency: has(/limited time|ends (today|tonight|soon)|only \d+ left|hurry|countdown/),
    subscriptionTiers: (text.match(/\/\s?(mo|month|yr|year)\b/gi) || []).length >= 2,
  };

  const ctas = Array.from(document.querySelectorAll('a[class*=btn],button,a[class*=cta],a[class*=Button]'))
    .map((b) => (b.innerText || '').trim().replace(/\s+/g, ' '))
    .filter((t) => t && t.length > 1 && t.length < 34);
  const ctaCounts = {};
  ctas.forEach((t) => { ctaCounts[t] = (ctaCounts[t] || 0) + 1; });

  return {
    title: document.title,
    docHeight: document.documentElement.scrollHeight,
    sectionCount: sections.length,
    sections,
    patterns,
    topCtas: Object.entries(ctaCounts).sort((a, b) => b[1] - a[1]).slice(0, 8),
    h1: document.querySelector('h1')?.innerText.trim().replace(/\s+/g, ' ').slice(0, 100) || null,
    totalImages: document.querySelectorAll('img,picture,video').length,
    totalWords: text.trim().split(/\s+/).filter(Boolean).length,
  };
};

const browser = await chromium.launch();
const results = {};
for (const site of SITES) {
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    locale: 'en-US',
  });
  const p = await ctx.newPage();
  try {
    const resp = await p.goto(site.url, { waitUntil: 'domcontentloaded', timeout: 40000 });
    await p.waitForTimeout(3000);
    await p.evaluate(async () => {
      await new Promise((res) => { let y = 0; const i = setInterval(() => { window.scrollBy(0, 1200); y += 1200; if (y > document.body.scrollHeight) { clearInterval(i); window.scrollTo(0, 0); res(); } }, 100); });
    });
    await p.waitForTimeout(1500);
    const data = await p.evaluate(EXTRACT);
    data.status = resp?.status();
    results[site.id] = data;
    await p.screenshot({ path: `${OUT}/${site.id}.png`, fullPage: true });
    fs.writeFileSync(`${OUT}/${site.id}.txt`, await p.evaluate(() => document.body.innerText));
    const on = Object.entries(data.patterns).filter(([, v]) => v).map(([k]) => k);
    console.log(`OK  ${site.id.padEnd(12)} ${String(data.status).padEnd(4)} h=${String(data.docHeight).padStart(6)} sections=${String(data.sectionCount).padStart(2)} imgs=${String(data.totalImages).padStart(3)} words=${String(data.totalWords).padStart(4)} | ${on.length} patterns`);
  } catch (e) {
    console.log(`ERR ${site.id.padEnd(12)} ${e.message.split('\n')[0].slice(0, 60)}`);
    results[site.id] = { error: e.message.split('\n')[0] };
  }
  await ctx.close();
}
await browser.close();
fs.writeFileSync(`${OUT}/research.json`, JSON.stringify(results, null, 2));
console.log('\nWROTE', `${OUT}/research.json`);
