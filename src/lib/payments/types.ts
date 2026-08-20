/* ─────────────────────────────────────────────────────────────────────────────
   PaymentProvider — the seam between the storefront and whoever takes the money.
   Nothing outside src/lib/payments knows which provider is live. Swapping
   providers is an env var, not a refactor.
   ───────────────────────────────────────────────────────────────────────────── */

export type PaymentMethod = 'card' | 'apple_pay' | 'google_pay' | 'paypal';

export interface LineItem {
  /** Matches a slug in src/content/programs, or a MEMBERSHIP id. */
  id: string;
  title: string;
  /** USD cents. The provider converts; we never send a converted figure. */
  unitAmount: number;
  quantity: number;
  kind: 'one_time' | 'subscription';
}

export interface CheckoutRequest {
  items: LineItem[];
  email?: string;
  locale: 'en' | 'ar';
  /** Display currency chosen by the visitor. Providers that cannot settle in it fall back to USD. */
  currency: string;
  method: PaymentMethod;
  /** Present for subscriptions with a trial. */
  trialDays?: number;
  /** Referral code from `?ref=`, passed through to the provider as metadata. */
  referral?: string;
  /** Absolute URLs the provider redirects to. */
  successUrl: string;
  cancelUrl: string;
  /** Applied as a credit on the post-purchase upsell. USD cents. */
  creditAmount?: number;
}

export interface CheckoutSession {
  /** Provider-side identifier. `mock_*` in mock mode. */
  id: string;
  /** Where the browser should go next. In mock mode this is an internal route. */
  url: string;
  provider: ProviderName;
  /** True when no network call was made and no money can move. */
  isMock: boolean;
  expiresAt?: string;
}

export type ProviderName = 'mock' | 'lemonsqueezy' | 'paddle' | 'stripe';

export interface SubscriptionStatus {
  active: boolean;
  plan: 'monthly' | 'annual' | null;
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

export interface PaymentProvider {
  readonly name: ProviderName;
  /** Payment methods this provider can present in the checkout UI. */
  readonly supportedMethods: readonly PaymentMethod[];
  /** True when the provider settles in the visitor's currency rather than USD only. */
  readonly supportsMultiCurrency: boolean;
  createCheckout(request: CheckoutRequest): Promise<CheckoutSession>;
  /** Only meaningful once a Worker or provider portal exists; see DECISIONS.md #9. */
  getSubscriptionStatus(customerRef: string): Promise<SubscriptionStatus>;
  /** Provider-hosted customer portal for cancelling and updating cards. */
  portalUrl(customerRef: string): string | null;
}

export class ProviderNotConfiguredError extends Error {
  constructor(provider: ProviderName, missing: string) {
    super(
      `Payment provider "${provider}" is selected but ${missing} is not set. ` +
        `Set it in .env, or run with PUBLIC_COMMERCE_MODE=mock.`,
    );
    this.name = 'ProviderNotConfiguredError';
  }
}
