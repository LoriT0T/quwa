# Round 5 — critique, and exit

Raw: `out/round-5/audit.json`. **Console errors: 0. Structural/a11y issues: 0.**

## State at exit

| page | dominant size | dominant gap | distinct max-widths | accent spacing |
|---|---|---|---|---|
| home | **16**×49 | **16**×84 | 448 / 672 / 1280 | 1 per 1259px |
| programs | **16**×46 | 12×101 | 448 / 672 / 1280 | 1 per 1471px |
| product | **16**×50 | 12×55 | 448 / 672 / 1280 | 1 per 2962px |
| membership | **16**×49 | **16**×36 | 448 / 672 / 1280 / 912¹ | 1 per 1194px |
| tool | **16**×29 | 8×42 | 448 / 672 / 1280 | 1 per 663px |
| tools index | 14×25 | **16**×36 | 448 / 672 / 1280 | 1 per 2492px |
| blog index | 14×63 | 8×38 | 448 / 672 / 1280 | 1 per 3789px |
| cart | 14×17 | 12×17 | 448 / 672 / 1280 | 1 per 1295px |

¹ `calc(var(--measure-card) * 2 + var(--space-4))` — token-derived, not hand-typed.

Arabic/English page-height parity across all eight templates: **−5% to +1%**.
Hero height at 390: **784px in both locales**, inside the 844px viewport.
Font sizes at 390 and 1440 land exactly on the scale in both locales; the fractional
values that appear at 768 and 1024 are the clamp interpolating between them, which is
what fluid type is.

---

## Two valid differences remain

### 1. The tool template's accent spacing is 1 per 663px against a target of ~1 per 2000px

Four accent surfaces on a 2653px page. **Not fixed, and here is the argument for not
fixing it:** the reference figure comes from joinladder, a 15512px long-form sales page
where the ratio measures how often a reader is interrupted while scrolling. A 2653px
utility page with one primary action cannot satisfy a per-pixel budget without either
removing its only CTA or padding the page — both of which would be worse than the
divergence.

The measurement also counts the skip link, which is positioned off-screen until focused
and is therefore never a visible accent surface. Excluding it, the real figures are:
product 1 per 5924px, membership 1 per 1591px, home 1 per 1510px, tool 1 per 884px.

Recorded in `DECISIONS.md` #16 rather than designed around.

### 2. The tools index and blog index are 14-dominant, not 16-dominant

`14×25` and `14×63`. Both are card lists where every card contributes 3–4 metadata
strings and one description, so metadata legitimately outnumbers prose. Raising the
metadata to 16 would flatten the distinction between a card's title, its description and
its date — the hierarchy would get worse, not better, in exchange for a better number.

The templates people actually read — home, product, membership, tool, programs — are all
16-dominant.

---

## Exit

Exiting at **round 5 of a maximum 5**, with **2 valid differences remaining**, which is
below the stated threshold of 3. Both are documented above with the reasoning for
leaving them, and both are recorded in `DECISIONS.md`.

To be plain about it: the exit is on the substantive criterion, not the round cap —
round 5 would have been the last round either way, but the difference count reached the
threshold in the same pass.

## What still diverges from the reference and cannot be closed by editing CSS

**Image density.** jeffnippard's home page carries 82 images across 8 content sections;
joinladder's carries 61. Ours carries 6 across 9. `REFERENCE-SPEC` §1.12 records that on
the reference "images and space carry the argument" everywhere except the proof block,
and that every marketing section runs at 43–78 words per 1000px because pictures are
doing the work. Ours averages 109 because they are not.

This is a photo-budget problem. Eleven of fourteen image slots are filled from licensed
public-domain and CC BY sources; one could not be filled with anything usable and is
flagged; two require a shoot and are blocked by design. Closing this gap needs an
Unsplash or Pexels key, or the shot list in `docs/SHOT-LIST.md`.

---

## Post-round: Lighthouse pass on the live site

Run after the five critique rounds, against `https://lorit0t.github.io/quwa/`, mobile
preset. Four defects found and fixed, none of them visible in the structural sweep:

1. **`--c-faint` failed WCAG AA at 3.85:1 in fourteen places.** The alpha values were
   chosen by eye. Recomputed against both grounds they actually sit on: `--c-faint` 0.42
   → 0.56 (5.29:1 on surface), `--c-muted` 0.62 → 0.74. Accessibility 97 → 100.

2. **Both font families were preloaded on every page** — about 130KB of unused woff2 per
   request. Now only the active locale's face is preloaded; the other family's
   `@font-face` rules still ship so a locale switch needs no extra round trip.

3. **`font-display: swap` cost 0.083 CLS on the Arabic templates.** The webfont arriving
   at ~1.3s reflowed the page, and Arabic fallback metrics diverge from IBM Plex Sans
   Arabic far more than Arial's do from Inter — the English templates shifted 0.014 for
   the same cause. `optional` declines to swap after a short block period. Verified under
   4× CPU throttling on a simulated 4G connection: CLS 0.000 on five templates, with the
   real fonts still rendering.

4. **Every internal link paid a 301.** GitHub Pages serves directory indexes, so
   `/quwa/en` redirects to `/quwa/en/`. Lighthouse attributed 757ms of LCP on `/en` and
   967ms on `/ar` to it. `localePath()` now emits the trailing slash, so canonicals,
   `hreflang` alternates, the sitemap and every internal link point at the URL that
   actually exists.

Two functional bugs also surfaced during the Arabic flow check, neither visible in the
English pass:

5. **Cart and checkout totals rendered in USD and then flipped to the detected currency.**
   Page scripts are emitted inside `<main>` and therefore execute *before* the layout's
   `app.ts`, so they read `data-currency` before it was set. `applyCurrency` now
   dispatches an event the money-rendering pages listen for.

6. **The product meta row was labelled `Format / Programs / Training minutes per day /
   Format`** — two rows sharing a label, and one borrowing the navigation string.

### Final measurements, 15 live pages, Lighthouse mobile

| | |
|---|---|
| Performance | 100 on 13 pages, 99 on 2 |
| Accessibility | **100 on all 15** |
| Best practices | **100 on all 15** |
| SEO | **100 on all 15** |
| LCP | 995ms – 2013ms |
| CLS | **0.000 on all 15** |
| TBT | **0ms on all 15** |
