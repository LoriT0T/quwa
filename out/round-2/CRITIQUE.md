# Round 2 — critique

Re-measured after the round 1 fixes. Raw: `out/round-2/audit.json`.

**Console errors: 0. Structural/a11y issues: 0 (was 16). Functional flow: passes.**

## Confirmed fixed from round 1

| | round 1 | round 2 |
|---|---|---|
| Arabic type scale | 14.56 / 12.48 / 16.64 / 20.8 / 37.44 | 14 / 12 / 16 / 20 / 36 — identical to `en` |
| Arabic container | 1331px | 1280px |
| Section padding at 1440 | 115.2px | **128px** ×10 |
| Tight section padding at 1440 | 72px | **96px** ×7 |
| Proof density | 129 words/1000px | **243** — now the densest band on the page |
| Touch targets under 44px | 4 | 0 |
| Home sections with imagery | 1 of 9 | 2 of 9 |

---

### 1. 12px was still the most-used size, not 16

Measured home 1440: `12×51 · 14×42 · 16×37`. Three sizes within 14 uses of each other,
so no size was doing the work of "body".

Each reference has one clearly dominant size — jeffnippard `10×72`, joinladder `16×160`.
Ours had none, which is a weaker hierarchy than either.

**Fixed:** thirteen secondary-text contexts moved from `--fs-eyebrow` (12) to
`--fs-small` (14) or from 14 to `--fs-body` (16) — CTA terms, guarantee lines,
calculator notes, comparison table cells, membership billing lines, sidebar copy.
12px is now reserved for eyebrows, badges and dense metadata.

### 2. Two competing measure systems

Measured max-widths: `672 · 1280 · 448 · 605.63 · 726.75 · 545.06`.

The first three are the tokens from `REFERENCE-SPEC` §6. The fractional ones were
`ch`-based measures (`72ch`, `80ch`, `48ch`, `24ch`, `30ch`, `90ch`) scattered through
component styles — a second, undeclared measure system whose values move with the
typeface.

**Fixed:** every `ch` measure replaced with `--measure-prose` or `--measure-card`.
Round 3 measures exactly three: `672 · 1280 · 448`.

### 3. The announcement bar was the largest accent area on every page

Full-bleed `--c-accent` at the top of every route. `REFERENCE-SPEC` §3.3 records
joinladder's announcement bar as **black**, with the accent rationed to roughly one use
per 2000px.

**Fixed:** surface background, paper text, accent on hover only.

### 4. Display and h2 landed on fractional values at 390

Measured `30.26` and `39.15` against a spec of 30 and 36 — `REFERENCE-SPEC` §3.1 records
joinladder at exactly 36/30 desktop/mobile and 60/48 display.

Cause: in `clamp(min, preferred, max)` the minimum only applies when the preferred term
falls below it. `1.55rem + 1.4vw` evaluates to 30.26 at 390 — above the 1.875rem floor —
so the floor was dead code.

**Fixed:** `clamp(1.875rem, 1.5rem + 1.4vw, 2.25rem)` and
`clamp(2.25rem, 1.35rem + 3.3vw, 3.75rem)`. Round 3 measures exactly 30 and 36 at 390.

### 5. Only 2 of 9 home sections carried imagery

jeffnippard's home page carries 82 images across 8 content sections; joinladder 61.
Ours had the hero and the product grid, and nothing else.

**Fixed:** media added to the free-tools band and the membership band. 4 of 9 in round 3.
This remains the largest honest gap against the reference and it is a photo-budget
problem, not a layout one — see `DECISIONS.md` #14.

### 6. The audit's currency test was testing nothing

`selectOption` targeted `[data-currency-select]` first-match, which at 390 is the header
control inside `.hide-sm { display: none }`. The call was wrapped in `.catch(() => {})`,
so it failed silently and the assertion compared a value with itself.

**Fixed:** the test now drives the footer switcher. Verified independently:
`$129.99 → SAR 484`, persists across reload, `ar-SA` detects SAR and renders
`٤٨٤ ر.س.` in Arabic-Indic digits, `en-GB` detects `£101.99`.

---

## Carried into round 3

- 16px must become the single dominant size
- Accent budget on the home page
- Dominant gap value against the reference's 16
