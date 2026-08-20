import { getCollection, type CollectionEntry } from 'astro:content';
import { LOCALES, type Locale } from '../config/site';

export type ProgramEntry = CollectionEntry<'programs'>;
export type RecipeEntry = CollectionEntry<'recipes'>;
export type PostEntry = CollectionEntry<'blog'>;

export async function getPrograms(lang: Locale): Promise<ProgramEntry[]> {
  const all = await getCollection('programs', (entry) => entry.data.lang === lang);
  return all.sort((a, b) => a.data.order - b.data.order);
}

export async function getProgram(lang: Locale, product: string): Promise<ProgramEntry | undefined> {
  const all = await getPrograms(lang);
  return all.find((entry) => entry.data.product === product);
}

export async function getRecipes(lang: Locale): Promise<RecipeEntry[]> {
  const all = await getCollection('recipes', (entry) => entry.data.lang === lang);
  return all.sort((a, b) => a.data.order - b.data.order);
}

export async function getPosts(lang: Locale): Promise<PostEntry[]> {
  const all = await getCollection('blog', (entry) => entry.data.lang === lang);
  return all.sort((a, b) => b.data.published.valueOf() - a.data.published.valueOf());
}

/** `en/hypertrophy-foundations` → `hypertrophy-foundations` */
export function slugOf(entry: { id: string }): string {
  const parts = entry.id.split('/');
  return parts[parts.length - 1] ?? entry.id;
}

/** Every [lang] route builds from this. */
export function localeParams(): { params: { lang: Locale } }[] {
  return LOCALES.map((lang) => ({ params: { lang } }));
}
