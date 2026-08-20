# REFERENCE-SPEC.md

Measured, not described. All numbers come from a Playwright computed-style sweep
(`tools/extract.mjs`) run 2026-08-20 at 1440×900 and 390×844 against the live sites.
Raw output: `out/reference/extract.json`. Full-page screenshots: `out/reference/*.png`.

Notation: `value×count` = the computed value and how many rendered, visible elements used it.

---

## 1. jeffnippard.com — PRIMARY DESIGN AND STRUCTURE REFERENCE

Shopify, custom theme. Document height **6625px desktop / 8093px mobile**.

### 1.1 Type scale

| px | desktop uses | mobile uses | role in situ |
|----|----|----|----|
| 10 | 72 | 68 | eyebrows, nav, meta, attribute rows (mono family) |
| 12 | 49 | 47 | secondary meta, prices, filter labels |
| 14 | 1 | 1 | one-off |
| 16 | 33 | 33 | body copy |
| 20 | 8 | 5 | card titles |
| 24 | 6 | 6 | sub-headings |
| 30 | 3 | 3 | section headings (small) |
| 36 | — | 5 | display (mobile) |
| 46.66 | 5 | — | display (desktop) |
| 48 | — | 1 | display (mobile, hero) |
| 69.47 | 1 | — | hero display (desktop) |
| 160 | 6 | 6 | the "100,000+" stat numerals |

**Distinct sizes actually load-bearing: 6** (10, 12, 16, 20/24, 30, display).
Ratios between adjacent steps: 10→12 = 1.200, 12→16 = 1.333, 16→20 = 1.250,
20→24 = 1.200, 24→30 = 1.250, 30→46.66 = 1.555. Not a clean modular scale —
a **1.2–1.25 body track with a discontinuous jump to display**.
Display does not scale from body; it is set independently.

The 160px stat numeral is identical at 390px and 1440px — it is a fixed graphic
element, not responsive type.

### 1.2 Weight distribution

`500×107 · 400×71 · 600×6`. No 700. No 800. The page is set almost entirely in
**medium (500)**, with regular for prose. Emphasis comes from size and colour, not weight.

### 1.3 Line height

`10/1.50×63 · 12/1.33×44 · 16/1.50×25 · 24/1.33×6 · 46.66/1.01×5 · 160/1.00×6`

Body and small text at **1.5**, mid-sizes at **1.33**, display at **1.00–1.01**.

### 1.4 Colour

Text: `rgb(28,28,28)×67` · `rgb(0,0,0)×54` · `rgb(255,255,255)×45` · `rgba(0,0,0,0.6)×10`
Surfaces >400px²: `rgb(255,255,255)×33` · `rgba(28,28,28,0.1)×26` · `rgb(79,85,73)×22` ·
`rgba(28,28,28,0.5)×15` · `rgb(0,0,0)×14` · `rgb(124,123,110)×7`

**Load-bearing colours: 4** — paper `#FFFFFF`, ink `#1C1C1C`, olive `#4F5549`,
warm grey `#7C7B6E`. Everything else is an alpha derivative of the ink.
One accent hue for the entire site.

### 1.5 Grid and margin

| | desktop 1440 | mobile 390 |
|---|---|---|
| outermost container | 1410px | 360px |
| implied page margin | 15px per side | 15px per side |
| repeated inner columns | 1046, 474, 452, 429, 403, 329, 313 | 358, 350, 340, 326, 324, 304 |
| declared max-widths | 403.2×5, 350×4, 414.72×2, 384, 640, 960, 737.28 | 403.2×5, 350×4, 414.72×2 |

The page margin does not change between 390px and 1440px — **15px at every breakpoint**.
The container is effectively full-bleed; the column widths do the composition.

### 1.6 Spacing

Padding: `2×60 · 8×46 · 10×30 · 20×26 · 50×18 · 15×14 · 7×10 · 16×8 · 12×2 · 32×2 · 48×2 · 100×2`
Gap: `20×138 · 4×104 · 6×72 · 10×62 · 12×36 · 16×26 · 2×24 · 8×24 · 5×14 · 15×10`

Two interleaved rhythms:
- **component rhythm, base 4**: 4, 8, 12, 16, 20 (gap 20 is the single most-used value on the site, 138 uses)
- **section rhythm, base 10**: 10, 20, 50, 100 — i.e. 0.625rem / 1.25rem / 3.125rem / 6.25rem

**Section vertical padding = 50px** (18 uses), doubling to 100px twice.

### 1.7 Border radius

`3px×27 · 9999px×15 · 6px×13 · 16px×12 · 8px×12`

Cards and images at **3px** — nearly square. Buttons and chips at **full pill**.
The contrast between a 3px card and a pill button is the whole button treatment.

### 1.8 Section map — desktop, top to bottom

| # | top | height | imgs | links | words | heading |
|---|---|---|---|---|---|---|
| 0 | 0 | 900 | 16 | 3 | 39 | Take the Guesswork Out of Building Muscle |
| 1 | 900 | **102** | 0 | 0 | 0 | *spacer* |
| 2 | 1002 | 792 | 6 | 7 | 148 | Training Programs (carousel) |
| 3 | 1794 | **102** | 0 | 0 | 0 | *spacer* |
| 4 | 1896 | 980 | 8 | 2 | 68 | Training Programs Built on Science |
| 5 | 2876 | **102** | 0 | 0 | 0 | *spacer* |
| 6 | 2978 | 557 | 20 | 5 | 246 | Transformations / testimonials |
| 7 | 3535 | **102** | 0 | 0 | 0 | *spacer* |
| 8 | 3637 | 948 | 8 | 2 | 64 | A Smarter Approach to Nutrition |
| 9 | 4586 | 166 | 0 | 0 | 3 | marquee |
| 10 | 4752 | 330 | 0 | 0 | 39 | By The Numbers |
| 11 | 5082 | **102** | 0 | 0 | 0 | *spacer* |
| 12 | 5184 | 812 | 24 | 3 | 63 | Explore More |
| 13 | 5996 | 629 | 0 | 10 | 63 | footer |

Also: a fixed 64px floating nav pill at y=836, and the hero is `min-h-svh` — exactly one viewport.

**The pacing device is a dedicated 102px empty spacer between every content section.**
Sections themselves carry 0 padding; all inter-section air is one repeated element.
Content sections land in two heights: **~800–980px** (feature blocks) and **~330–560px** (proof/stat blocks).

### 1.9 Product page anatomy — element order on the grid card

1. corner badge (`NEW`) — conditional
2. `QUICK VIEW` overlay affordance
3. product image (3px radius)
4. title, 20px
5. price, 12px, plain, no strikethrough, no "from"
6. numeric rating — `5.0`, `4.61`, `4.7` — **the decimal is shown, not rounded to stars**
7. attribute row 1: `Experience:` → `ALL EXPERIENCES` / `INTERMEDIATE–ADVANCED`
8. attribute row 2: `Goal:` → `GAIN MUSCLE` / `GAIN MUSCLE & GAIN STRENGTH`

Attributes are on the card, before the click. The card answers "is this for me?" without a page load.

### 1.10 Where testimonials sit and what they are attached to

Section 6, at 3637px of 6625px — **55% down the page**, after the product grid and after
the "built on science" rationale. Not at the top, not at the bottom.

Each testimonial carries: BEFORE image, AFTER image, full name, a 40–60 word quote naming
specific program mechanics ("options for both 4 and 5 days a week", "inclusion of top sets",
"exercise substitution list"), **the program name**, and a `VISIT PROGRAM` link.

**Proof is a link into the specific product it proves.** Five testimonials, five programs.
This is the single most valuable structural idea on the site.

Directly under the `100,000+ Transformations` stat, at 10px:
"Results vary based on factors such as training consistency, nutrition, and individual differences."
The disclaimer is adjacent to the claim, not in the footer.

### 1.11 Pricing, trial, guarantee

One-time programs: `$49.99` ×5, `$39.99` ×1. Flat price, no anchor, no discount theatre.
The trial belongs to the *subscription* products only — `TRY 7 DAY TRIAL` appears in the
secondary hero (y≈900) and twice inside Explore More (y≈5184). It never appears next to a
one-time program price. No money-back guarantee is stated anywhere on the home page.

### 1.12 Copy strategy

Words per 1000px of section height:

| section | words | height | words/1000px |
|---|---|---|---|
| hero | 39 | 900 | **43** |
| programs grid | 148 | 792 | 187 |
| built on science | 68 | 980 | **69** |
| testimonials | 246 | 557 | **441** |
| nutrition | 64 | 948 | **68** |
| explore more | 63 | 812 | 78 |
| footer | 63 | 629 | 100 |

Every marketing section runs at 43–78 words/1000px. **The proof section runs 6× denser than
any other.** Prose replaces the grid in exactly one place: where a stranger's claim has to be
believed. Elsewhere, images and space carry the argument.

Claim phrasing is hedged and mechanism-based, never outcome-based:
"designed to help you", "make progress more predictable", "there's a program for you",
"have helped thousands of lifters achieve their goals". No number of pounds, no timeline.

---

## 2. rpstrength.com — MONETIZATION REFERENCE

Document height 4473px desktop / 3994px mobile.

- **Nav order is the business model**: `HYPERTROPHY APP · DIET COACH APP · 1:1 COACHING ·
  STORE · FREE CONTENT · RP ATHLETES · ABOUT US · SIGN IN · CART`.
  Two subscriptions, then coaching, then the one-time store **fourth**, then the free funnel.
- `FREE CONTENT` is a top-level nav item — the organic acquisition layer is promoted to
  the same rank as the products.
- Structure is a **500px repeating band** ×4 (tops at 61, 569, 1077, 1585 — 8px between),
  one product per band. Then 700px video, 92px heading, 642px reviews, 328px Instagram,
  320px newsletter, 299px footer.
- Reviews are attributed by **product**, not by person: "RP Hypertrophy App User" ×3,
  "RP Diet App User" ×2. Proof is segmented per SKU even when anonymous.
- Newsletter: one email input + `SUBSCRIBE`, in a dedicated 320px band immediately above the footer.
- Footer exposes the compliance layer: Privacy Policy, Terms of Service, **Refund Policy**,
  Do Not Sell My Personal Information, Help Center.

**Anti-patterns, measured — do not copy:**
- 12 distinct font sizes including fractional ones: `16.8, 15.6, 19.2, 22.5, 40, 25`.
  These are un-tokenised; they are the output of percentage scaling on top of a base.
- **Four typefaces** on one page: Roboto Condensed×27, Figtree×17, Funnel Display×11, Khand×3.
- Container 1200px declared but 1152px measured at 1440 → 144px total margin.

## 3. joinladder.com — SUBSCRIPTION REFERENCE

Document height **15512px desktop / 14474px mobile** — 2.3× jeffnippard, 6.2× the competitor.
A single long-form sales page, not a storefront.

### 3.1 Type, weight, spacing — the cleanest system of the four

Sizes: `16×160 · 18×48 · 36×32 · 14×10 · 60×8 · 20×6 · 24×6 · 48×4`
Mobile: `16×170 · 18×44 · 30×28 · 20×6 · 36×4 · 14×3 · 48×3`

**Four sizes carry 94% of all uses**: 16 body, 18 lead, 36/30 section heading, 60/48 display.
Ratios: 16→18 = 1.125, 18→36 = 2.000, 36→60 = 1.667. There is deliberately **nothing between
18 and 36** — the gap is the hierarchy.

Weights: `400×200 · 800×52 · 700×22 · 500×3`. A **barbell distribution** — regular for
everything, extra-bold for headlines, effectively nothing in between.

Line height: `16/1.50×160 · 18/1.56×47 · 36/1.11×32 · 60/1.00×8 · 48/1.00×3`.

Padding: `8×56 · 16×50 · 32×27 · 24×12 · 224×6 · 12×4 · 64×3 · 128×3 · 48 · 96 · 192 · 300`
Gap: `16×48 · 12×8 · 8×2 · 24×2 · 32×2`

**A pure 8px scale**: 8, 16, 24, 32, 48, 64, 96, 128, 192, 224. Base unit = 8, no exceptions.
Section padding 128 desktop / 64 mobile.

### 3.2 Grid

Container `1280×10` declared, **1248px measured at 1440** → 48px page margin per side.
Mobile 358 at 390 → **16px page margin**.

`448px×11` is the single most-repeated max-width across all four reference sites. It is the
card width and the prose measure. Secondary measures: 672×3, 576×3, 1024×3, 384×3.

### 3.3 Colour

Text `rgb(250,250,250)×204 · rgb(14,14,14)×40 · rgb(188,188,188)×16`
Surface `rgb(38,38,38)×39 · rgb(233,233,233)×10 · rgb(14,14,14)×8 · rgb(230,255,0)×7 · rgb(36,36,36)×7`

**Load-bearing: 4** — ink `#0E0E0E`, surface `#262626`, paper `#FAFAFA`, accent `#E6FF00`.
The acid yellow appears 7 times as a surface and once as text, on a 15512px page.
**The accent is rationed to roughly one use per 2000px.**

Radius: `8px×44 · full×38 · 12px×19`.

### 3.4 Monetization architecture — the part worth taking

1. Announcement bar, 45px, one campaign link.
2. Sticky header, 52px: `FREE WORKOUT OF THE DAY · SHOP · CAREERS · FIND YOUR PLAN`.
   **The free product is the first nav item. The CTA is a quiz, not "Buy".**
3. Hero CTA `FIND YOUR PLAN`, and directly beneath it, in small type:
   `No Credit Card To Start • Cancel anytime`. **Risk reversal is welded to the button.**
4. `FEATURED ON` press strip.
5. Four value props, ~10 words each.
6. Mechanism sections, each ending in its own identical `FIND YOUR PLAN` CTA.
   The CTA repeats **8 times with identical wording**.
7. 23 program cards — each is `Coach <name>` + a one-word program name + one line of
   positioning ("Grow Your Glutes & Reshape Your Body"). The catalogue is people, not PDFs.
8. Quiz: "Receive a personalized recommendation based on your training goals".
9. Testimonials, first name + last initial, 12–25 words each, no images.
10. FAQ accordion with `SHOW ALL`. FAQ answers do competitor comparison and objection
    handling, not logistics.
11. Closing CTA: "Start your free 7 day trial now."
12. Footer promotes `Pricing` and `Free Workout Of The Day` as first-class pages.
13. A fixed 64px chat affordance bottom-right, persistent.

Trial terms are stated **three separate times**: under the hero button, in the FAQ, and in
the closing CTA. Pricing lives on its own page, not on the home page.

---

## 4. bodyboost.rmz.gg — THE SITE WE ARE BEATING

Document height **2494px desktop / 2508px mobile — a 14px difference.**
There is no desktop layout. It is a phone page stretched to 1440px.

- Container 1232px at 1440 (Tailwind `max-w-7xl` + `px-4`), 358px at 390.
- **Five distinct font sizes on the entire site**: `14×18 · 16×6 · 12×4 · 18×2 · 24×2`.
  The largest type anywhere is **24px**. There is no display type, no hero headline scale.
- One family, `Baloo Bhaijaan 2`, for both scripts. Weights 400/500/600/700.
- Colour: white, `#111111`, `#F8F9FA`, and three greys in `oklch()`. **Zero accent colour.**
  Nothing on the page is coloured to direct attention.
- Radius: `8×7 · 16×7 · 6×5 · 12×4` — four radii, none dominant, no rule.
- Padding mixes `2, 4, 5, 8, 10, 12, 16, 24, 32, 48, 50, 64` — 4px and 5px both present, so
  there is no base unit.
- Structure is three blocks: 65px header → one 1857px section (hero + product grid + 3 trust
  icons + testimonials, all in a single wrapper) → 492px footer.
- Two products: `15.99` and `19.00`. **The currency glyph does not render in the text layer** —
  there is no currency code, no ISO symbol, no indication of what is being charged.
- Arabic only. No language switcher, no `hreflang`, no `/en`.
- 52 words of body copy above the footer.
- The customer-reviews heading reads `تقاييم العملاء`. The correct Arabic is `تقييمات العملاء`.
  A typo sits in a section heading on the highest-traffic page.

---

## 5. WHAT TO STEAL / WHAT TO LEAVE

### Steal — structure, hierarchy, pacing, pricing presentation

| # | Taken from | The move | Where it lands in QUWA |
|---|---|---|---|
| 1 | jeffnippard | Testimonial carries the product name and links into that product page | `<Proof>` requires a `program` prop; a testimonial with no product cannot be rendered |
| 2 | jeffnippard | Disclaimer adjacent to the claim it qualifies, at the smallest size | `results-vary` note sits inside the stat block, not the footer |
| 3 | jeffnippard | One fixed inter-section spacer (102px) as the only pacing device | `--space-section`, applied by one layout primitive, never ad hoc |
| 4 | jeffnippard | Display type set independently of the body track, not derived from it | `--fs-display` is its own clamp, not a scale step |
| 5 | jeffnippard | Card answers "is this for me?" pre-click via attribute rows | Program cards carry `level` + `goal` + `daysPerWeek` |
| 6 | jeffnippard | Numeric rating shown to 2 decimals rather than star art | `4.72` not `★★★★★` |
| 7 | rpstrength | Free content promoted to a top-level nav item | `Free Tools` is nav item #1 |
| 8 | rpstrength | Nav order mirrors the revenue ladder | Free Tools → Programs → Membership → Blog |
| 9 | rpstrength | Proof segmented per SKU even when anonymous | Every testimonial is tagged to a program or to the membership |
| 10 | rpstrength | Compliance links visible in the footer | Terms, Privacy, Refund Policy in both locales |
| 11 | joinladder | Four type sizes carry 94% of uses; nothing between lead and heading | 16 / 18 / 36 / 60 with a deliberate empty band |
| 12 | joinladder | Barbell weight distribution — regular and heavy, nothing between | 400 and 700 only |
| 13 | joinladder | Pure 8px spacing base, no exceptions | `--space-1..14` are all multiples of 4, section rhythm on 8 |
| 14 | joinladder | 448px prose/card measure | `--measure-card: 448px`, `--measure-prose: 672px` |
| 15 | joinladder | Accent rationed to ~1 use per 2000px of page | Accent is reserved for the primary CTA and the active state |
| 16 | joinladder | Risk reversal welded directly under the CTA button | `7-day free trial · Cancel anytime` renders inside `<CTA>` |
| 17 | joinladder | Identical CTA wording repeated ~8× down a long page | One `cta.primary` string, reused |
| 18 | joinladder | Trial terms restated three times on the page | Hero, pricing table, closing block |
| 19 | joinladder | Pricing gets its own page | `/[lang]/membership` |
| 20 | joinladder | FAQ handles objections, not logistics | Per-program FAQ answers "will this work for me", not "how do I download" |

### Leave

- **Palette.** Olive `#4F5549`, red `#EC0915`, acid yellow `#E6FF00` are all identifying marks.
- **Typefaces.** Roboto Condensed, Funnel Display, Khand, EK Modena, SF Pro, Baloo Bhaijaan 2.
- **Wordmarks and photography.** All of it.
- **Program names.** `Powerbuilding System`, `Pure Bodybuilding`, `Min-Max`, and Ladder's 23
  coach-program names are trademarks in use.
- **Copy.** Including "Take the Guesswork Out of Building Muscle" and "FIND YOUR PLAN".
- **rpstrength's type system.** 12 sizes, 4 families, fractional values.
- **jeffnippard's 10px type.** The device (tiny tracked eyebrow) is worth taking; 10px is not.
  We take it at 12px, the smallest size that survives an accessibility audit.
- **jeffnippard's 15px page margin at 1440px.** Full-bleed suits an image-led brand with a
  photo budget. We have no photo budget, so we use joinladder's 48px margin and a real container.
- **Before/after photography as the primary proof device.** We have no shoot. Placeholder slots
  are flagged in `docs/SHOT-LIST.md` and the site ships proof that does not depend on them.

---

## 6. QUWA TOKENS — each justified against a measured value

Implemented in `src/styles/tokens.css`. Rendered at `/[lang]/styleguide`.

### Type

| token | value | measured justification |
|---|---|---|
| `--fs-eyebrow` | 12px | jeffnippard runs eyebrows at 10px×72 and 12px×49. 12 is their second-most-used size and the smallest that passes an a11y review. |
| `--fs-body` | 16px | 16px is body on all three quality references: jeffnippard×33, joinladder×160, rpstrength×5. Unanimous. |
| `--fs-lead` | 18px | joinladder 18×48 sits directly above body; ratio 1.125. |
| `--fs-card-title` | 20px | jeffnippard card titles 20×8; joinladder 20×6. |
| `--fs-h3` | 24px | jeffnippard 24×6, joinladder 24×6. |
| `--fs-h2` | clamp(30px, 4vw, 36px) | joinladder measured **exactly** 36 desktop ×32 / 30 mobile ×28. |
| `--fs-display` | clamp(36px, 7vw, 60px) | joinladder 60 desktop ×8 / 48 mobile ×3; jeffnippard 46.66 desktop / 36 mobile. Range spans both. |
| `--fs-stat` | clamp(56px, 12vw, 120px) | jeffnippard's stat numeral is 160px fixed at both viewports. We keep the device, make it fluid, and cap lower because our container is 1280 not 1410. |
| — | **nothing between 18 and 30** | joinladder's deliberate gap: 18→36 = ratio 2.000, with no intermediate step. This is the hierarchy. |

### Weight

| token | value | justification |
|---|---|---|
| `--fw-body` | 400 | joinladder 400×200 of 277 total. |
| `--fw-bold` | 700 | joinladder's barbell is 400/800. IBM Plex Sans Arabic ships no 800; 700 is the heaviest weight present in **both** families, so it is the heaviest weight that can look identical in `ar` and `en`. Barbell shape preserved, one step lighter. |
| — | no 500, no 600 for headings | joinladder uses 500 exactly 3 times in 277. jeffnippard's 500-dominant approach depends on a single family; ours must survive two. |

### Line height

`--lh-body: 1.5` — jeffnippard 16/1.50 and joinladder 16/1.50, independently identical.
`--lh-heading: 1.15` — joinladder 36/1.11, jeffnippard 24/1.33; 1.15 is chosen at the tight end because Arabic ascenders/descenders need more room than Latin at the same ratio.
`--lh-display: 1.0` — jeffnippard 46.66/1.01, joinladder 60/1.00 and 48/1.00.

### Space — base unit 4, section rhythm 8

`4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128`

joinladder's scale is exactly `8,16,24,32,48,64,96,128,192,224` with **zero** off-scale values.
jeffnippard runs a 4px component rhythm (gap 20×138, gap 4×104) over a 10px section rhythm
(50×18, 100×2). We take joinladder's discipline and jeffnippard's 4px component granularity.
`--space-section: clamp(64px, 8vw, 128px)` — joinladder measured 64 mobile / 128 desktop.
`--space-section-tight: clamp(48px, 5vw, 96px)` — for proof and stat bands, which measured
330–642px tall on both jeffnippard and rpstrength versus 792–980px for feature bands.

### Grid

| token | value | justification |
|---|---|---|
| `--container` | 1280px | joinladder declares 1280×10 and measures 1248 at 1440. bodyboost also uses 1280. rpstrength 1200. Majority. |
| `--page-x` | clamp(16px, 4vw, 48px) | joinladder measured 16px at 390 and 48px at 1440. Both endpoints taken directly. |
| `--measure-card` | 448px | `448×11` — the most-repeated declared max-width across all four sites. |
| `--measure-prose` | 672px | joinladder 672×3, the next step up in the same series (448 · 576 · 672). |

### Radius

| token | value | justification |
|---|---|---|
| `--r-card` | 12px | joinladder 12×19 for cards; 8×44 counts mostly small chips. |
| `--r-control` | 8px | joinladder 8×44 — the dominant radius on the cleanest reference. |
| `--r-pill` | 9999px | jeffnippard full×15, joinladder full×38. Buttons are pills on both. |
| `--r-media` | 4px | jeffnippard sets images at 3px×27 — near-square media against pill controls is the contrast that carries their button treatment. Rounded to 4 to stay on the base unit. |

### Colour — 4 load-bearing, matching the reference count exactly

All three quality references run **exactly 4** load-bearing colours. bodyboost runs 0 accents,
which is why nothing on its page directs attention. We run 4.

| token | value | justification |
|---|---|---|
| `--c-ink` | `#0B0E12` | Dark ground. joinladder `#0E0E0E`, rpstrength `#12100D`. Ours is cooler and distinctly not either. |
| `--c-surface` | `#161B22` | Raised card. joinladder uses `#262626`×39 as the card ground — a distinct step above the page, not a border. |
| `--c-paper` | `#F5F7FA` | Foreground. joinladder `#FAFAFA`×204, rpstrength `#F4F6F8`. |
| `--c-accent` | `#FF6B2C` | The one accent. Distinct in hue from olive `#4F5549` (h≈95°), red `#EC0915` (h≈356°), and acid yellow `#E6FF00` (h≈66°); ours is h≈18°. Contrast on `--c-ink` = 6.2:1, and `--c-ink` on `--c-accent` = 6.2:1, so it works as both text and button ground. |
| — | accent budget | joinladder uses its accent 8× across 15512px ≈ once per 1940px. Ours is reserved for the primary CTA and the active state only. |

Muted/border values are alpha derivatives of `--c-paper`, mirroring jeffnippard, whose entire
secondary palette is `rgba(28,28,28,α)` at α = 0.1 / 0.5 / 0.6 / 0.8.
