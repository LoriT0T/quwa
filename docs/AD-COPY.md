# AD-COPY.md

Two ad concepts, four creatives, English and Arabic. Files in [`out/ads/`](../out/ads).

Rendered by `tools/make-ads.mjs` in a real browser at 2× so they use the actual brand
faces (Inter, IBM Plex Sans Arabic) rather than whatever the image library has
installed. Re-run with `npm run ads` after any copy or palette change.

| File | Placement | Size | Ratio |
|---|---|---|---|
| `fb-1200x628-en.png` · `-ar.png` | Facebook feed, right column, Messenger | 1200 × 628 | 1.91:1 |
| `ig-1080x1350-en.png` · `-ar.png` | Instagram feed | 1080 × 1350 | 4:5 |

A `@2x.jpg` sits beside each for review; upload the `.png`.

Both carry a discreet `Sample · concept` chip, because this is a portfolio piece for a
brand that does not trade.

---

## Concept 1 — the free tools (top of funnel)

Leads with the free calculators, not the products. The offer is "run your numbers in a
minute", which costs the viewer nothing and is true. Every measured reference promotes
its free layer above its paid one — rpstrength puts `FREE CONTENT` in the top nav,
joinladder's first nav item is `FREE WORKOUT OF THE DAY`.

### Facebook — English

| Field | Copy | Limit |
|---|---|---|
| Primary text | Seven free calculators that do the arithmetic properly. Calories, macros, protein target, one-rep max — about a minute each, no signup and no card. Then decide whether you want a program. | 125 chars before "See more" |
| Headline | Train with a plan, not a guess. | 40 |
| Description | Free tools · English and العربية | 30 |
| CTA button | Learn more | — |
| Destination | `/en/tools/` | — |

### Facebook — Arabic

| Field | Copy |
|---|---|
| Primary text | سبع حاسبات مجانية تُجري الحساب بدقة. السعرات والماكروز وهدف البروتين وأقصى وزن لتكرار واحد — نحو دقيقة لكل واحدة، بلا تسجيل وبلا بطاقة. ثم قرّر إن كنت تريد برنامجاً. |
| Headline | تدرّب بخطة، لا بالتخمين. |
| Description | أدوات مجانية · بالعربية والإنجليزية |
| CTA button | اعرف المزيد |
| Destination | `/ar/tools/` |

## Concept 2 — the specific numbers (mid funnel)

Names the three outputs rather than the category. "Your calories, macros and one-rep max"
is concrete; "get fit" is not. The disclaimer is inside the creative, not only the
landing page, because a fitness ad that implies a medical claim gets rejected.

### Instagram — English

| Field | Copy | Limit |
|---|---|---|
| Primary text | Your calories, your macros, your one-rep max — in about a minute. No signup, no card, no email required to see the result. Seven free calculators, in English and Arabic. | 125 before truncation |
| Headline (in creative) | Your calories, macros and one-rep max. | — |
| CTA button | Learn more | — |
| Destination | `/en/tools/tdee/` | — |
| First comment | The full set is at quwa.fit/en/tools — TDEE, macros, protein, one-rep max, body fat, water, plate loading. | — |

### Instagram — Arabic

| Field | Copy |
|---|---|
| Primary text | سعراتك، وماكروزك، وأقصى وزن لك — في نحو دقيقة. بلا تسجيل، وبلا بطاقة، وبلا بريد لرؤية النتيجة. سبع حاسبات مجانية، بالعربية والإنجليزية. |
| Headline (in creative) | سعراتك، وماكروزك، وأقصى وزن لك. |
| CTA button | اعرف المزيد |
| Destination | `/ar/tools/tdee/` |

---

## What is deliberately absent, and why

Meta's health-and-fitness policy rejects a specific list of things, and most fitness ads
get rejected for one of them. None of these appears in any of the four creatives:

- **No before-and-after imagery.** Explicitly prohibited, and we would not have it
  anyway — that image slot is blocked in `assets/manifest.json`.
- **No implied personal attributes.** Nothing addresses the viewer's body. "Your
  calories" is about arithmetic, not about them.
- **No outcome promise or timeline.** No pounds, no weeks-to-results, no "transform".
  This is the same rule the site copy runs on, for the same reason: outcome claims
  generate refund demands and chargebacks.
- **No close-crop on a body part.** Also explicitly prohibited.
- **No urgency device.** Two of twelve industry sites use countdowns; they lift a first
  order and cost the second.

The Instagram creative carries the estimate disclaimer in the artwork itself, so the
claim and its qualifier travel together even when the caption is truncated — the same
device jeffnippard uses, putting "Results vary…" directly under the stat rather than in
the footer.

---

## Targeting and measurement notes

These are structural suggestions, not a media plan — no audience research was done.

- **Concept 1** is a cold-audience creative. Optimise for landing-page views, not
  conversions; the landing page has no purchase on it.
- **Concept 2** suits retargeting anyone who opened a calculator but did not submit the
  email gate. That event is the site's clearest intent signal.
- **Arabic and English should run as separate campaigns**, not as one campaign with two
  creatives. The Arabic copy is not a translation, the landing pages differ, and mixing
  them makes the results unreadable.
- The 4:5 Instagram creative also works as a Facebook feed placement. The 1.91:1 does not
  work on Instagram — it gets letterboxed.
- No pixel or conversions API is configured. `PUBLIC_SAMPLE_MODE` keeps the site
  `noindex` and payment-free, so there is nothing to attribute a conversion to.
