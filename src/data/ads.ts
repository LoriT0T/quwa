import type { Locale } from '../config/site';

/**
 * The ad creatives, their specs and their copy. Mirrors docs/AD-COPY.md — the
 * doc is for whoever runs the campaign, this is what the Ad Library page renders.
 * Files are produced by `npm run ads` from the same brand tokens as the site.
 */
export interface AdCreative {
  id: string;
  file: string;
  platform: 'facebook' | 'instagram';
  width: number;
  height: number;
  ratio: string;
  /** Which concept this belongs to — see CONCEPTS below. */
  concept: 'tools' | 'numbers';
}

export const CREATIVES: Record<Locale, AdCreative[]> = {
  en: [
    { id: 'fb-en', file: 'fb-1200x628-en.png', platform: 'facebook', width: 1200, height: 628, ratio: '1.91:1', concept: 'tools' },
    { id: 'ig-en', file: 'ig-1080x1350-en.png', platform: 'instagram', width: 1080, height: 1350, ratio: '4:5', concept: 'numbers' },
  ],
  ar: [
    { id: 'fb-ar', file: 'fb-1200x628-ar.png', platform: 'facebook', width: 1200, height: 628, ratio: '1.91:1', concept: 'tools' },
    { id: 'ig-ar', file: 'ig-1080x1350-ar.png', platform: 'instagram', width: 1080, height: 1350, ratio: '4:5', concept: 'numbers' },
  ],
};

export interface AdCopy {
  primaryText: string;
  headline: string;
  description?: string;
  cta: string;
  destination: string;
  firstComment?: string;
}

export const AD_COPY: Record<Locale, Record<string, AdCopy>> = {
  en: {
    'fb-en': {
      primaryText:
        'Seven free calculators that do the arithmetic properly. Calories, macros, protein target, one-rep max — about a minute each, no signup and no card. Then decide whether you want a program.',
      headline: 'Train with a plan, not a guess.',
      description: 'Free tools · English and العربية',
      cta: 'Learn more',
      destination: '/en/tools/',
    },
    'ig-en': {
      primaryText:
        'Your calories, your macros, your one-rep max — in about a minute. No signup, no card, no email required to see the result. Seven free calculators, in English and Arabic.',
      headline: 'Your calories, macros and one-rep max.',
      cta: 'Learn more',
      destination: '/en/tools/tdee/',
      firstComment:
        'The full set is at quwa.fit/en/tools — TDEE, macros, protein, one-rep max, body fat, water, plate loading.',
    },
  },
  ar: {
    'fb-ar': {
      primaryText:
        'سبع حاسبات مجانية تُجري الحساب بدقة. السعرات والماكروز وهدف البروتين وأقصى وزن لتكرار واحد — نحو دقيقة لكل واحدة، بلا تسجيل وبلا بطاقة. ثم قرّر إن كنت تريد برنامجاً.',
      headline: 'تدرّب بخطة، لا بالتخمين.',
      description: 'أدوات مجانية · بالعربية والإنجليزية',
      cta: 'اعرف المزيد',
      destination: '/ar/tools/',
    },
    'ig-ar': {
      primaryText:
        'سعراتك، وماكروزك، وأقصى وزن لك — في نحو دقيقة. بلا تسجيل، وبلا بطاقة، وبلا بريد لرؤية النتيجة. سبع حاسبات مجانية، بالعربية والإنجليزية.',
      headline: 'سعراتك، وماكروزك، وأقصى وزن لك.',
      cta: 'اعرف المزيد',
      destination: '/ar/tools/tdee/',
      firstComment:
        'المجموعة كاملة على quwa.fit/ar/tools — الطاقة اليومية والماكروز والبروتين وأقصى وزن ونسبة الدهون والماء وتوزيع الأقراص.',
    },
  },
};
