import type {
  CheckoutRequest,
  CheckoutSession,
  PaymentProvider,
  SubscriptionStatus,
} from './types';
import { ProviderNotConfiguredError } from './types';

/**
 * Paddle Billing (v2). Merchant of record with the strongest coverage for
 * MENA card issuers of the three, which is why it is the recommended provider
 * if Arabic traffic converts better than English.
 *
 * STUB: request shapes match Paddle.js v2 `Paddle.Checkout.open()` and the
 * transactions API. No token is present; nothing is sent. See DECISIONS.md #9.
 */

const CLIENT_TOKEN = import.meta.env.PUBLIC_PADDLE_CLIENT_TOKEN as string | undefined;
const ENVIRONMENT = (import.meta.env.PUBLIC_PADDLE_ENV ?? 'sandbox') as 'sandbox' | 'production';
const WORKER = import.meta.env.WORKER_BASE_URL as string | undefined;

/** Map our internal ids to Paddle price ids (`pri_...`). Fill in from the dashboard. */
export const PADDLE_PRICE_IDS: Record<string, string> = {
  // 'hypertrophy-foundations': 'pri_01h...',
  // 'membership-annual': 'pri_01h...',
};

export const paddleProvider: PaymentProvider = {
  name: 'paddle',
  supportedMethods: ['card', 'apple_pay', 'google_pay', 'paypal'],
  supportsMultiCurrency: true,

  async createCheckout(request: CheckoutRequest): Promise<CheckoutSession> {
    if (!CLIENT_TOKEN) throw new ProviderNotConfiguredError('paddle', 'PUBLIC_PADDLE_CLIENT_TOKEN');

    const items = request.items.map((item) => {
      const priceId = PADDLE_PRICE_IDS[item.id];
      if (!priceId) throw new ProviderNotConfiguredError('paddle', `a price id for "${item.id}"`);
      return { priceId, quantity: item.quantity };
    });

    /**
     * Paddle opens an overlay in the page rather than redirecting, so the
     * "url" we return is the current page and the caller invokes this payload.
     * Shape matches Paddle.Checkout.open().
     */
    const openPayload = {
      settings: {
        displayMode: 'overlay' as const,
        theme: 'dark' as const,
        locale: request.locale,
        successUrl: request.successUrl,
        allowLogout: false,
      },
      items,
      customer: request.email ? { email: request.email } : undefined,
      customData: {
        locale: request.locale,
        referral: request.referral ?? '',
        credit: request.creditAmount ?? 0,
      },
      discountCode: undefined as string | undefined,
    };

    return {
      id: `paddle_${ENVIRONMENT}_${items.map((i) => i.priceId).join('_')}`,
      // Consumed by src/scripts/checkout.ts, which calls Paddle.Checkout.open(payload).
      url: `paddle:overlay?payload=${encodeURIComponent(JSON.stringify(openPayload))}`,
      provider: 'paddle',
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
