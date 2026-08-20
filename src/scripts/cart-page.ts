import { getCart, removeItem, setQuantity, addItem, getReferral, CART_EVENT, type CartLine } from '../lib/cart';
import { ORDER_BUMP, REFERRAL } from '../config/pricing';
import { money, locale, strings, onCurrencyChange } from './money';

const page = document.querySelector<HTMLElement>('[data-cart-page]');

if (page) {
  const { intl } = locale();
  const copy = strings();
  const list = page.querySelector<HTMLUListElement>('[data-cart-items]')!;
  const empty = page.querySelector<HTMLElement>('[data-cart-empty]')!;
  const summary = page.querySelector<HTMLElement>('[data-cart-summary]')!;
  const bumpWrap = page.querySelector<HTMLElement>('[data-bump-wrap]')!;
  const bumpToggle = page.querySelector<HTMLInputElement>('[data-bump-toggle]');
  const subtotalEl = page.querySelector<HTMLElement>('[data-cart-subtotal]')!;
  const discountEl = page.querySelector<HTMLElement>('[data-cart-discount]')!;
  const discountRow = page.querySelector<HTMLElement>('[data-discount-row]')!;
  const totalEl = page.querySelector<HTMLElement>('[data-cart-total]')!;

  function render(lines: CartLine[] = getCart()): void {
    const isEmpty = lines.length === 0;
    empty.hidden = !isEmpty;
    summary.hidden = isEmpty;
    // The bump only makes sense once there is something to bump, and never for itself.
    bumpWrap.hidden = isEmpty || lines.some((l) => l.id === ORDER_BUMP.productId);

    list.innerHTML = lines
      .map(
        (line) => `
      <li class="card line">
        <div class="line-main">
          <p class="line-title">${escape(line.title)}</p>
          <p class="line-price">${money(line.unitAmount, intl)}</p>
        </div>
        <div class="line-actions">
          ${line.kind === 'subscription' ? '' : `
          <label class="line-qty">
            <span class="sr-only">${copy.qty}</span>
            <input type="number" min="1" max="9" value="${line.quantity}" data-qty="${escape(line.id)}" />
          </label>`}
          <button type="button" class="line-remove" data-remove="${escape(line.id)}">${copy.remove}</button>
        </div>
      </li>`,
      )
      .join('');

    const subtotal = lines.reduce((sum, l) => sum + l.unitAmount * l.quantity, 0);
    const referral = getReferral();
    const discount = referral ? Math.round((subtotal * REFERRAL.friendDiscountPct) / 100) : 0;
    subtotalEl.textContent = money(subtotal, intl);
    discountRow.hidden = discount === 0;
    discountEl.textContent = `−${money(discount, intl)}`;
    totalEl.textContent = money(subtotal - discount, intl);

    list.querySelectorAll<HTMLButtonElement>('[data-remove]').forEach((btn) => {
      btn.addEventListener('click', () => removeItem(btn.dataset.remove!));
    });
    list.querySelectorAll<HTMLInputElement>('[data-qty]').forEach((input) => {
      input.addEventListener('change', () => setQuantity(input.dataset.qty!, Number(input.value)));
    });
  }

  bumpToggle?.addEventListener('change', () => {
    if (bumpToggle.checked) {
      const host = bumpToggle.closest<HTMLElement>('[data-order-bump]')!;
      addItem({
        id: ORDER_BUMP.productId,
        slug: ORDER_BUMP.productId,
        title: host.dataset.title ?? ORDER_BUMP.productId,
        // Cart-only price, deliberately below the standalone figure.
        unitAmount: ORDER_BUMP.amount,
        kind: 'one_time',
      });
    } else {
      removeItem(ORDER_BUMP.productId);
    }
  });

  window.addEventListener(CART_EVENT, (event) => render((event as CustomEvent<CartLine[]>).detail));
  onCurrencyChange(() => render());
  render();
}

function escape(value: string): string {
  return value.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c);
}
