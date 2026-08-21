# ASSET-INVENTORY.md

What the industry leaders actually ship, measured — and which of it we took.

Method: Playwright sweep of 12 sites, 2026-08-20, 1440×900, full scroll, pattern
detection against the rendered DOM. Raw: `out/industry/research.json`, screenshots
`out/industry/*.png`, text `out/industry/*.txt`.

Sites: drinkag1.com · huel.com · whoop.com · gymshark.com · athleanx.com ·
macrofactorapp.com · juggernautai.app · hevyapp.com · centr.com · freeletics.com ·
sweat.com · caliberstrong.com

---

## 1. Pattern adoption — how many of the 12 ship each device

| Pattern | Adoption | Sites |
|---|---|---|
| Numeric social-proof stats | **10 / 12** | ag1, huel, whoop, athleanx, macrofactor, juggernaut, hevy, centr, sweat, freeletics |
| Community / UGC block | **9 / 12** | ag1, huel, whoop, gymshark, macrofactor, juggernaut, hevy, centr, sweat |
| Sticky / fixed CTA | **8 / 12** | ag1, huel, whoop, gymshark, juggernaut, centr, freeletics, sweat |
| Video or motion demo | **7 / 12** | ag1, whoop, gymshark, athleanx, juggernaut, centr, freeletics |
| Science / evidence block | **6 / 12** | ag1, huel, whoop, athleanx, macrofactor, caliber |
| Founder or credibility story | **6 / 12** | ag1, gymshark, athleanx, hevy, centr, caliber |
| FAQ accordion | 5 / 12 | huel, whoop, gymshark, juggernaut, hevy |
| Free trial | 4 / 12 | whoop, macrofactor, juggernaut, sweat |
| Guarantee block | 3 / 12 | ag1, huel, athleanx |
| "How it works" steps | 3 / 12 | whoop, juggernaut, caliber |
| Before / after or results | 3 / 12 | athleanx, freeletics, caliber |
| Comparison table | 1 / 12 | ag1 |
| Plan-finder quiz | 1 / 12 | athleanx |
| Urgency / countdown | 2 / 12 | freeletics, sweat |

## 2. Structures worth copying, measured

**AG1** — 16,228px, 194 images, 3,149 words. The longest and densest page in the set.
Order: hero → product comparison table → goal-based routing → `Over 60,000 Satisfied
Customers and Counting` → third-party testing → value maths → `What People Are Saying`
(622px, 153 words) → featured products → FAQ (964px) → full nutrition facts (815px, 165
words). **The last two blocks are the densest on the page** — the same pattern
`REFERENCE-SPEC` §1.12 found on jeffnippard: prose replaces the grid exactly where a
claim has to be believed.

**Whoop** — 11,123px, only 40 images. Seven consecutive **519px benefit bands**, one per
capability, each with a single image and 3–8 words. A metronome. Compare rpstrength's
four consecutive 500px bands. Two independent sites converge on a ~500px repeating unit.

**Athlean-X** — closest analogue to us: a program store, not an app. 6,346px.
`STOP GUESSING. START MAKING GAINS.` → `SEE WHY TOP PERFORMERS FROM EVERY WALK OF LIFE
CHOOSE ATHLEANX` (4,546px — 72% of the page) → `PUTTING THE SCIENCE BACK IN STRENGTH`
(958px, 172 words) → ingredient-transparency block → `RESULTS THAT SPEAK FOR THEMSELVES`
→ equipment. CTA is `TAKE THE QUIZ` ×3.

**Juggernaut** — `Since 2009, Juggernaut has been your trusted training resource` (733px)
→ `How it works` (718px) → `Start Seeing Results` → rating claim → coupon → `Our
benefits` → `What our customers say` → articles → FAQ (811px).

**Hevy** — `Featured on` immediately under the hero: 320px, **2 words, 12 logos**. The
cheapest trust block in the set.

**Caliber** — 5,190px, 13 images, 482 words. `It's not you. It's the science.` →
personalisation → `SUCCESS STORIES` (1,314px — 25% of the page) → `The Caliber
Difference`. Proof gets a quarter of the page.

## 3. What we took, and what we changed to keep it honest

| # | Taken from | Device | Our version |
|---|---|---|---|
| 1 | Hevy, AG1, Whoop | Press logo bar under the hero | **`<Foundations>`** — the same 320px/2-word/logo-row shape, but citing the *methodology sources* the programs are built on rather than press we do not have. Fabricating press logos is a false claim, not a design choice. |
| 2 | Juggernaut, Whoop, Caliber | "How it works", 3 steps | **`<HowItWorks>`** — numbered, 4 steps, one line each |
| 3 | Athlean-X, Caliber, AG1 | Science / evidence block | **`<Evidence>`** — four named principles with what each one actually implies for programming |
| 4 | Juggernaut, Caliber, Gymshark | Founder / credibility | **`<Standard>`** — the editorial standard every program is held to. No invented founder, no invented credentials. |
| 5 | Athlean-X, joinladder | Plan-finder quiz | **`<PlanFinder>`** — four questions over the real `level` / `goal` / `equipment` / `daysPerWeek` frontmatter, filtering the actual catalogue |
| 6 | AG1, Huel, Whoop | Community / UGC wall | **`<Community>`** — a marquee wall of member lines, each still tagged to a product |
| 7 | AG1 | Comparison table | **`<CompareApproach>`** — QUWA vs a one-off PDF vs a coaching app. Generic categories, no named competitor. |
| 8 | AG1, Huel, Athlean-X | Guarantee block | **`<Guarantee>`** — the risk reversal as its own band, not only inline |
| 9 | Juggernaut, AG1 | Aggregate rating | **`<RatingSummary>`** — computed from the testimonial data, to two decimals |
| 10 | Whoop, rpstrength | ~500px repeating benefit band | **`<BenefitBands>`** — four bands, one idea each |
| 11 | Hevy, Juggernaut, Freeletics | App screenshots | **`<TrackerPreview>`** — we have no app, so we show the artefact we do ship: the tracking sheet, rendered as a real table |
| 12 | Athlean-X, Caliber | Results / success stories | Testimonials expanded from 9 to **22 per locale**, still product-tagged |

## 4. Deliberately not taken

- **Urgency and countdown timers** (freeletics, sweat). They lift a first order and cost
  trust on the second, and they are the loudest signal a store is squeezing rather than
  selling.
- **Press logos we do not have.** Adopted as a methodology bar instead — see #1.
- **A named founder with invented credentials.** Adopted as an editorial standard instead.
- **Before/after transformation photography** (athleanx, freeletics, caliber). Blocked in
  `assets/manifest.json` — that slot only ever gets a real member. See `docs/SHOT-LIST.md`.
- **`Over 60,000 Satisfied Customers`-style counters.** Our stats count things that are
  actually true about the site.
