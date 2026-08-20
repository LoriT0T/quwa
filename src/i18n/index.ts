import { en } from './en';
import { ar } from './ar';
import type { Dict } from './en';
import { DEFAULT_LOCALE, LOCALES, type Locale } from '../config/site';

const DICTS: Record<Locale, Dict> = { en, ar };

export function getDict(lang: string): Dict {
  return DICTS[(LOCALES as readonly string[]).includes(lang) ? (lang as Locale) : DEFAULT_LOCALE];
}

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/** Substitutes `{name}` placeholders. Missing keys are left visible, not silently blank. */
export function fill(template: string, vars: Record<string, string | number> = {}): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match,
  );
}

export type { Dict, Locale };
export { LOCALES, DEFAULT_LOCALE };
