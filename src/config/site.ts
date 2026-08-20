/** Brand-level constants. Nothing here is locale-specific — copy lives in src/i18n. */
export const SITE = {
  /** Latin wordmark. Arabic wordmark is `brand.wordmark` in each locale file. */
  name: 'QUWA',
  /** ISO-639 of the brand name's source language, for lang-tagging the wordmark. */
  nameLang: 'ar',
  domain: 'quwa.fit',
  email: 'hello@quwa.fit',
  supportEmail: 'support@quwa.fit',
  founded: 2026,
  social: {
    instagram: 'https://instagram.com/quwafit',
    tiktok: 'https://tiktok.com/@quwafit',
    youtube: 'https://youtube.com/@quwafit',
    x: 'https://x.com/quwafit',
  },
} as const;

export const LOCALES = ['en', 'ar'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';
export const DIR: Record<Locale, 'ltr' | 'rtl'> = { en: 'ltr', ar: 'rtl' };
/** BCP-47 tags used for Intl formatting. `-u-nu-arab` forces Arabic-Indic digits. */
export const INTL_LOCALE: Record<Locale, string> = { en: 'en-US', ar: 'ar-u-nu-arab' };
export const OG_LOCALE: Record<Locale, string> = { en: 'en_US', ar: 'ar_AR' };

export const COMMERCE_MODE = (import.meta.env.PUBLIC_COMMERCE_MODE ?? 'mock') as
  | 'mock'
  | 'hosted'
  | 'worker';
export const PAYMENT_PROVIDER = (import.meta.env.PUBLIC_PAYMENT_PROVIDER ?? 'lemonsqueezy') as
  | 'lemonsqueezy'
  | 'paddle'
  | 'stripe';
export const EMAIL_PROVIDER = (import.meta.env.PUBLIC_EMAIL_PROVIDER ?? 'mock') as string;
