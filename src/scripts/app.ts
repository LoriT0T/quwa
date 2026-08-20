/* Site-wide client behaviour. One module, no framework. */
import { CURRENCIES, type CurrencyCode } from '../config/pricing';
import {
  addItem, countItems, getCart, captureReferral, CART_EVENT, type CartLine,
} from '../lib/cart';

const html = document.documentElement;
const lang = (html.getAttribute('lang') ?? 'en') as 'en' | 'ar';
const intlLocale = lang === 'ar' ? 'ar-u-nu-arab' : 'en-US';

/* ── Currency ─────────────────────────────────────────────────────────────── */
const CURRENCY_KEY = 'quwa.currency';
const THREE_DECIMAL = new Set(['KWD', 'BHD', 'OMR', 'JOD']);

function decimalsFor(code: string): number {
  return THREE_DECIMAL.has(code) ? 3 : 2;
}

function convert(usdCents: number, code: CurrencyCode): number {
  const config = CURRENCIES[code];
  const raw = (usdCents / 100) * config.rate;
  if (config.round === 'charm') return Math.floor(raw) + 0.99;
  if (config.round === 'whole') return Math.round(raw);
  return Math.round(raw / 5) * 5;
}

function formatMoney(amount: number, code: string): string {
  const decimals = decimalsFor(code);
  return new Intl.NumberFormat(intlLocale, {
    style: 'currency',
    currency: code,
    minimumFractionDigits: code === 'USD' || decimals === 3 ? decimals : 0,
    maximumFractionDigits: decimals,
  }).format(amount);
}

function detectCurrency(): CurrencyCode {
  const stored = safeGet(CURRENCY_KEY);
  if (stored && stored in CURRENCIES) return stored as CurrencyCode;

  // Region from the browser's locale, then from the resolved time zone.
  const candidates: string[] = [];
  for (const tag of navigator.languages ?? [navigator.language]) {
    const region = new Intl.Locale(tag).maximize().region;
    if (region) candidates.push(region);
  }
  for (const region of candidates) {
    const match = Object.entries(CURRENCIES).find(([, c]) =>
      (c.region as readonly string[]).includes(region),
    );
    if (match) return match[0] as CurrencyCode;
  }
  return 'USD';
}

export const CURRENCY_EVENT = 'quwa:currency';

function applyCurrency(code: CurrencyCode): void {
  html.dataset.currency = code;
  document.querySelectorAll<HTMLElement>('[data-price]').forEach((el) => {
    const cents = Number(el.dataset.price);
    if (!Number.isFinite(cents)) return;
    el.textContent = formatMoney(convert(cents, code), code);
  });
  document.querySelectorAll<HTMLSelectElement>('[data-currency-select]').forEach((sel) => {
    sel.value = code;
  });
  // Page scripts render their own money (cart totals, order summaries) and cannot
  // rely on having run after this file. They re-render on this event instead.
  window.dispatchEvent(new CustomEvent(CURRENCY_EVENT, { detail: code }));
}

function initCurrency(): void {
  const code = detectCurrency();
  applyCurrency(code);
  document.querySelectorAll<HTMLSelectElement>('[data-currency-select]').forEach((sel) => {
    sel.addEventListener('change', () => {
      const next = sel.value as CurrencyCode;
      safeSet(CURRENCY_KEY, next);
      applyCurrency(next);
    });
  });
}

/* ── Locale preference ────────────────────────────────────────────────────── */
function initLocale(): void {
  safeSet('quwa.lang', lang);
  document.querySelectorAll<HTMLAnchorElement>('[data-locale-switch]').forEach((link) => {
    link.addEventListener('click', () => safeSet('quwa.lang', link.dataset.localeSwitch ?? 'en'));
  });
}

/* ── Cart ─────────────────────────────────────────────────────────────────── */
function renderCartCount(lines: CartLine[] = getCart()): void {
  const n = countItems(lines);
  document.querySelectorAll<HTMLElement>('[data-cart-count]').forEach((el) => {
    el.textContent = new Intl.NumberFormat(intlLocale).format(n);
    el.hidden = n === 0;
  });
}

function initCart(): void {
  renderCartCount();
  window.addEventListener(CART_EVENT, (event) => {
    renderCartCount((event as CustomEvent<CartLine[]>).detail);
  });

  document.querySelectorAll<HTMLElement>('[data-add-to-cart]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.addToCart;
      if (!id) return;
      addItem({
        id,
        slug: id,
        title: btn.dataset.title ?? id,
        unitAmount: Number(btn.dataset.cents ?? 0),
        kind: (btn.dataset.kind as CartLine['kind']) ?? 'one_time',
      });
      const original = btn.textContent;
      btn.textContent = btn.dataset.addedLabel ?? '✓';
      btn.setAttribute('disabled', 'true');
      setTimeout(() => {
        btn.textContent = original;
        btn.removeAttribute('disabled');
      }, 1600);
    });
  });
}

/* ── Mobile menu ──────────────────────────────────────────────────────────── */
function initMenu(): void {
  const toggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  const nav = document.querySelector<HTMLElement>('[data-mobile-nav]');
  if (!toggle || !nav) return;
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!open));
    nav.hidden = open;
  });
}

/* ── Email capture ────────────────────────────────────────────────────────── */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function initEmailForms(): void {
  document.querySelectorAll<HTMLFormElement>('[data-email-form]').forEach((form) => {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const input = form.querySelector<HTMLInputElement>('input[type="email"]');
      const message = form.querySelector<HTMLElement>('[data-form-message]');
      if (!input || !message) return;

      const email = input.value.trim();
      message.hidden = false;
      if (!EMAIL_RE.test(email)) {
        message.dataset.state = 'error';
        message.textContent = form.dataset.invalidMessage ?? invalidCopy();
        input.focus();
        return;
      }

      delete message.dataset.state;
      message.textContent = sentCopy();
      // Identity is attached to the cart so an abandoned cart is recoverable.
      safeSet('quwa.email', email);
      safeSet('quwa.email.source', form.dataset.source ?? 'unknown');
      form.reset();

      const endpoint = import.meta.env.PUBLIC_EMAIL_FORM_ENDPOINT;
      if (endpoint) {
        try {
          await fetch(endpoint, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ email, source: form.dataset.source, locale: lang }),
          });
        } catch {
          /* the address is stored locally either way; delivery is the provider's job */
        }
      }
    });
  });
}

/** Both strings come from the locale files via <ClientStrings>; see money.ts. */
function clientStrings(): { emailSent?: string; emailInvalid?: string } {
  const el = document.querySelector<HTMLScriptElement>('[data-strings]');
  try { return el?.textContent ? JSON.parse(el.textContent) : {}; } catch { return {}; }
}
function sentCopy(): string {
  return clientStrings().emailSent ?? '';
}
function invalidCopy(): string {
  return clientStrings().emailInvalid ?? '';
}

/* ── Exit intent (desktop) / scroll depth (mobile) ────────────────────────── */
function initOffer(): void {
  const dialog = document.querySelector<HTMLDialogElement>('[data-exit-intent]');
  if (!dialog || safeGet('quwa.offer.seen')) return;

  let fired = false;
  const show = (): void => {
    if (fired || safeGet('quwa.email')) return;
    fired = true;
    safeSet('quwa.offer.seen', '1');
    if (typeof dialog.showModal === 'function') dialog.showModal();
  };

  const isCoarse = window.matchMedia('(pointer: coarse)').matches;
  if (isCoarse) {
    const onScroll = (): void => {
      const depth = (window.scrollY + window.innerHeight) / document.body.scrollHeight;
      if (depth > 0.55) { show(); window.removeEventListener('scroll', onScroll); }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
  } else {
    document.addEventListener('mouseout', (event) => {
      if (!event.relatedTarget && event.clientY <= 0) show();
    });
  }

  dialog.querySelectorAll<HTMLElement>('[data-exit-close]').forEach((el) => {
    el.addEventListener('click', (event) => {
      if (el.tagName !== 'A') event.preventDefault();
      dialog.close();
    });
  });
}

/* ── Sticky product CTA ───────────────────────────────────────────────────── */
function initStickyCta(): void {
  const bar = document.querySelector<HTMLElement>('[data-sticky-cta]');
  const anchor = document.querySelector<HTMLElement>('[data-fold-anchor]');
  if (!bar) return;
  bar.hidden = false;

  const setVisible = (visible: boolean): void => {
    if (visible) bar.setAttribute('data-visible', '');
    else bar.removeAttribute('data-visible');
  };

  if (anchor && 'IntersectionObserver' in window) {
    new IntersectionObserver(
      ([entry]) => setVisible(!!entry && !entry.isIntersecting && entry.boundingClientRect.top < 0),
      { threshold: 0 },
    ).observe(anchor);
  } else {
    window.addEventListener('scroll', () => setVisible(window.scrollY > 600), { passive: true });
  }
}

/* ── Storage helpers ──────────────────────────────────────────────────────── */
function safeGet(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}
function safeSet(key: string, value: string): void {
  try { localStorage.setItem(key, value); } catch { /* private mode */ }
}

/* ── Boot ─────────────────────────────────────────────────────────────────── */
captureReferral();
initLocale();
initCurrency();
initCart();
initMenu();
initEmailForms();
initOffer();
initStickyCta();

export { applyCurrency, formatMoney, convert };
