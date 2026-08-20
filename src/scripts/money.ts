/* Shared client-side money formatting — the same conversion the server used at
   build time, re-run in the browser once the visitor's currency is known. */
import { CURRENCIES, type CurrencyCode } from '../config/pricing';

const THREE_DECIMAL = new Set(['KWD', 'BHD', 'OMR', 'JOD']);

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

export const COPY = {
  en: { remove: 'Remove', qty: 'Qty', download: 'Download', applyCredit: 'Apply {a} and upgrade',
        creditLine: 'less {a} credit', spent: 'You just spent {a}.', processing: 'Processing…',
        emailInvalid: 'Enter a valid email address', empty: 'Your cart is empty.' },
  ar: { remove: 'إزالة', qty: 'الكمية', download: 'تحميل', applyCredit: 'احتسب {a} وارتقِ',
        creditLine: 'ناقص رصيد {a}', spent: 'دفعت للتوّ {a}.', processing: 'جارٍ المعالجة…',
        emailInvalid: 'أدخل بريداً إلكترونياً صحيحاً', empty: 'سلّتك فارغة.' },
} as const;
