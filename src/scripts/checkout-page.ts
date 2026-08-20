import { getCart, getReferral, clearCart, type CartLine } from '../lib/cart';
import { getPaymentProvider } from '../lib/payments';
import type { PaymentMethod } from '../lib/payments/types';
import { REFERRAL, MEMBERSHIP } from '../config/pricing';
import { money, locale, currentCurrency, COPY } from './money';

const root = document.querySelector<HTMLElement>('[data-checkout]');

if (root) {
  const { lang, intl } = locale();
  const copy = COPY[lang];
  const form = root.querySelector<HTMLFormElement>('[data-checkout-form]')!;
  const linesEl = root.querySelector<HTMLUListElement>('[data-checkout-lines]')!;
  const totalEl = root.querySelector<HTMLElement>('[data-checkout-total]')!;
  const emptyEl = root.querySelector<HTMLElement>('[data-checkout-empty]')!;
  const message = root.querySelector<HTMLElement>('[data-checkout-message]')!;
  const button = root.querySelector<HTMLButtonElement>('[data-place-order]')!;

  const lines = getCart();
  const referral = getReferral();

  function totals(items: CartLine[]): { subtotal: number; discount: number; total: number } {
    const subtotal = items.reduce((sum, l) => sum + l.unitAmount * l.quantity, 0);
    const discount = referral ? Math.round((subtotal * REFERRAL.friendDiscountPct) / 100) : 0;
    return { subtotal, discount, total: subtotal - discount };
  }

  function render(): void {
    emptyEl.hidden = lines.length > 0;
    button.disabled = lines.length === 0;
    linesEl.innerHTML = lines
      .map((l) => `<li class="col"><span>${escape(l.title)} ×${l.quantity}</span><span>${money(l.unitAmount * l.quantity, intl)}</span></li>`)
      .join('');
    totalEl.textContent = money(totals(lines).total, intl);
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const emailInput = form.elements.namedItem('email');
    const email = emailInput instanceof HTMLInputElement ? emailInput.value.trim() : '';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      message.hidden = false;
      message.textContent = copy.emailInvalid;
      (emailInput as HTMLInputElement)?.focus();
      return;
    }
    const methodEl = form.elements.namedItem('method');
    const method = (methodEl instanceof RadioNodeList ? methodEl.value : 'card') as PaymentMethod;

    button.disabled = true;
    message.hidden = false;
    message.textContent = copy.processing;

    const origin = window.location.origin;
    const provider = getPaymentProvider();
    const hasSubscription = lines.some((l) => l.kind === 'subscription');

    try {
      const session = await provider.createCheckout({
        items: lines.map((l) => ({
          id: l.id, title: l.title, unitAmount: l.unitAmount, quantity: l.quantity, kind: l.kind,
        })),
        email,
        locale: lang,
        currency: currentCurrency(),
        method,
        trialDays: hasSubscription ? MEMBERSHIP.annual.trialDays : undefined,
        referral: referral ?? undefined,
        successUrl: origin + root.dataset.success,
        cancelUrl: origin + root.dataset.cancel,
      });

      // Paddle opens an overlay rather than navigating; every other path is a redirect.
      if (session.url.startsWith('paddle:overlay')) {
        message.textContent = `${session.provider}: overlay checkout requires the Paddle.js script (see DECISIONS.md #9)`;
        button.disabled = false;
        return;
      }

      try { localStorage.setItem('quwa.lastOrder', JSON.stringify({ email, lines, session: session.id })); } catch { /* ignore */ }
      if (session.isMock) clearCart();
      window.location.href = session.url;
    } catch (error) {
      message.textContent = error instanceof Error ? error.message : String(error);
      button.disabled = false;
    }
  });

  render();
}

function escape(value: string): string {
  return value.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c);
}
