# Round 1 — critique

Method: `tools/audit.mjs` runs the same computed-style sweep used on the references
(`tools/extract.mjs`) against our own pages at 390 / 768 / 1024 / 1440, in both
locales, and screenshots 390 and 1440 full-page. Numbers below are diffed against
`docs/REFERENCE-SPEC.md`. Raw data: `out/round-1/audit.json`.

**Console errors: 0. Functional flow: passes end to end.** Everything below is structure.

---

### 1. The Arabic root font-size multiplier moved the entire type scale off-token

`--font-scale: 1.04` on `:root[lang="ar"]` scaled the rem basis, so measured Arabic
sizes were **14.56 / 12.48 / 16.64 / 20.8 / 18.72 / 37.44 / 62.4 / 124.8** — not one
value on the scale.

`REFERENCE-SPEC` §2 lists exactly this as rpstrength's anti-pattern: *"12 distinct font
sizes including fractional ones: 16.8, 15.6, 19.2, 22.5. These are un-tokenised; they
are the output of percentage scaling on top of a base."* We shipped the thing we wrote
down not to copy.

**Fixed:** `--font-scale` deleted. The optical correction is now `font-size-adjust: 0.546`
on the Arabic root, measured rather than guessed — at 200px with both faces loaded,
Inter's x-height is 109.18px (ratio 0.546) and IBM Plex Sans Arabic's is 103.20px
(ratio 0.516), a 5.8% difference. `font-size-adjust` corrects the glyph and leaves the
rem basis alone.

### 2. The Arabic container measured 1331px against a spec of 1280px

Same root cause: `--container: 80rem` × 1.04. Every spacing token went with it —
`24 → 24.96`, `12 → 12.48`, `8 → 8.32`. The two locales were on different grids.

**Fixed** by #1. Both locales now measure 1280.

### 3. `--space-section` never reached its declared value

Token: `clamp(4rem, 8vw, 8rem)`. At 1440, `8vw = 115.2px`, below the 8rem cap — so the
cap was unreachable at any viewport under 1600. Measured section padding: **115.2px**.
`REFERENCE-SPEC` §6 justifies 128 against joinladder's measured 128 desktop.

**Fixed:** `clamp(4rem, 8.9vw, 8rem)` → 128.16 at 1440 (clamps to 128), 64 at 390.

### 4. `--space-section-tight` had the same defect

`clamp(3rem, 5vw, 6rem)` measured **72px** at 1440 against a spec of 96.

**Fixed:** `clamp(3rem, 6.7vw, 6rem)` → 96.5 at 1440, 48 at 390.

### 5. 14px was the most-used size on the site; the references anchor on 16

Measured home, 1440: `14×58 · 12×50 · 16×20 · 20×17 · 18×10 · 36×9`.

`REFERENCE-SPEC` §3.1: joinladder's 16px carries **160 of 277** text uses, and 16 is
body on all three quality references — unanimously. Ours carried 20 of ~157, with 14px
dominant. That is bodyboost's profile (`14×18 · 16×6 · 12×4`), not the reference's —
we had drifted toward the site we are supposed to be beating.

**Fixed:** raised to `--fs-body` in the twelve highest-frequency prose contexts — card
descriptions, feature lists, value props, tool summaries, blog descriptions, recipe
ingredients and methods. 14px is now reserved for metadata and nav.

### 6. The hero did not own the fold

Measured 819px tall inside a 900px viewport at 1440. `REFERENCE-SPEC` §1.8 records
jeffnippard's hero as `min-h-svh` — exactly one viewport, with 39 words in it.

**Fixed:** `min-block-size: calc(100svh - var(--header-h))`, vertically centred.

### 7. The proof band was the least dense section, not the densest

Words per 1000px, measured on our home page at 1440:

| section | words | height | words/1000px |
|---|---|---|---|
| hero | 44 | 819 | 54 |
| free tools | 96 | 683 | 141 |
| programs | 87 | 1040 | 84 |
| value props | 105 | 514 | **204** |
| **proof** | 168 | 1298 | **129** |
| membership | 102 | 738 | 138 |

`REFERENCE-SPEC` §1.12: jeffnippard's proof block runs **441 words/1000px, 6× denser
than any other section** — prose replaces the grid in exactly one place, where a
stranger's claim has to be believed. Ours was *less* dense than the value props.

Cause: three separate `<Proof>` components stacked, each a one-item grid, tripling the
height for the same words.

**Fixed:** `<Proof>` takes an `also` array so one 3-column grid carries proof for three
different products, and card padding tightened.

### 8. Touch targets below 44px on the viewport that matters most

`menu button 40px`, `cart link 40px`, `locale switch 40px`, `currency select 40px` — all
flagged at 390 in both locales. The brief assumes short-form social video traffic, so
phones dominate.

**Fixed:** all four raised to 44px.

### 9. The currency switcher was unreachable on a phone

At 390 the header switcher sits inside `.hide-sm { display: none }` and the only other
instance is inside the collapsed mobile nav. A visitor on a phone cannot change currency
without first finding the menu. Definition of Done item 4 requires switching to work.

**Fixed:** a second switcher in the footer, labelled, present at every width.

### 10. Accent spent roughly twice its budget

Measured 9 accent-coloured surfaces over a 7488px page ≈ one per 832px.
`REFERENCE-SPEC` §3.3: joinladder uses its accent 8 times across 15512px ≈ **one per
1940px**, and §6 says ours is "reserved for the primary CTA and the active state".

**Fixed:** rating bars — which are data, not calls to action — moved off the accent.

### 11. The home page carried one image across nine sections

Measured `imgs: 1` on the hero and `0` on every other section. jeffnippard's home page
carries 82 images, joinladder's 61. `REFERENCE-SPEC` §1.12 records that on the
reference "images and space carry the argument" everywhere except the proof block.

Cause: ten stock slots were unfilled because the Openverse API began returning 401 to
unauthenticated clients mid-build.

**Fixed:** a second licensed provider (Wikimedia Commons, no key, machine-readable
licence and author metadata) added to `scripts/source-stock.mjs`, with a rejection
filter for catalogue records — accession numbers, museum objects, food replicas — after
a first pass returned a 1901 railway journal for "weight plates" and a ceramic museum
bowl for "salad bowl". 11 of 12 slots are now filled and credited in `assets/CREDITS.md`.

### 12. `program-lean-recomposition` could not be filled and is now flagged rather than wrong

Three licensed candidates were rejected on visual review: a restaurant dining room, a
museum ceramic accession, and Marines grilling chicken at a field barbecue. None is a
plate of food a dieting person would eat.

**Not fixed — deliberately.** The slot is marked `blocked` in `assets/manifest.json`
with the reason recorded, and renders as a neutral block at the correct 4:3 ratio with
no layout shift. Per the brief: *"If you cannot source it, use a flat neutral block at
the correct ratio and flag the slot."*

---

## Carried into round 2

- Verify both locales now measure identical containers and on-scale type
- Verify 16px becomes the dominant size
- Verify section padding measures 128 / 96 at 1440
- Re-measure proof density against the 441 words/1000px target
- Confirm the image count per section
