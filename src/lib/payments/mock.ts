import type {
  CheckoutRequest,
  CheckoutSession,
  PaymentProvider,
  SubscriptionStatus,
} from './types';

/**
 * The working provider. No network, no keys, no money. It produces a real
 * session object and routes the browser to /checkout, which renders the same
 * summary a hosted checkout would and then lands on /thank-you.
 * This is what runs on the public demo.
 */
export const mockProvider: PaymentProvider = {
  name: 'mock',
  supportedMethods: ['card', 'apple_pay', 'google_pay', 'paypal'],
  supportsMultiCurrency: true,

  async createCheckout(request: CheckoutRequest): Promise<CheckoutSession> {
    const id = `mock_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    const params = new URLSearchParams({
      session: id,
      items: request.items.map((i) => `${i.id}:${i.quantity}`).join(','),
      currency: request.currency,
      method: request.method,
    });
    if (request.trialDays) params.set('trial', String(request.trialDays));
    if (request.referral) params.set('ref', request.referral);
    if (request.creditAmount) params.set('credit', String(request.creditAmount));

    return {
      id,
      url: `${request.successUrl}?${params.toString()}`,
      provider: 'mock',
      isMock: true,
      expiresAt: new Date(Date.now() + 30 * 60_000).toISOString(),
    };
  },

  async getSubscriptionStatus(customerRef: string): Promise<SubscriptionStatus> {
    // Mock members are always mid-trial so the gated UI can be exercised.
    const active = customerRef.length > 0;
    return {
      active,
      plan: active ? 'annual' : null,
      trialEndsAt: active ? new Date(Date.now() + 7 * 86_400_000).toISOString() : null,
      currentPeriodEnd: active ? new Date(Date.now() + 365 * 86_400_000).toISOString() : null,
      cancelAtPeriodEnd: false,
    };
  },

  portalUrl() {
    return null;
  },
};
