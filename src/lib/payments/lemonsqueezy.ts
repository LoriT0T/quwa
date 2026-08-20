import type {
  CheckoutRequest,
  CheckoutSession,
  PaymentProvider,
  SubscriptionStatus,
} from './types';
import { ProviderNotConfiguredError } from './types';

/**
 * Lemon Squeezy — merchant of record, so it handles VAT/sales tax and invoicing,
 * which matters for a global bilingual store more than the fee difference does.
 *
 * STUB: request shapes are correct against the v1 API and the hosted-checkout
 * URL contract, but no live key is present and no call is made. See
 * DECISIONS.md #9 for exactly what must be filled in before this can charge.
 *
 * Two integration paths:
 *   hosted  — build a hosted checkout URL client-side. No secret key needed,
 *             so this is the path that works on GitHub Pages with no Worker.
 *   worker  — POST /v1/checkouts from the Worker with the secret key, for
 *             custom prices, discounts and metadata the URL cannot carry.
 */

const STORE = import.meta.env.PUBLIC_LEMONSQUEEZY_STORE as string | undefined;
const WORKER = import.meta.env.WORKER_BASE_URL as string | undefined;

/** Map our internal ids to Lemon Squeezy variant ids. Fill in from the dashboard. */
export const LS_VARIANT_IDS: Record<string, string> = {
  // 'hypertrophy-foundations': '123456',
  // 'membership-annual': '123460',
};

export const lemonSqueezyProvider: PaymentProvider = {
  name: 'lemonsqueezy',
  supportedMethods: ['card', 'apple_pay', 'google_pay', 'paypal'],
  supportsMultiCurrency: false, // settles in the store's currency; display stays local

  async createCheckout(request: CheckoutRequest): Promise<CheckoutSession> {
    if (!STORE) throw new ProviderNotConfiguredError('lemonsqueezy', 'PUBLIC_LEMONSQUEEZY_STORE');

    const first = request.items[0];
    if (!first) throw new Error('createCheckout called with an empty cart');
    const variant = LS_VARIANT_IDS[first.id];
    if (!variant) throw new ProviderNotConfiguredError('lemonsqueezy', `a variant id for "${first.id}"`);

    // ── Path A: hosted checkout URL. No secret, no Worker. ──────────────────
    if (!WORKER) {
      const url = new URL(`https://${STORE}.lemonsqueezy.com/buy/${variant}`);
      url.searchParams.set('embed', '0');
      url.searchParams.set('media', '0');
      url.searchParams.set('logo', '0');
      if (request.email) url.searchParams.set('checkout[email]', request.email);
      url.searchParams.set('checkout[custom][locale]', request.locale);
      if (request.referral) url.searchParams.set('checkout[custom][referral]', request.referral);
      url.searchParams.set('checkout[success_url]', request.successUrl);
      return { id: `ls_hosted_${variant}`, url: url.toString(), provider: 'lemonsqueezy', isMock: false };
    }

    // ── Path B: Worker creates the checkout so we can send custom prices. ───
    // Worker forwards this to POST https://api.lemonsqueezy.com/v1/checkouts
    // with `Authorization: Bearer ${LEMONSQUEEZY_API_KEY}`.
    const body = {
      data: {
        type: 'checkouts',
        attributes: {
          custom_price: request.items.reduce((sum, i) => sum + i.unitAmount * i.quantity, 0),
          checkout_data: {
            email: request.email,
            custom: {
              locale: request.locale,
              referral: request.referral ?? '',
              items: request.items.map((i) => `${i.id}:${i.quantity}`).join(','),
              credit: String(request.creditAmount ?? 0),
            },
          },
          checkout_options: { embed: false, media: false, logo: false, dark: true },
          product_options: {
            redirect_url: request.successUrl,
            enabled_variants: [variant],
          },
          ...(request.trialDays ? { preview: false } : {}),
        },
        relationships: {
          store: { data: { type: 'stores', id: STORE } },
          variant: { data: { type: 'variants', id: variant } },
        },
      },
    };

    const response = await fetch(`${WORKER}/checkout/lemonsqueezy`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error(`Lemon Squeezy checkout failed: ${response.status}`);
    const json = (await response.json()) as { data: { id: string; attributes: { url: string } } };
    return {
      id: json.data.id,
      url: json.data.attributes.url,
      provider: 'lemonsqueezy',
      isMock: false,
    };
  },

  async getSubscriptionStatus(customerRef: string): Promise<SubscriptionStatus> {
    if (!WORKER) return { active: false, plan: null, trialEndsAt: null, currentPeriodEnd: null, cancelAtPeriodEnd: false };
    const response = await fetch(`${WORKER}/subscription/${encodeURIComponent(customerRef)}`);
    if (!response.ok) throw new Error(`Subscription lookup failed: ${response.status}`);
    return (await response.json()) as SubscriptionStatus;
  },

  portalUrl(customerRef: string) {
    return WORKER ? `${WORKER}/portal/${encodeURIComponent(customerRef)}` : null;
  },
};
