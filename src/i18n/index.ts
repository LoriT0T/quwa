import { en } from './en';
import { ar } from './ar';
import type { Dict } from './en';
import { DEFAULT_LOCALE, INTL_LOCALE, LOCALES, type Locale } from '../config/site';

const DICTS: Record<Locale, Dict> = { en, ar };

export function getDict(lang: string): Dict {
  return DICTS[(LOCALES as readonly string[]).includes(lang) ? (lang as Locale) : DEFAULT_LOCALE];
}

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/**
 * Substitutes `{name}` placeholders. Missing keys are left visible, not silently
 * blank — a missing string should be obvious in review, not invisible.
 *
 * Pass `lang` and any numeric value is formatted for that locale, so an interpolated
 * `14` renders as `١٤` inside Arabic copy rather than sitting in Latin digits beside
 * Arabic-Indic prices and calculator output.
 */
export function fill(
  template: string,
  vars: Record<string, string | number> = {},
  lang?: Locale,
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => {
    if (!(key in vars)) return match;
    const value = vars[key];
    if (typeof value === 'number' && lang) {
      return new Intl.NumberFormat(INTL_LOCALE[lang]).format(value);
    }
    return String(value);
  });
}

export type { Dict, Locale };
export { LOCALES, DEFAULT_LOCALE };
