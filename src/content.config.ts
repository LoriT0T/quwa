import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const localeEnum = z.enum(['en', 'ar']);

const faq = z.array(z.object({ q: z.string(), a: z.string() }));

const programs = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/programs' }),
  schema: ({ image }) =>
    z.object({
      lang: localeEnum,
      /** Stable across locales — this is the product id and the price key. */
      product: z.string(),
      title: z.string(),
      summary: z.string(),
      /** Short line used on cards, under the title. */
      cardLine: z.string(),
      kind: z.enum(['program', 'bundle', 'pack']).default('program'),
      level: z.enum(['beginner', 'intermediate', 'advanced', 'all']),
      goal: z.enum(['muscle', 'strength', 'recomposition', 'nutrition']),
      equipment: z.enum(['full-gym', 'home-rack', 'minimal', 'none']),
      weeks: z.number().int().positive().optional(),
      daysPerWeek: z.number().int().min(1).max(7).optional(),
      minutesPerSession: z.number().int().positive().optional(),
      pages: z.number().int().positive().optional(),
      order: z.number().int().default(50),
      featured: z.boolean().default(false),
      isNew: z.boolean().default(false),
      rating: z.object({ value: z.number().min(1).max(5), count: z.number().int().min(0) }).optional(),
      image: image().optional(),
      imageAlt: z.string().optional(),
      whatsInside: z.array(z.string()),
      whoFor: z.array(z.string()),
      whoNotFor: z.array(z.string()),
      sampleWeek: z.array(z.object({ day: z.string(), focus: z.string(), detail: z.string() })).optional(),
      faq,
      /** Product slugs of related items shown under "also consider". */
      related: z.array(z.string()).default([]),
      seoTitle: z.string().optional(),
      seoDescription: z.string(),
    }),
});

const recipes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/recipes' }),
  schema: ({ image }) =>
    z.object({
      lang: localeEnum,
      recipe: z.string(),
      title: z.string(),
      summary: z.string(),
      servings: z.number().int().positive(),
      prepMinutes: z.number().int().min(0),
      cookMinutes: z.number().int().min(0),
      perServing: z.object({
        kcal: z.number().int(),
        protein: z.number(),
        carbs: z.number(),
        fat: z.number(),
      }),
      ingredients: z.array(z.string()),
      method: z.array(z.string()),
      image: image().optional(),
      imageAlt: z.string().optional(),
      order: z.number().int().default(50),
      seoDescription: z.string(),
    }),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: ({ image }) =>
    z.object({
      lang: localeEnum,
      title: z.string(),
      description: z.string(),
      /** Search intent this article is written against — recorded so it can be audited. */
      intent: z.string(),
      published: z.coerce.date(),
      updated: z.coerce.date().optional(),
      tags: z.array(z.string()).default([]),
      readingMinutes: z.number().int().positive(),
      image: image().optional(),
      imageAlt: z.string().optional(),
      /** Tool slugs this article should link to. */
      tools: z.array(z.string()).default([]),
      featured: z.boolean().default(false),
    }),
});

export const collections = { programs, recipes, blog };
