# SHOT-LIST.md

Two image slots are **blocked** in `assets/manifest.json` and one is **unfilled**. Blocked
slots will not be generated or filled with stock under any circumstances, for the reasons
below. They render as neutral blocks at the correct ratio until a real shoot exists.

Budget estimate: one day, one photographer, one location. Everything here can be shot in
a single session.

---

## <a id="transformation-set"></a>1. Member results — `proof-transformation-1`

**Blocked.** A generated body attached to a customer testimonial is a fabricated claim,
and a stock photograph of a stranger presented as a member's result is the same thing
with extra steps. This slot only ever gets a real person who really used the program.

| | |
|---|---|
| Slot | `proof-transformation-1` (extend the manifest for as many as you shoot) |
| Ratio | 4:5 portrait |
| Delivered | 800 × 1000 minimum, sRGB, unretouched |

**Brief.** Standing, front and side, arms relaxed at the sides. Same room, same distance,
same lens, same time of day for before and after. Plain wall, no mirrors, no gym
signage. Neutral, even light — not the hard side-light that manufactures definition.

**Non-negotiable:**
- Signed model release naming this site and the territories it publishes in.
- Same clothing, same lighting, same camera height in both frames.
- No tanning, no oil, no pump, no posing difference between the two.
- The subject actually completed the program named in the caption.
- The caption states the program, the elapsed time, and — per copy rules — carries the
  individual-result label. `t.common.individualResult` already exists in both locales.

If a subject is only willing to give a quote and not a photograph, take the quote. The
proof component works without an image and the site currently ships that way.

---

## <a id="founder"></a>2. Founder portrait — `founder-portrait`

**Blocked.** Generating a portrait and attaching a name to it is impersonation.

| | |
|---|---|
| Slot | `founder-portrait` |
| Ratio | 1:1 |
| Delivered | 800 × 800 minimum |

**Brief.** Chest-up, eyes to camera, in the gym rather than against a studio backdrop.
Soft key from one side, background falling to near-black to match `--c-surface`.
Working clothes, not a suit. One frame smiling, one not — the not-smiling one usually
survives longer.

---

## <a id="food"></a>3. Food — `program-lean-recomposition` and the recipe set

**Unfilled, not blocked.** Free licensed aggregators do not reliably return
commercial-grade food photography. Three candidates were rejected on review: a restaurant
dining room, a museum ceramic accession, and a field barbecue.

Two routes: an Unsplash or Pexels API key, which is free and would probably fill it in a
few minutes; or shoot it.

| Slot | Ratio | Subject |
|---|---|---|
| `program-lean-recomposition` | 4:3 | One plate: grilled chicken, rice, green vegetables. Overhead, dark surface, single soft window light from the left. It has to look like something a person eats on a Tuesday, not like a restaurant dish. |
| `recipe-*` (optional re-shoot) | 16:9 | The three free recipes, cooked as written, in the pan or bowl they were cooked in. |

**Brief for all food frames.** Overhead or 45°, never straight-on. One light source.
Dark surface to match the site ground. No garnish that is not in the recipe — if the
recipe does not call for parsley, there is no parsley in the photograph.

---

## 4. Worth shooting while you have the photographer — not blocked, just better

These slots are currently filled with licensed stock that is serviceable but generic.
Replacing them is the single biggest visual upgrade available.

| Slot | Ratio | Subject |
|---|---|---|
| `home-hero` | 4:5 | A loaded barbell on the gym floor, shot low at 35mm, hard raking light from the upper left, deep shadow in the right third. Negative space in the upper third for the headline. No people, no visible brands. |
| `program-hypertrophy-foundations` | 4:3 | Dumbbell rack, shallow depth of field, warm key against cool shadow. |
| `program-strength-base` | 4:3 | A power rack with a loaded bar at shoulder height. Low key. |
| `program-minimal-kit` | 4:3 | A pair of adjustable dumbbells and a bench on a wooden floor, window light. |
| `program-posterior-chain` | 4:3 | Kettlebells on a gym floor, raking light, cool palette. |
| `program-push-pull-legs` | 4:3 | Bumper plates edge-on, tight crop, hard light. |
| `starter-cover` | 3:2 | A training notebook and pen on a gym bench, hard side light. |

**Across the set:** no visible equipment branding, no gym logos, no faces unless a
release is signed, no phones in frame. Shoot everything against the same dark
environment so the set reads as one brand rather than seven stock photographs.

---

## Delivery

Drop the files into `public/images/source/<slot-id>.jpg`, then:

```bash
npm run images:optimize
```

That crops each to its declared ratio, emits the AVIF and WebP responsive sets, and
regenerates the LQIP map. Then remove the `blocked` flag from the slot in
`assets/manifest.json` and add the credit line to `assets/CREDITS.md`.
