# DECISIONS.md

Every judgement call made on your behalf, and every stub. Items marked **CONFIRM**
are ones I would like you to sign off; items marked **STUB** need a key or an
account before they do anything.

---

## Brand

### 1. The name is QUWA / قوّة — **CONFIRM**
From Arabic *quwwa*, "strength" or "power". Four letters in Latin, one word in Arabic,
and it means the same thing in both — so neither locale is carrying a translated brand.
It reads as a coined word to an English speaker, which is how most global fitness brands
work.

Not checked for trademark conflicts or domain availability. `quwa.fit` is used as a
placeholder in `src/config/site.ts`. **This is the decision most worth overruling early**,
because it is cheap to change now and expensive after launch.

### 2. Voice — **CONFIRM**
Plain, specific, slightly sceptical. It names mechanisms rather than outcomes, hedges
claims, and says what a product will not do. This is a deliberate bet that the audience
for "evidence-based training" responds better to being levelled with than sold to.
It is also what keeps us away from the promises that generate chargebacks.

### 3. The Arabic is not a translation — **CONFIRM**
Both locales are written from the same brief. The Arabic articles cover different topics
from the English ones on purpose: *training during Ramadan* is a high-intent Arabic
search with no English equivalent, and translating the English ten would have produced
ten articles nobody searches for.

Every Arabic string is native marketing Arabic in MSA — not Gulf, not Egyptian — because
the market is global Arabic, not one country. **A native speaker should still read it
before launch.**

### 4. Palette: near-black `#0b0e12`, surface `#161b22`, paper `#f5f7fa`, accent `#ff6b2c`
Four load-bearing colours, which is what all three quality references measure at.
The accent hue (18°) is deliberately distinct from jeffnippard's olive (95°),
rpstrength's red (356°) and joinladder's acid yellow (66°). Justified against measured
values in `docs/REFERENCE-SPEC.md` §6.

### 5. Typography: Inter (Latin) + IBM Plex Sans Arabic
Both are open-licensed, both cover the weights we use, and both are on Google Fonts so
`astro:assets` can subset them. Weights are restricted to 400 and 700: joinladder's
barbell distribution is 400/800, but IBM Plex Sans Arabic ships no 800, and 700 is the
heaviest weight present in *both* families — so it is the heaviest weight that can look
identical across locales.

### 6. Dark theme only
No light mode. The references split two dark, one light, one near-white. Dark was chosen
because the accent needs a dark ground to carry, and because shipping one theme well
beats shipping two adequately. **CONFIRM** if you want light mode; it is roughly a day.

### 7. Optical size match, measured not guessed
At 200px with both faces loaded, Inter's x-height is 109.18px (ratio 0.546) and
IBM Plex Sans Arabic's is 103.20px (ratio 0.516) — 5.8% smaller. Corrected with
`font-size-adjust: 0.546` on the Arabic root.

The first attempt scaled the root font-size by 1.04 instead. That corrected the glyphs
and broke everything else: every rem-based token moved with it, the Arabic container
measured 1331px against a spec of 1280, and padding landed on 24.96 / 12.48 / 8.32.
Recorded in `out/round-1/CRITIQUE.md` #1.

---

## Business model

### 8. Pricing — **CONFIRM every number**
All of it lives in `src/config/pricing.ts` and nothing else hardcodes a figure.

| | USD |
|---|---|
| Programs | 29 – 44 |
| Recipe collection | 19 |
| Train & Eat bundle | 49 (vs 58 separately) |
| Complete Library bundle | 129 (vs 229 separately) |
| Membership monthly | 19 |
| Membership annual | 159 → 13.25/month, **8.4× monthly** |
| Order bump | 12 (vs 19) |
| Referral | friend 20% off, referrer $10 credit |
| Guarantee | 14 days |

The annual multiple sits inside the 8–10× band you specified. The trial is on annual
only, and prominent, because a trial on monthly gives away a month's value for a week's
commitment.

These are anchored to what the reference market charges — jeffnippard's programs measure
at $39.99–$49.99 — not to any analysis of your costs or audience.

### 9. Payment provider — **STUB, needs keys**
`src/lib/payments/` has a working `mock` provider and three concrete adapters at correct
request shapes with **no live keys anywhere**.

- **Lemon Squeezy** — recommended default. Merchant of record, so it handles VAT and
  sales tax in every jurisdiction. Has a hosted-checkout path that works on GitHub Pages
  with no Worker at all.
- **Paddle** — also merchant of record, and the strongest MENA card coverage of the
  three. Opens an overlay rather than redirecting, so it needs `Paddle.js` loaded; that
  script tag is **not** wired up.
- **Stripe** — **requires the Worker.** A Checkout Session needs the secret key, which
  cannot go in a browser. Also not a merchant of record: VAT and sales-tax liability in
  every market is yours.

Each adapter has an empty id map (`LS_VARIANT_IDS`, `PADDLE_PRICE_IDS`,
`STRIPE_PRICE_IDS`) that must be filled from the provider dashboard.

### 10. Subscription gating is mock-only — **STUB**
`getSubscriptionStatus()` returns a live trialing subscription for any non-empty
customer reference so the gated UI can be exercised. Real gating needs the Worker
deployed and a provider webhook pointed at it.

### 11. Digital delivery is mock-only — **STUB**
The thank-you page lists the purchased items and renders download buttons that say
"Demo mode". Real delivery needs product zips in the R2 bucket and the Worker deployed.
The signing scheme is implemented and correct: HMAC over `email:item:expiry`, 72-hour
expiry, constant-time comparison.

### 12. Currency conversion uses a static rate table — **CONFIRM**
`CURRENCIES` in `src/config/pricing.ts` holds 16 currencies at fixed rates. There is no
server on GitHub Pages, so there is no live FX feed.

Rates are rounded conservatively and rounding is per-convention: `.99` for USD/EUR/GBP,
whole units for Gulf currencies, nearest 5 for EGP/TRY/INR. The displayed local price is
**presentational** — the charge settles in the provider's currency, and both the Terms
and the checkout say so.

Rates will drift. Either update them periodically, or switch to a provider that prices
natively per market and drop the table.

### 13. Abandoned-cart recovery is the email provider's job — **STUB**
The email address is captured at the calculator gate and at checkout and stored against
the cart in `localStorage`. There is no sending mechanism here; the recovery sequence is
configured in the email provider (MailerLite, ConvertKit or Resend) against that address.

---

## Content and images

### 14. Eleven of fourteen image slots are filled; three are not
`assets/manifest.json` records each slot's source and the reason.

**Filled (11)** from Wikimedia Commons under public domain or CC BY, downloaded and
self-hosted, credited in `assets/CREDITS.md`.

**Unfilled (1)** — `program-lean-recomposition`. Three licensed candidates were rejected
on visual review: a restaurant dining room, a museum ceramic accession, and Marines
grilling chicken at a field barbecue. Free licensed aggregators do not reliably return
commercial-grade food photography. Renders as a neutral block at the correct 4:3 ratio.

**Blocked (2)** — `proof-transformation-1` and `founder-portrait`. Both would show a real
person. A generated body attached to a customer testimonial is a fabricated claim, and a
generated portrait attached to a name is impersonation. Neither will be produced here.
Brief in `docs/SHOT-LIST.md`.

Openverse was the first choice and worked for four slots before beginning to return 401
to unauthenticated clients mid-build. The adapter is still in `scripts/source-stock.mjs`
and activates if `OPENVERSE_TOKEN` is set.

### 15. Testimonials are written, not collected — **CONFIRM before launch**
Nine per locale in `src/data/testimonials.ts`, each tagged to a specific product because
`<Proof>` will not render an untagged one. They are placeholders that demonstrate the
structure: a named person, a location, their starting context, and a quote about a
specific mechanic rather than a result.

**These are not real customers and must be replaced with real ones before you take
money.** Publishing invented testimonials as genuine is a legal problem in most of the
markets this site targets, not just an ethical one.

The same applies to the three "by the numbers" figures on the home page. They currently
count real things about the site — seven calculators, twenty articles, two languages —
precisely so that nothing invented is presented as a metric.

### 16. Accent budget on short pages diverges from the reference — accepted
`REFERENCE-SPEC` §3.3 sets the accent budget at roughly one use per 2000px, measured on
joinladder's 15512px sales page. Our long templates meet it (product 1 per 2962px, blog
1 per 3789px). The calculator template measures 1 per 663px, because a 2653px utility
page with one primary action cannot satisfy a per-pixel ratio without removing its CTA.
Reasoning in `out/round-5/CRITIQUE.md`.

---

## Architecture

### 16b. `font-display: optional`, not `swap`
Swapping the webfont in at ~1.3s reflowed the page and cost 0.083 CLS on the Arabic
templates — Arabic fallback metrics diverge from IBM Plex Sans Arabic far more than
Arial's do from Inter. `optional` gives the font a short block period and then declines
to swap.

The trade-off: on a genuinely slow first visit the page renders in the system fallback
and stays there until the next navigation. Verified under 4× CPU throttling on a
simulated 4G connection that the per-locale preload wins that race — the real fonts
rendered on all five templates tested. If you would rather guarantee the typeface at the
cost of a visible reflow, change `display` back to `'swap'` in `astro.config.mjs`.

### 17. No UI framework
Astro with vanilla TypeScript islands. No React, no Vue, no Svelte. The interactive
surface is seven calculators, a cart and a checkout — none of which needs a virtual DOM,
and all of which would have cost 40KB+ of framework on a Lighthouse budget. Total
blocking time measures 0ms.

### 18. Locale routing is manual `[lang]`, not Astro's i18n integration
`getStaticPaths` over a `[lang]` param gives full control over `hreflang`, the
`x-default` alternate, and the base path, and it avoids surprises in how the integration
handles a project-site base. Root-language detection happens client-side in
`src/pages/index.astro`, because a static host cannot negotiate content.

### 19. Prices render server-side in USD, then convert client-side
The HTML ships USD so `Product` JSON-LD is stable and crawlers see a consistent
currency. `src/scripts/app.ts` rewrites every `[data-price]` on load from the detected or
stored currency. This means a visitor with JavaScript disabled sees USD, which is correct
rather than broken.

### 20. Markdown links are rewritten at build time
Content is authored with root-relative links (`/en/tools/tdee`) so it stays portable. A
rehype plugin prefixes the base path at build, rather than baking `/quwa` into 44 content
files. Installing `@astrojs/markdown-remark` was required for this — Astro 7 defaults to
a different Markdown processor that does not take rehype plugins.

### 21. TypeScript is pinned to 6.0.3
`@astrojs/check` peer-requires `^5 || ^6`, and TypeScript 7 was installed by default.
Pinned rather than skipping the type check, because `npm run build` runs
`astro check && astro build` and a type error should fail the deploy.

### 22. `public/CNAME` ships as `CNAME.example`
A live `CNAME` naming a domain that does not resolve yet makes Pages serve the site from
an address nobody can reach. Instructions in the README.

---

## Product safety

### 23. Calorie floors are enforced in the maths, not the UI
`applyCalorieFloor()` in `src/lib/calculators.ts` clamps any calorie output to 1,200 kcal
for women and 1,500 for men and returns a `floored` flag. Every calculator that can emit
a calorie figure routes through it, so a UI change cannot accidentally bypass it. Below
the floor the tool shows the floor and a note directing the user to a professional.

### 24. No weight-loss promises, no timelines
Not a copy preference — a payment-processor survival issue. Specific outcome claims
drive refund demands and chargebacks, and a chargeback rate above roughly 1% loses you
the processor. Every claim on the site is about mechanism ("the reasoning is written
down") or scope ("twelve weeks, four days a week"), never about outcome.

### 25. Every calculator result carries an estimate note, and every stat carries a
disclaimer adjacent to it
Taken from jeffnippard, who puts "Results vary based on factors such as training
consistency, nutrition, and individual differences" directly under the transformations
stat at the smallest size on the page — not in the footer.

### 26. Legal pages are real, not lorem
`/terms`, `/privacy` and `/refund-policy` exist in both locales with substantive text,
because Stripe, Paddle and Lemon Squeezy all require them for account approval. The
competitor has terms and a refund policy but **no privacy policy**, which would block it
from several processors.

**They have not been reviewed by a lawyer.** They are written to be honest and specific
rather than defensive, and they describe what this site actually does. Have them reviewed
before taking money in the EU or UK.
