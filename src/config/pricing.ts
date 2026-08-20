/* ─────────────────────────────────────────────────────────────────────────────
   THE PRICE FILE.
   Every number a customer can be charged is here. Components read from this and
   never hardcode a figure, so pricing can be tuned without touching a template.
   Base currency is USD; everything else is derived in src/lib/currency.ts.
   ───────────────────────────────────────────────────────────────────────────── */

export const BASE_CURRENCY = 'USD' as const;

/** One-time products, USD cents. Keys match the program slugs in src/content. */
export const PRODUCT_PRICES: Record<string, number> = {
  'hypertrophy-foundations': 3900,
  'strength-base': 4400,
  'lean-recomposition': 3900,
  'minimal-kit': 2900,
  'posterior-chain': 3400,
  'push-pull-legs': 4400,
  'recipe-pack': 1900,
  // Bundles — priced so the saving is arithmetic, not rhetorical.
  'bundle-complete-library': 12900, // vs 22900 bought singly
  'bundle-train-and-eat': 4900,     // vs 5800
};

/** Which single products each bundle contains. Drives the "you save X" maths. */
export const BUNDLE_CONTENTS: Record<string, string[]> = {
  'bundle-complete-library': [
    'hypertrophy-foundations',
    'strength-base',
    'lean-recomposition',
    'minimal-kit',
    'posterior-chain',
    'push-pull-legs',
  ],
  'bundle-train-and-eat': ['hypertrophy-foundations', 'recipe-pack'],
};

/** Membership. Annual is the default plan; the trial lives on annual only. */
export const MEMBERSHIP = {
  monthly: { id: 'membership-monthly', amount: 1900, interval: 'month' as const },
  annual: {
    id: 'membership-annual',
    amount: 15900,
    interval: 'year' as const,
    /** 15900 / 12 = 1325 — shown beside the annual price. */
    perMonth: 1325,
    /** 15900 / 1900 = 8.4× the monthly price. */
    trialDays: 7,
    isDefault: true,
  },
} as const;

/** Cart order bump: the recipe pack at a cart-only price. */
export const ORDER_BUMP = {
  productId: 'recipe-pack',
  amount: 1200,
  regularAmount: 1900,
} as const;

/** Referral: friend gets a discount, referrer gets store credit. */
export const REFERRAL = {
  friendDiscountPct: 20,
  referrerCreditAmount: 1000,
  maxCreditsPerYear: 10,
} as const;

/** Post-purchase upsell: any one-time purchase credits fully against annual. */
export const UPSELL = {
  target: 'membership-annual',
  creditsPurchasePrice: true,
  windowHours: 48,
} as const;

/**
 * Static FX table. There is no server on GitHub Pages, so there is no live rate
 * feed — see DECISIONS.md #12. Rates are deliberately conservative (rounded
 * against us) and the displayed local price is presentational: the charge is
 * settled by the payment provider in the currency it supports.
 *   round: how the converted figure is tidied
 *     'charm'  → land on .99   (USD/EUR/GBP convention)
 *     'whole'  → nearest whole unit (Gulf convention)
 *     'ten'    → nearest 5 (high-denomination currencies)
 */
export const CURRENCIES = {
  USD: { rate: 1, round: 'charm', region: ['US'] },
  EUR: { rate: 0.92, round: 'charm', region: ['DE', 'FR', 'ES', 'IT', 'NL', 'IE', 'PT', 'BE', 'AT', 'FI', 'GR'] },
  GBP: { rate: 0.79, round: 'charm', region: ['GB'] },
  SAR: { rate: 3.75, round: 'whole', region: ['SA'] },
  AED: { rate: 3.67, round: 'whole', region: ['AE'] },
  KWD: { rate: 0.31, round: 'whole', region: ['KW'] },
  QAR: { rate: 3.64, round: 'whole', region: ['QA'] },
  BHD: { rate: 0.38, round: 'whole', region: ['BH'] },
  OMR: { rate: 0.38, round: 'whole', region: ['OM'] },
  EGP: { rate: 48.5, round: 'ten', region: ['EG'] },
  MAD: { rate: 9.9, round: 'whole', region: ['MA'] },
  JOD: { rate: 0.71, round: 'whole', region: ['JO'] },
  CAD: { rate: 1.37, round: 'charm', region: ['CA'] },
  AUD: { rate: 1.52, round: 'charm', region: ['AU'] },
  TRY: { rate: 34.2, round: 'ten', region: ['TR'] },
  INR: { rate: 83.5, round: 'ten', region: ['IN'] },
} as const satisfies Record<string, { rate: number; round: 'charm' | 'whole' | 'ten'; region: readonly string[] }>;

export type CurrencyCode = keyof typeof CURRENCIES;
export const CURRENCY_CODES = Object.keys(CURRENCIES) as CurrencyCode[];

/** Shown next to every price. Real policy text lives at /[lang]/refund-policy. */
export const GUARANTEE_DAYS = 14;
