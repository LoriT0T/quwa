import { addItem } from '../lib/cart';
import { UPSELL } from '../config/pricing';
import { money, locale, COPY } from './money';

const root = document.querySelector<HTMLElement>('[data-thankyou]');

if (root) {
  const { lang, intl } = locale();
  const copy = COPY[lang];
  const params = new URLSearchParams(window.location.search);
  const downloadList = root.querySelector<HTMLUListElement>('[data-download-list]')!;
  const upsell = root.querySelector<HTMLElement>('[data-upsell]')!;
  const upsellBody = root.querySelector<HTMLElement>('[data-upsell-body]')!;
  const upsellCredit = root.querySelector<HTMLElement>('[data-upsell-credit]')!;
  const accept = root.querySelector<HTMLButtonElement>('[data-upsell-accept]')!;

  interface StoredOrder { email?: string; lines?: { id: string; title: string; unitAmount: number; quantity: number; kind: string }[] }
  let order: StoredOrder = {};
  try { order = JSON.parse(localStorage.getItem('quwa.lastOrder') ?? '{}') as StoredOrder; } catch { /* ignore */ }

  const lines = order.lines ?? params.get('items')?.split(',').filter(Boolean).map((pair) => {
    const [id = '', qty = '1'] = pair.split(':');
    return { id, title: id, unitAmount: 0, quantity: Number(qty), kind: 'one_time' };
  }) ?? [];

  downloadList.innerHTML = lines.length
    ? lines.map((l) => `
        <li class="col">
          <span>${escape(l.title)}</span>
          <a class="btn btn-secondary dl-btn" href="#" data-download="${escape(l.id)}">${copy.download}</a>
        </li>`).join('')
    : `<li class="col"><span>${copy.empty}</span></li>`;

  // Signed, expiring URLs come from the Worker; in mock mode nothing is served.
  downloadList.querySelectorAll<HTMLAnchorElement>('[data-download]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      link.textContent = lang === 'ar' ? 'وضع تجريبي' : 'Demo mode';
    });
  });

  // Upsell: full purchase price credited against the annual membership.
  const spent = lines.filter((l) => l.kind !== 'subscription')
    .reduce((sum, l) => sum + l.unitAmount * l.quantity, 0);
  const alreadySubscribed = lines.some((l) => l.kind === 'subscription');

  if (UPSELL.creditsPurchasePrice && spent > 0 && !alreadySubscribed) {
    const credit = money(spent, intl);
    upsell.hidden = false;
    upsellBody.textContent = upsellBody.textContent?.replace('{amount}', credit) ?? '';
    if (!upsellBody.textContent) upsellBody.textContent = copy.spent.replace('{a}', credit);
    upsellCredit.textContent = copy.creditLine.replace('{a}', credit);
    accept.textContent = copy.applyCredit.replace('{a}', credit);

    accept.addEventListener('click', () => {
      const cents = Number(root.dataset.membershipCents ?? 0) - spent;
      addItem({
        id: root.dataset.membershipId ?? 'membership-annual',
        slug: 'membership-annual',
        title: root.dataset.membershipTitle ?? 'Membership',
        unitAmount: Math.max(0, cents),
        kind: 'subscription',
      });
      window.location.href = root.dataset.cartUrl ?? '/';
    });
  }
}

function escape(value: string): string {
  return value.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c);
}
