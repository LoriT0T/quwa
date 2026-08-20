import { SITE, type Locale } from '../config/site';
import { BASE_CURRENCY, GUARANTEE_DAYS } from '../config/pricing';

type Json = Record<string, unknown>;

export function organization(origin: string, lang: Locale, wordmark: string, description: string): Json {
  return {
    '@type': 'Organization',
    '@id': `${origin}/#organization`,
    name: SITE.name,
    alternateName: wordmark,
    url: origin,
    logo: { '@type': 'ImageObject', url: `${origin}/og/logo.png`, width: 512, height: 512 },
    description,
    email: SITE.email,
    foundingDate: String(SITE.founded),
    sameAs: Object.values(SITE.social),
    inLanguage: lang,
  };
}

export function website(origin: string, lang: Locale, name: string): Json {
  return {
    '@type': 'WebSite',
    '@id': `${origin}/#website`,
    url: origin,
    name,
    publisher: { '@id': `${origin}/#organization` },
    inLanguage: lang,
  };
}

export function breadcrumbs(items: readonly { name: string; url: string }[]): Json {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function faqPage(items: readonly { readonly q: string; readonly a: string }[]): Json {
  return {
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };
}

export interface ProductSchemaInput {
  url: string;
  name: string;
  description: string;
  image: string;
  sku: string;
  /** USD cents, always. Rich results must not see a converted display figure. */
  priceCents: number;
  rating?: { value: number; count: number };
  origin: string;
}

export function product(input: ProductSchemaInput): Json {
  const schema: Json = {
    '@type': 'Product',
    '@id': `${input.url}#product`,
    name: input.name,
    description: input.description,
    image: input.image,
    sku: input.sku,
    brand: { '@type': 'Brand', name: SITE.name },
    offers: {
      '@type': 'Offer',
      url: input.url,
      priceCurrency: BASE_CURRENCY,
      price: (input.priceCents / 100).toFixed(2),
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@id': `${input.origin}/#organization` },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'US',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: GUARANTEE_DAYS,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/FreeReturn',
      },
    },
  };
  if (input.rating && input.rating.count > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: input.rating.value.toFixed(2),
      reviewCount: input.rating.count,
      bestRating: 5,
      worstRating: 1,
    };
  }
  return schema;
}

export function softwareApplication(input: {
  url: string;
  name: string;
  description: string;
  origin: string;
}): Json {
  return {
    '@type': 'SoftwareApplication',
    '@id': `${input.url}#app`,
    name: input.name,
    description: input.description,
    url: input.url,
    applicationCategory: 'HealthApplication',
    operatingSystem: 'Any',
    offers: { '@type': 'Offer', price: '0', priceCurrency: BASE_CURRENCY },
    publisher: { '@id': `${input.origin}/#organization` },
  };
}

export function article(input: {
  url: string;
  headline: string;
  description: string;
  image: string;
  published: string;
  updated?: string;
  lang: Locale;
  origin: string;
  authorName: string;
}): Json {
  return {
    '@type': 'Article',
    '@id': `${input.url}#article`,
    headline: input.headline,
    description: input.description,
    image: input.image,
    datePublished: input.published,
    dateModified: input.updated ?? input.published,
    inLanguage: input.lang,
    author: { '@type': 'Organization', name: input.authorName },
    publisher: { '@id': `${input.origin}/#organization` },
    mainEntityOfPage: { '@type': 'WebPage', '@id': input.url },
  };
}

/** Wraps any set of nodes into one @graph so a page emits a single script tag. */
export function graph(nodes: Json[]): string {
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': nodes });
}
