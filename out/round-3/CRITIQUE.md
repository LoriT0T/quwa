# Round 3 — critique

Raw: `out/round-3/audit.json`.

**Console errors: 0. Structural/a11y issues: 0. Functional flow: passes, currency verified.**

## Confirmed fixed from round 2

| | round 2 | round 3 |
|---|---|---|
| Dominant font size | 12×51 | **16×49** — 16 is now the body size |
| Distinct max-widths | 6, two of them fractional | **3** — 672 / 1280 / 448 |
| h2 / display at 390 | 30.26 / 39.15 | **30 / 36** exactly |
| Home sections with imagery | 2 of 9 | 4 of 9 |
| Currency switching | untested | verified end to end |
| ar / en page-height parity | — | within 5% on all five templates |

---

### 1. The home page spent its accent roughly twice over

Eight accent surfaces on a 7456px page — one per **932px**. `REFERENCE-SPEC` §3.3:
joinladder spends its accent eight times across 15512px, one per **1940px**.

Enumerated: skip link, hero CTA, `New` badge, membership section CTA, `Best value`
badge, price-card CTA, closing CTA, newsletter submit. The membership section carried
**two** accent-filled CTAs pointing at the same destination.

The product page, measured on the same run, was already on budget: 3 surfaces over
5881px = one per 1960px.

**Fixed:** the membership section CTA became secondary (the price card below it holds
the primary action), and the newsletter submit became secondary. One primary accent
action per section.

### 2. The dominant gap was 12px; the reference's is 16px

Measured `12×79 · 8×60 · 16×32`. `REFERENCE-SPEC` §3.1: joinladder's gap distribution is
`16×48 · 12×8 · 8×2` — 16 dominant by six to one. Both values are on the 4px grid, so
neither is wrong; but the rhythm we said we were taking is 16.

**Fixed:** card bodies, tool tiles, value-prop blocks and proof cards moved from
`--space-3` to `--space-4`.

### 3. `--fs-stat` produced 61.6px at 390

Same clamp defect as round 2 #4, missed on the stat token: `1.9rem + 8vw` evaluates to
61.6 at 390, above the 3.5rem floor, so mobile never landed on the token value.

**Fixed:** `clamp(3.5rem, 1.2rem + 8vw, 7.5rem)` → 56 at 390, 120 at 1440.

### 4. The product page still had 14px ahead of 16px

`14×42 · 16×40 · 12×33`. The home page had flipped but the product template had not.

**Fixed:** the product meta row, sample-week focus lines and the rating figure moved to
`--fs-body`.

### 5. The imagery added in round 2 was desktop-only

`.tools-media` and `.member-media` were `display: none` below 1024. The brief assumes
short-form social video traffic, so phones dominate — we had added imagery to the
viewport that needed it least.

**Fixed:** both render at every width.

### 6. The hero overshot the fold on a phone

Measured 1014px at 390 against an 844px viewport. The `min-block-size:
calc(100svh - var(--header-h))` floor was correct, but the content exceeded it — a 4:5
hero image is 488px tall at 390 before any copy.

**Fixed:** the hero image is 16:10 and capped at 34svh below 1024, and 4:5 from the
point the grid becomes two-column. Hero padding and grid gap reduced on mobile.

### 7. The value-prop rule was accent-coloured

Four 2px accent rules above the value props, which is decoration rather than a call to
action or an active state.

**Fixed:** `--c-line-strong`.

---

## Carried into round 4

- Verify the accent budget lands near one per 2000px
- Verify 16 stays dominant on every template, not just home
- Verify the hero fits the fold at 390 in both locales
