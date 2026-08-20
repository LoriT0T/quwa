import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Pages URL is derived from env so the same repo can ship to a project page
// (https://<user>.github.io/<repo>) or a custom domain (base '/').
const SITE = process.env.PUBLIC_SITE_URL || 'https://lorit0t.github.io';
const BASE = process.env.PUBLIC_BASE_PATH ?? '/quwa';

/**
 * Markdown is written with root-relative links (/en/tools/tdee) so the content
 * stays portable. On a GitHub Pages project site every one of those needs the
 * base prefix or it 404s, so we rewrite them at build time instead of baking
 * the deployment path into 44 content files.
 */
function rehypeBasePaths() {
  const base = BASE.replace(/\/+$/, '');
  if (!base) return () => {};
  return () => (tree) => {
    const walk = (node) => {
      if (node.type === 'element') {
        for (const [tag, attr] of [['a', 'href'], ['img', 'src']]) {
          if (node.tagName !== tag) continue;
          const value = node.properties?.[attr];
          if (typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') && !value.startsWith(base + '/')) {
            node.properties[attr] = base + value;
          }
        }
      }
      for (const child of node.children ?? []) walk(child);
    };
    walk(tree);
  };
}

export default defineConfig({
  site: SITE,
  base: BASE,
  output: 'static',
  trailingSlash: 'ignore',
  build: { format: 'directory', inlineStylesheets: 'auto' },
  vite: { plugins: [tailwindcss()] },
  markdown: { rehypePlugins: [rehypeBasePaths()] },
  integrations: [
    sitemap({
      i18n: { defaultLocale: 'en', locales: { en: 'en', ar: 'ar' } },
      filter: (page) => !page.includes('/styleguide'),
    }),
  ],
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Inter',
      cssVariable: '--font-latin',
      weights: [400, 700],
      styles: ['normal'],
      subsets: ['latin', 'latin-ext'],
      display: 'swap',
      fallbacks: ['system-ui', 'Segoe UI', 'sans-serif'],
      optimizedFallbacks: true,
    },
    {
      provider: fontProviders.google(),
      name: 'IBM Plex Sans Arabic',
      cssVariable: '--font-arabic',
      weights: [400, 700],
      styles: ['normal'],
      subsets: ['arabic', 'latin'],
      display: 'swap',
      fallbacks: ['system-ui', 'Segoe UI', 'sans-serif'],
      optimizedFallbacks: true,
    },
  ],
});
