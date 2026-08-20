# COMPETITOR-GAPS.md — bodyboost.rmz.gg

Audited 2026-08-20 via Playwright at 1440×900 and 390×844.
Raw: `out/reference/bodyboost-*.png`, `out/reference/bodyboost-*.txt`, `out/reference/extract.json`.

**What it is:** a two-product Arabic storefront on the `rmz.gg` hosted-store platform.
2494px tall on desktop, 2508px on mobile — a 0.6% difference, meaning there is no desktop
layout at all. Total body copy above the footer: 52 words. Total catalogue: 2 SKUs, 15.99 and 19.00.

Every gap below is a build item with an owner file. No gap is listed without one.

---

| # | Gap | Evidence | Revenue consequence | Build item |
|---|---|---|---|---|
| 1 | **No per-product landing page** | Both SKUs are cards in one grid with `أضف للسلة` inline. There is no `/product/*` route. | The only sales argument for a $19 product is a 20-word card. Nothing handles objections, so the visitor's only options are buy-on-impulse or leave. | `src/pages/[lang]/programs/[slug].astro` — hero, mechanism, what's inside, sample week, per-program proof, per-program FAQ, sticky CTA |
| 2 | **No email capture anywhere** | No form field of any kind on the page. Zero inputs outside the cart. | 100% of non-buying traffic is lost permanently. At a 2% conversion rate, 98 of every 100 visitors are unrecoverable. | `src/components/EmailCapture.astro` + `src/components/ExitIntent.astro` + calculator result gate |
| 3 | **No free tools** | No calculator, no quiz, no free content of any kind. | Nothing ranks for the high-intent informational queries that precede a fitness purchase, so there is no non-paid acquisition. | `src/pages/[lang]/tools/*` — 7 calculators, each its own indexed route with `SoftwareApplication` + `FAQPage` JSON-LD |
| 4 | **No bundles** | 2 SKUs, no combined offer, no cross-sell on either card. | Maximum order value is 19.00. Nothing can raise it. | `src/content/programs/*` with `type: bundle`, priced below the sum of components |
| 5 | **No order bump** | Cart is a drawer with a single line item and a checkout button. | No incremental margin at the highest-intent moment on the site. | `src/components/OrderBump.astro` in the cart drawer |
| 6 | **No subscription** | Both products are one-time PDF downloads. | Lifetime value is capped at one purchase, permanently. This is the structural gap; everything else is tactical. | `src/pages/[lang]/membership.astro` — monthly / annual, annual default, 7-day trial on annual |
| 7 | **No upsell after purchase** | Delivery is a download link. | The moment of peak trust produces no second transaction. | `src/pages/[lang]/thank-you.astro` — upgrade to membership with the purchase price credited |
| 8 | **Proof is a floating wall** | One block headed `تقاييم العملاء`, unattached to either product, no names, no dates. | Generic proof does not answer "will this work for me". It is decoration. | `src/components/Proof.astro` requires a `program` prop; unattached testimonials cannot render |
| 9 | **Typo in a section heading** | `تقاييم العملاء`. Correct: `تقييمات العملاء`. On the highest-traffic page. | Directly undercuts the trust the section exists to build, for an Arabic-first audience. | All Arabic copy written natively in `src/i18n/ar.ts`, reviewed as marketing Arabic |
| 10 | **No content layer** | No blog, no articles, no `/sitemap.xml` content beyond the two products. | Zero organic surface area. All traffic must be paid or social. | `src/content/blog/{ar,en}` — 10 native articles per locale |
| 11 | **Arabic only** | No language switcher, no `hreflang`, no `/en` route. | The entire English-speaking market is unaddressable. | Astro `i18n` with `/ar` and `/en`, `hreflang` alternates on every page, browser detection on first visit |
| 12 | **Currency is undeclared** | Prices render as `15.99` and `19.00`. The currency glyph is absent from the text layer; no ISO code appears. | A visitor cannot tell what they are being charged. Highest-friction possible moment. | `src/lib/currency.ts` — detection, manual switcher, `Intl.NumberFormat` per locale, Arabic-Indic numerals in `ar` |
| 13 | **No desktop layout** | 2494px vs 2508px between 1440 and 390. Container 1232 with the same single-column stack. | Desktop visitors see a phone page. | Mobile-first with real desktop composition at 768/1024/1440 |
| 14 | **No display typography** | Largest type on the site is 24px. Five distinct sizes total. | Nothing establishes hierarchy; every section reads at the same volume. | `--fs-display: clamp(36px, 7vw, 60px)` |
| 15 | **No accent colour** | Palette is white, `#111111`, `#F8F9FA` and three greys. Zero saturated values. | Nothing on the page directs the eye to a CTA. | `--c-accent: #FF6B2C`, rationed to primary CTA and active state |
| 16 | **No guarantee or risk reversal** | Refund policy exists as a footer link only; nothing appears near a price or a button. | The objection is loudest at the button and answered furthest from it. | Risk-reversal line renders inside `<CTA>`, adjacent to every price |
| 17 | **No privacy policy** | Footer has `سياسة الاسترجاع` and `الشروط والأحكام`. No privacy policy. | Stripe, Paddle and Lemon Squeezy all require one for account approval. This is an existential compliance gap, not a UX one. | `/terms`, `/privacy`, `/refund-policy` in both locales |
| 18 | **No structured data** | No Product, no FAQPage, no Organization, no BreadcrumbList. | Ineligible for price/rating rich results even on brand queries. | `src/components/Schema.astro` on every route |
| 19 | **No referral mechanism** | No share link, no code, no credit. | Every satisfied customer is a dead end. | `src/pages/[lang]/referral.astro` + `?ref=` capture |
| 20 | **No abandoned-cart recovery** | Cart is client-side with no identity attached. | The highest-intent non-buyers are unreachable. | Cart identity captured at the email gate; recovery handled by the email provider (stub adapter, documented) |
| 21 | **No sticky mobile CTA** | The add-to-cart button scrolls away and never returns. | On the viewport that dominates this category's traffic, the buy action is off-screen for most of the session. | `src/components/StickyCTA.astro` on every product route below the fold |
| 22 | **No trust signals near price** | No delivery time, no format, no page count, no device compatibility next to either price. | "تسليم فوري" appears once as an icon, 1200px away from the nearest price. | Product meta block: format, length, level, equipment, device — adjacent to price |

---

## The one gap that matters most

Items 1–5 and 7–22 are tactical and each is worth some percentage. **Item 6 is structural.**

A one-time PDF store has a fixed ceiling: revenue = traffic × conversion × 19.00, and the same
customer cannot be sold twice. Every business in this category that clears seven figures —
RP Strength, Ladder, MacroFactor — runs recurring access, and each one of them puts the
subscription **above** the one-time store in its own navigation. rpstrength.com lists
`HYPERTROPHY APP` and `DIET COACH APP` first and `STORE` fourth.

So QUWA's nav order is the ladder, deliberately: **Free Tools → Programs → Membership → Blog**.
Free tools first because that is the acquisition engine the competitor has none of; membership
third because it is the one-time buyer's next step, not the stranger's first step.
