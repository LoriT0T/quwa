# Round 4 — critique

Raw: `out/round-4/audit.json`. **Console errors: 0. Structural/a11y issues: 0.**

## Confirmed fixed from round 3

| | round 3 | round 4 |
|---|---|---|
| Home accent spacing | 1 per 932px | 1 per **1253px** |
| Product accent spacing | 1 per 1960px | 1 per **2958px** |
| Dominant size, product page | 14×42 | **16×50** |
| `--fs-stat` at 390 | 61.6px | **56px** |
| Hero height at 390 | 1014px | **784px** — inside the 844px viewport, both locales |
| Gap 16 vs 12 | 32 vs 79 | 60 vs 67 |

---

### 1. The calculator page ran 14px ahead of 16px

`14×24 · 12×21 · 16×20`. Every other template had flipped to 16-dominant; the tool
template had not, because its field labels, hints, segmented controls and result rows
were all at `--fs-small`.

The tool pages are the acquisition engine — the highest-intent page a stranger reaches
from search — and they were the smallest-set type on the site.

**Fixed:** field labels, segmented control labels, result row labels and the percentage
table moved to `--fs-body`. Hints moved from 12 to 14.

### 2. The blog index ran 12px at 61 uses

Ten article cards × (date + reading time + 2–3 tags) at `--fs-eyebrow`. 12px is an
eyebrow size, not a metadata size, and the index is a page people read rather than scan.

**Fixed:** dates, reading times and tags moved to `--fs-small`, tag padding raised
from 2px to 4px to match.

### 3. One hand-typed measure survived the round 2 sweep

`.plans { max-inline-size: 900px }` on the membership page — the last raw pixel measure
on the site, and the only max-width outside the 448 / 672 / 1280 set.

**Fixed:** `calc(var(--measure-card) * 2 + var(--space-4))` — two card measures and the
gap between them, which is what the number was.

### 4. Gap 12 was still marginally ahead of gap 16

`12×67 · 16×60`. Closer than round 3 but still the wrong way round against joinladder's
`16×48 · 12×8`.

**Fixed:** email capture rows, tool sidebars, section heads, CTA blocks and the
calculator grid moved from `--space-3` to `--space-4`. Round 5 measures `16×84 · 12`
on the home page — 16 now leads.

### 5. `Free` labels on the tools index spent accent on a word

Eight tool cards each carrying an accent-coloured `FREE` label. That is a category
label, not an action or an active state.

**Fixed:** `--c-muted`.
