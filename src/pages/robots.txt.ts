import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const origin = site ? site.origin : '';
  const base = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '');
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
