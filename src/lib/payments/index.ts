import { COMMERCE_MODE, PAYMENT_PROVIDER } from '../../config/site';
import { mockProvider } from './mock';
import { lemonSqueezyProvider } from './lemonsqueezy';
import { paddleProvider } from './paddle';
import { stripeProvider } from './stripe';
import type { PaymentProvider, ProviderName } from './types';

const REGISTRY: Record<Exclude<ProviderName, 'mock'>, PaymentProvider> = {
  lemonsqueezy: lemonSqueezyProvider,
  paddle: paddleProvider,
  stripe: stripeProvider,
};

/**
 * The only export the storefront uses. In `mock` mode the concrete adapters are
 * never reached, so a missing key can never break the public site.
 */
export function getPaymentProvider(): PaymentProvider {
  if (COMMERCE_MODE === 'mock') return mockProvider;
  return REGISTRY[PAYMENT_PROVIDER] ?? mockProvider;
}

export { mockProvider, lemonSqueezyProvider, paddleProvider, stripeProvider };
export * from './types';
