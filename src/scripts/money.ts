/* Shared client-side money formatting — the same conversion the server used at
   build time, re-run in the browser once the visitor's currency is known. */
import { CURRENCIES, type CurrencyCode } from '../config/pricing';

const THREE_DECIMAL = new Set(['KWD', 'BHD', 'OMR', 'JOD']);

export const CURRENCY_EVENT = 'quwa:currency';

/** Re-run `fn` whenever the detected or chosen currency changes. */
export function onCurrencyChange(fn: () => void): void {
  window.addEventListener(CURRENCY_EVENT, fn);
}

export function currentCurrency(): CurrencyCode {
  const code = document.documentElement.dataset.currency;
  return code && code in CURRENCIES ? (code as CurrencyCode) : 'USD';
}

export function convert(usdCents: number, code: CurrencyCode): number {
  const config = CURRENCIES[code];
  const raw = (usdCents / 100) * config.rate;
  if (config.round === 'charm') return Math.floor(raw) + 0.99;
  if (config.round === 'whole') return Math.round(raw);
  return Math.round(raw / 5) * 5;
}

export function money(usdCents: number, intlLocale: string, code = currentCurrency()): string {
  const decimals = THREE_DECIMAL.has(code) ? 3 : 2;
  return new Intl.NumberFormat(intlLocale, {
    style: 'currency',
    currency: code,
    minimumFractionDigits: code === 'USD' || decimals === 3 ? decimals : 0,
    maximumFractionDigits: decimals,
  }).format(convert(usdCents, code));
}

export function locale(): { lang: 'en' | 'ar'; intl: string } {
  const lang = (document.documentElement.getAttribute('lang') ?? 'en') as 'en' | 'ar';
  return { lang, intl: lang === 'ar' ? 'ar-u-nu-arab' : 'en-US' };
}

export interface ClientStrings {
  lang: 'en' | 'ar';
  intl: string;
  remove: string;
  qty: string;
  download: string;
  empty: string;
  processing: string;
  emailInvalid: string;
  emailSent: string;
  demoMode: string;
  applyCredit: string;
  spent: string;
  creditLine: string;
}

/**
 * Read the strings <ClientStrings> serialised from the locale files. There is no
 * English fallback dictionary here on purpose — a missing key should surface as a
 * visible empty string during development, not silently ship the wrong language.
 */
export function strings(): ClientStrings {
  const el = document.querySelector<HTMLScriptElement>('[data-strings]');
  const parsed = el?.textContent ? (JSON.parse(el.textContent) as ClientStrings) : null;
  if (parsed) return parsed;
  const lang = locale().lang;
  return { lang, intl: locale().intl } as ClientStrings;
}
