import type { APIRoute } from 'astro';
import { SAMPLE_MODE } from '../config/site';

export const GET: APIRoute = ({ site }) => {
  const origin = site ? site.origin : '';
  const base = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '');

  // Portfolio sample: keep it out of every index. Nothing here should rank, and
  // nothing here should look to a crawler like a store that takes money.
  if (SAMPLE_MODE) {
    return new Response(
      ['User-agent: *', 'Disallow: /', '', '# Portfolio sample — intentionally not indexed.', ''].join('\n'),
      { headers: { 'content-type': 'text/plain; charset=utf-8' } },
    );
  }

  const body = [
    'User-agent: *',
    'Allow: /',
    `Disallow: ${base}/en/styleguide`,
    `Disallow: ${base}/ar/styleguide`,
    `Disallow: ${base}/en/checkout`,
    `Disallow: ${base}/ar/checkout`,
    `Disallow: ${base}/en/thank-you`,
    `Disallow: ${base}/ar/thank-you`,
    '',
    `Sitemap: ${origin}${base}/sitemap-index.xml`,
    '',
  ].join('\n');
  return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
};
