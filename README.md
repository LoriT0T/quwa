# QUWA — قوّة

A bilingual (Arabic + English) digital fitness storefront. Free calculators as the
acquisition layer, one-time programs and bundles, and a subscription library with a
seven-day trial. Static, deployed to GitHub Pages, with a Cloudflare Worker as the
only server-side piece.

**Live:** https://lorit0t.github.io/quwa/ — [English](https://lorit0t.github.io/quwa/en) · [العربية](https://lorit0t.github.io/quwa/ar)

---

## What this is

| | |
|---|---|
| Framework | Astro 7, TypeScript strict, static output |
| Styling | Tailwind v4 + CSS custom properties, RTL-first with logical properties only |
| Locales | `/en` and `/ar`, equal treatment, browser detection on first visit, `hreflang` on every page |
| Content | Markdown content collections — 9 products, 3 recipes and 10 articles **per locale** |
| Commerce | `PaymentProvider` adapter: working mock, plus Lemon Squeezy / Paddle / Stripe stubs |
| Backend | Optional Cloudflare Worker for webhooks, signed downloads, subscription gating, magic-link login |
| Hosting | GitHub Pages via GitHub Actions |

Design decisions are derived from a measured Playwright sweep of four reference
sites — see [`docs/REFERENCE-SPEC.md`](docs/REFERENCE-SPEC.md). Every judgement call and
every stub is recorded in [`DECISIONS.md`](DECISIONS.md).

---

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

`npm run build` runs `astro check` before `astro build`, so a TypeScript error fails
the build rather than reaching production.

| Command | Does |
|---|---|
| `npm run dev` | Dev server at `localhost:4321/quwa/` |
| `npm run build` | Type-check, then build to `dist/` |
| `npm run preview` | Serve `dist/` locally |
| `npm run images:source` | Fill stock slots from the Openverse API |
| `npm run images:generate` | Generate brand compositions and textures |
| `npm run images:optimize` | Crop, emit AVIF/WebP sets, write the LQIP map |

---

## Commerce modes

Set `PUBLIC_COMMERCE_MODE` in `.env`. All three paths are built; the env var picks one.

### `mock` (default)

No network, no keys, no money. The full flow runs in the browser: add to cart, order
bump, checkout, delivery page, post-purchase upsell. This is what the public demo runs,
and it is what a missing key can never break.

### `hosted`

Checkout links go straight to the provider's hosted checkout and the provider handles
delivery and receipts. **No Worker required** — this is the path that works on GitHub
Pages alone.

```bash
PUBLIC_COMMERCE_MODE=hosted
PUBLIC_PAYMENT_PROVIDER=lemonsqueezy
PUBLIC_LEMONSQUEEZY_STORE=your-store-slug
```

Then fill `LS_VARIANT_IDS` in [`src/lib/payments/lemonsqueezy.ts`](src/lib/payments/lemonsqueezy.ts)
with the variant id for each product slug.

### `worker`

Checkout via the provider, plus the Worker for signed expiring downloads, subscription
gating and magic-link login.

```bash
PUBLIC_COMMERCE_MODE=worker
WORKER_BASE_URL=https://quwa-api.<subdomain>.workers.dev
```

### Swapping provider

Change `PUBLIC_PAYMENT_PROVIDER` to `lemonsqueezy`, `paddle` or `stripe`, then fill the
id map in that adapter. Nothing outside `src/lib/payments/` knows which provider is live.

Note: **Stripe requires the Worker.** A Stripe Checkout Session needs the secret key,
which cannot be exposed in a browser, so there is no hosted-only Stripe path.
Lemon Squeezy and Paddle are merchants of record and handle VAT and sales tax; Stripe
does not, and that liability is yours.

---

## Deploying the Worker

The site stays on GitHub Pages. The Worker exists because static hosting cannot protect
a file or know whether a subscription is live.

```bash
cd workers
npm install

wrangler kv namespace create ORDERS
wrangler kv namespace create SESSIONS
wrangler r2 bucket create quwa-downloads
# paste the returned ids into wrangler.toml

wrangler secret put DOWNLOAD_SIGNING_SECRET     # openssl rand -hex 32
wrangler secret put MAGIC_LINK_SECRET           # openssl rand -hex 32
wrangler secret put LEMONSQUEEZY_WEBHOOK_SECRET # from the provider dashboard
wrangler secret put EMAIL_API_KEY               # optional, for magic-link delivery

wrangler deploy
```

Upload each product as `<product-slug>.zip` to the R2 bucket, then point the provider's
webhook at `https://<worker>/webhook/<provider>`.

| Route | Does |
|---|---|
| `POST /webhook/{lemonsqueezy,paddle,stripe}` | Verifies the signature, records the order in KV |
| `POST /auth/request` | Emails a magic link. Always returns the same response, so it cannot enumerate customers |
| `GET /auth/verify` | Exchanges the link for an HttpOnly session cookie |
| `GET /subscription/:email` | Whether a subscription is live right now |
| `GET /downloads` | Signed URLs for everything the session owns |
| `GET /download/:item` | Serves the file if the signature and deadline check out |

Download URLs are HMAC-signed over `email:item:expiry`, so a shared link stops working.

---

## Custom domain

1. Set the DNS records at your registrar:

   | Type | Name | Value |
   |---|---|---|
   | `A` | `@` | `185.199.108.153` |
   | `A` | `@` | `185.199.109.153` |
   | `A` | `@` | `185.199.110.153` |
   | `A` | `@` | `185.199.111.153` |
   | `CNAME` | `www` | `lorit0t.github.io.` |

2. `mv public/CNAME.example public/CNAME` and put your domain in it.
   It ships as `.example` on purpose — a live `CNAME` naming a domain that does not
   resolve yet makes Pages serve the site from an address nobody can reach.

3. Set the repository variables so the base path is dropped:

   ```bash
   gh variable set PUBLIC_SITE_URL  --body "https://quwa.fit"
   gh variable set PUBLIC_BASE_PATH --body ""
   ```

4. Push. Enforce HTTPS in the repository's Pages settings once the certificate is issued.

---

## Editing content

Everything a non-developer would want to change is markdown or one config file.

| To change | Edit |
|---|---|
| Any price | [`src/config/pricing.ts`](src/config/pricing.ts) — every chargeable number is here |
| Any string on the site | [`src/i18n/en.ts`](src/i18n/en.ts) / [`src/i18n/ar.ts`](src/i18n/ar.ts) — components contain no copy |
| A program | `src/content/programs/{en,ar}/<slug>.md` |
| A recipe | `src/content/recipes/{en,ar}/<slug>.md` |
| An article | `src/content/blog/{en,ar}/<slug>.md` |
| A testimonial | [`src/data/testimonials.ts`](src/data/testimonials.ts) — each one must name the product it proves |
| Design tokens | [`src/styles/tokens.css`](src/styles/tokens.css), rendered live at `/[lang]/styleguide` |
| An image slot | [`assets/manifest.json`](assets/manifest.json) |

Adding a program means adding two markdown files (one per locale) with the same
`product:` value, and a price under that key in `pricing.ts`. Nothing else.

### Writing the Arabic

The Arabic is not a translation and should not become one. Both locales are written
from the same brief by someone writing in that language. The Arabic articles cover
different topics from the English ones on purpose — training during Ramadan is a real
Arabic search intent with no English equivalent, and translating the English set would
have produced ten articles nobody searches for.

---

## Images

`assets/manifest.json` holds every slot with its exact path, ratio, pixel dimensions,
a full art-direction prompt, and a recorded reason for its source:

- **generate** — brand compositions and textures, made by `scripts/generate-images.mjs`
  behind a provider adapter (`local` by default; `openai` and `replicate` are stubbed
  at correct request shapes).
- **stock** — licensed API only. `scripts/source-stock.mjs` queries Openverse for CC0,
  Public Domain Mark and CC BY, downloads and self-hosts the file, and records the
  photographer, licence and URL in [`assets/CREDITS.md`](assets/CREDITS.md). Nothing is hotlinked.
- **shoot** — anything showing a real person's result. These are **blocked** and render
  as flagged flat blocks. The brief is in [`docs/SHOT-LIST.md`](docs/SHOT-LIST.md).

`scripts/optimize-images.mjs` crops each master to its declared ratio, emits AVIF and
WebP responsive sets, and writes a typed map with LQIP blur data to
`src/assets/images/generated.ts`.

An unfilled slot is not a bug. It renders as a neutral block at the correct ratio with
no layout shift, and it is flagged in `CREDITS.md`.

---

## Security

- No key, token or secret is committed. `.gitignore` covers `.env*` and the Worker
  reads secrets only from env bindings.
- Calculators run entirely in the browser. Body measurements are never transmitted.
- Webhook signatures are compared in constant time.
- Session cookies are `HttpOnly; Secure; SameSite=Lax`.
- `POST /auth/request` returns an identical response whether or not the address exists.

---

## Legal

`/terms`, `/privacy` and `/refund-policy` ship in both locales because payment
providers require them for account approval — without them the site cannot take money.

Copy is written to avoid the two things that generate chargebacks: specific weight-loss
promises and result timelines. Calorie outputs are floored at 1,200 kcal for women and
1,500 for men, below which the tool declines to print a number and points at a
professional. Every calculator result carries a one-line note that it is an estimate.
