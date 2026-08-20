import { DEFAULT_LOCALE, LOCALES, type Locale } from '../config/site';

/** Astro injects BASE_URL from `base` in astro.config. Normalised to no trailing slash. */
const BASE = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '');

/** A path inside a locale: localePath('ar', '/programs') → '/quwa/ar/programs' */
export function localePath(lang: string, path = '/'): string {
  const clean = path === '/' ? '' : `/${path.replace(/^\/+|\/+$/g, '')}`;
  return `${BASE}/${lang}${clean}` || '/';
}

/** A path outside the locale tree (assets, root files). */
export function rootPath(path = '/'): string {
  return `${BASE}/${path.replace(/^\/+/, '')}`;
}

export function absoluteUrl(path: string, site: URL | undefined): string {
  const origin = site ? site.origin : '';
  return `${origin}${path}`;
}

/** hreflang alternates for one logical page across every locale, plus x-default. */
export function alternates(path: string, site: URL | undefined) {
  const list: { hreflang: string; href: string }[] = LOCALES.map((lang) => ({
    hreflang: lang as string,
    href: absoluteUrl(localePath(lang, path), site),
  }));
  list.push({
    hreflang: 'x-default',
    href: absoluteUrl(localePath(DEFAULT_LOCALE, path), site),
  });
  return list;
}

/** Given a current pathname, produce the same page in the other locale. */
export function swapLocale(pathname: string, to: Locale): string {
  const withoutBase = BASE && pathname.startsWith(BASE) ? pathname.slice(BASE.length) : pathname;
  const segments = withoutBase.split('/').filter(Boolean);
  if (segments.length > 0 && LOCALES.includes(segments[0] as Locale)) segments[0] = to;
  else segments.unshift(to);
  return `${BASE}/${segments.join('/')}`;
}

export { BASE };
