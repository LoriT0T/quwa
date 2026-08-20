import { CURRENCIES, BASE_CURRENCY, type CurrencyCode } from '../config/pricing';
import { INTL_LOCALE, type Locale } from '../config/site';

/** Zero-decimal currencies charge in whole units; never divide these by 100. */
const ZERO_DECIMAL = new Set(['JPY', 'KRW']);
/** Three-decimal currencies. Gulf dinars are minor-unit ×1000. */
const THREE_DECIMAL = new Set(['KWD', 'BHD', 'OMR', 'JOD']);

export function decimalsFor(code: string): number {
  if (ZERO_DECIMAL.has(code)) return 0;
  if (THREE_DECIMAL.has(code)) return 3;
  return 2;
}

/**
 * Convert a USD amount in cents to a display amount in the target currency's
 * major unit, then apply the currency's rounding convention.
 */
export function convert(usdCents: number, code: CurrencyCode): number {
  const config = CURRENCIES[code];
  const raw = (usdCents / 100) * config.rate;
  switch (config.round) {
    case 'charm': {
      // Land on .99 — e.g. 35.88 → 35.99, 4.20 → 4.99
      const floor = Math.floor(raw);
      return floor + 0.99;
    }
    case 'whole':
      return Math.round(raw);
    case 'ten':
      return Math.round(raw / 5) * 5;
    default:
      return raw;
  }
}

/**
 * Format a converted amount. `ar` uses `ar-u-nu-arab`, which renders
 * Arabic-Indic digits (٠١٢٣٤٥٦٧٨٩) and places the currency symbol correctly
 * for RTL — both things Intl handles and hand-rolled formatting does not.
 */
export function formatMoney(amount: number, code: string, lang: Locale): string {
  const decimals = decimalsFor(code);
  return new Intl.NumberFormat(INTL_LOCALE[lang], {
    style: 'currency',
    currency: code,
    minimumFractionDigits: code === BASE_CURRENCY || decimals === 3 ? decimals : 0,
    maximumFractionDigits: decimals,
  }).format(amount);
}

/** The one call components make: USD cents → a formatted local string. */
export function price(usdCents: number, code: CurrencyCode, lang: Locale): string {
  return formatMoney(convert(usdCents, code), code, lang);
}

export function formatNumber(value: number, lang: Locale, options: Intl.NumberFormatOptions = {}): string {
  return new Intl.NumberFormat(INTL_LOCALE[lang], options).format(value);
}

export function formatDate(date: Date | string, lang: Locale): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(INTL_LOCALE[lang], {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
}

/** Region → currency, derived from the region lists in config/pricing.ts. */
export const REGION_TO_CURRENCY: Record<string, CurrencyCode> = Object.fromEntries(
  Object.entries(CURRENCIES).flatMap(([code, config]) =>
    config.region.map((region) => [region, code as CurrencyCode]),
  ),
);

export type { CurrencyCode };
