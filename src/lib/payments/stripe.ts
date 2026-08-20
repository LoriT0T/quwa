import type {
  CheckoutRequest,
  CheckoutSession,
  PaymentProvider,
  SubscriptionStatus,
} from './types';
import { ProviderNotConfiguredError } from './types';

/**
 * Stripe Checkout. NOT merchant of record — you are liable for VAT, sales tax
 * and invoicing in every jurisdiction you sell into, which is a real cost for a
 * global digital-goods store. Chosen here only because it is what most people
 * already have.
 *
 * A Stripe Checkout Session cannot be created from the browser: it needs the
 * secret key. So Stripe REQUIRES the Worker. There is no hosted-only path.
 *
 * STUB: request shape matches POST /v1/checkout/sessions. See DECISIONS.md #9.
 */

const PUBLISHABLE = import.meta.env.PUBLIC_STRIPE_PUBLISHABLE_KEY as string | undefined;
const WORKER = import.meta.env.WORKER_BASE_URL as string | undefined;

/** Map our internal ids to Stripe price ids (`price_...`). */
export const STRIPE_PRICE_IDS: Record<string, string> = {
  // 'hypertrophy-foundations': 'price_1A...',
  // 'membership-annual': 'price_1B...',
};

export const stripeProvider: PaymentProvider = {
  name: 'stripe',
  // Apple Pay and Google Pay ride on the card payment method element.
  supportedMethods: ['card', 'apple_pay', 'google_pay', 'paypal'],
  supportsMultiCurrency: true,

  async createCheckout(request: CheckoutRequest): Promise<CheckoutSession> {
    if (!PUBLISHABLE) throw new ProviderNotConfiguredError('stripe', 'PUBLIC_STRIPE_PUBLISHABLE_KEY');
    if (!WORKER)
      throw new ProviderNotConfiguredError(
        'stripe',
        'WORKER_BASE_URL (Stripe cannot create a session from the browser)',
      );

    const isSubscription = request.items.some((i) => i.kind === 'subscription');

    // Shape mirrors POST https://api.stripe.com/v1/checkout/sessions.
    const payload = {
      mode: isSubscription ? 'subscription' : 'payment',
      ui_mode: 'hosted',
      locale: request.locale,
      customer_email: request.email,
      success_url: `${request.successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: request.cancelUrl,
      line_items: request.items.map((item) => {
        const priceId = STRIPE_PRICE_IDS[item.id];
        if (!priceId) throw new ProviderNotConfiguredError('stripe', `a price id for "${item.id}"`);
        return { price: priceId, quantity: item.quantity };
      }),
      ...(isSubscription && request.trialDays
        ? { subscription_data: { trial_period_days: request.trialDays } }
        : {}),
      ...(request.creditAmount
        ? { discounts: [{ coupon: `credit_${request.creditAmount}` }] }
        : {}),
      automatic_tax: { enabled: true },
      metadata: {
        locale: request.locale,
        referral: request.referral ?? '',
        display_currency: request.currency,
      },
    };

    const response = await fetch(`${WORKER}/checkout/stripe`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error(`Stripe checkout failed: ${response.status}`);
    const json = (await response.json()) as { id: string; url: string; expires_at?: number };
    return {
      id: json.id,
      url: json.url,
      provider: 'stripe',
      isMock: false,
      expiresAt: json.expires_at ? new Date(json.expires_at * 1000).toISOString() : undefined,
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
