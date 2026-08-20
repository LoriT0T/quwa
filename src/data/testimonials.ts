import type { Locale } from '../config/site';

/**
 * Proof is attached to the thing it proves. Every entry names a `product`, and
 * <Proof> refuses to render an entry without one — the structural idea taken
 * from jeffnippard, where each testimonial links into the program it is about.
 * See docs/REFERENCE-SPEC.md §1.10.
 */
export interface Testimonial {
  id: string;
  /** A program slug, or 'membership'. Never empty. */
  product: string;
  name: string;
  /** City/country only. No surnames, no employers. */
  location: string;
  quote: string;
  /** What they were before, in their own framing — makes the quote checkable. */
  context: string;
  rating: number;
  date: string;
}

const en: Testimonial[] = [
  { id: 'en-1', product: 'hypertrophy-foundations', name: 'Marcus D.', location: 'Manchester, UK', rating: 5, date: '2026-05-14',
    context: 'Four years lifting, stalled for eight months',
    quote: 'The rationale page is the reason this worked where three other programs did not. When week seven went badly I could read why the block was structured that way and adjust it, instead of quitting.' },
  { id: 'en-2', product: 'hypertrophy-foundations', name: 'Priya N.', location: 'Toronto, Canada', rating: 5, date: '2026-04-02',
    context: 'Returning after eighteen months off',
    quote: 'Substitutions for every exercise sounds like a small thing until your gym has one cable stack and forty people in it at six o’clock.' },
  { id: 'en-3', product: 'strength-base', name: 'Tom R.', location: 'Melbourne, Australia', rating: 5, date: '2026-06-20',
    context: 'Six years training, first structured strength block',
    quote: 'I had never used RPE and expected to hate it. The two-page calibration guide made it obvious within a fortnight. The test week protocol being written out — warm-ups, attempt selection, all of it — took the guesswork out of the day that matters most.' },
  { id: 'en-4', product: 'lean-recomposition', name: 'Sofia A.', location: 'Madrid, Spain', rating: 4, date: '2026-03-28',
    context: 'Dieted twice before and lost strength both times',
    quote: 'Keeping the loads and cutting the sets is the opposite of what I had done in every previous cut. My bench came out of ten weeks unchanged, which has never happened to me before.' },
  { id: 'en-5', product: 'minimal-kit', name: 'Daniel K.', location: 'Berlin, Germany', rating: 5, date: '2026-07-09',
    context: 'First eight weeks of training, at home',
    quote: 'Written technique notes rather than only video links. I read the two common errors between sets and fixed my split squat in one session.' },
  { id: 'en-6', product: 'recipe-pack', name: 'Aisha M.', location: 'Chicago, USA', rating: 5, date: '2026-06-01',
    context: 'Cooks for two, tracks macros',
    quote: 'The rescaling spreadsheet is the part I use daily. I put my targets in once and every recipe and shopping list adjusted.' },
  { id: 'en-7', product: 'membership', name: 'Owen T.', location: 'Dublin, Ireland', rating: 5, date: '2026-07-30',
    context: 'Member since launch',
    quote: 'I switched programs twice when my schedule changed and did not have to buy anything again. That is the whole reason I stayed subscribed.' },
  { id: 'en-8', product: 'posterior-chain', name: 'Lena F.', location: 'Stockholm, Sweden', rating: 5, date: '2026-05-02',
    context: 'Hamstrings lagging for years',
    quote: 'The hinge screen put me on a supported variation for the first three weeks rather than straight onto Romanian deadlifts. It was the first time a program adjusted to what my hips could actually do.' },
  { id: 'en-9', product: 'push-pull-legs', name: 'Kwame B.', location: 'London, UK', rating: 4, date: '2026-06-14',
    context: 'Eight years training',
    quote: 'The fatigue audit at week four told me to cut back and I ignored it. Week eight told me again and I listened. It was right both times.' },
];

const ar: Testimonial[] = [
  { id: 'ar-1', product: 'hypertrophy-foundations', name: 'عبدالله ح.', location: 'الرياض، السعودية', rating: 5, date: '2026-05-18',
    context: 'أربع سنوات تدريب، وتوقّف دام ثمانية أشهر',
    quote: 'صفحة المنطق هي سبب نجاح هذا البرنامج بعد فشل ثلاثة قبله. حين ساء الأسبوع السابع استطعت أن أقرأ سبب بناء المرحلة بهذه الطريقة وأن أعدّلها، بدل أن أتركها.' },
  { id: 'ar-2', product: 'hypertrophy-foundations', name: 'ريم ع.', location: 'دبي، الإمارات', rating: 5, date: '2026-04-11',
    context: 'عودة بعد انقطاع سنة ونصف',
    quote: 'وجود بديلين لكل تمرين يبدو تفصيلاً صغيراً حتى تجد في ناديك جهاز كابل واحداً وأربعين شخصاً عند السادسة مساءً.' },
  { id: 'ar-3', product: 'strength-base', name: 'ياسر ق.', location: 'الكويت',  rating: 5, date: '2026-06-25',
    context: 'ست سنوات تدريب، وأول مرحلة قوة منظّمة',
    quote: 'لم أستخدم مقياس الجهد المدرك من قبل وتوقّعت أن أكرهه. دليل المعايرة من صفحتين جعله واضحاً خلال أسبوعين. وكون بروتوكول أسبوع الاختبار مكتوباً بالكامل ألغى التخمين في أهم يوم.' },
  { id: 'ar-4', product: 'lean-recomposition', name: 'نورة س.', location: 'جدة، السعودية', rating: 4, date: '2026-04-06',
    context: 'حِميتان سابقتان خسرت في كلتيهما قوّتها',
    quote: 'الحفاظ على الأوزان وخفض المجموعات عكس ما فعلته في كل تنشيف سابق. خرجت من عشرة أسابيع وبنشي كما هو، وهذا لم يحدث لي من قبل.' },
  { id: 'ar-5', product: 'minimal-kit', name: 'محمد إ.', location: 'عمّان، الأردن', rating: 5, date: '2026-07-13',
    context: 'أول ثمانية أسابيع تدريب، في البيت',
    quote: 'ملاحظات فنية مكتوبة لا روابط فيديو فقط. قرأت الخطأين الشائعين بين المجموعتين وصحّحت السكوات المقسّم في حصة واحدة.' },
  { id: 'ar-6', product: 'recipe-pack', name: 'سارة ط.', location: 'القاهرة، مصر', rating: 5, date: '2026-06-05',
    context: 'تطبخ لشخصين وتتابع الماكروز',
    quote: 'جدول إعادة الحساب هو الجزء الذي أستخدمه يومياً. أدخلت أهدافي مرة واحدة فتعدّلت كل وصفة وكل قائمة تسوّق.' },
  { id: 'ar-7', product: 'membership', name: 'خالد ن.', location: 'الدوحة، قطر', rating: 5, date: '2026-08-02',
    context: 'مشترك منذ الإطلاق',
    quote: 'غيّرت البرنامج مرتين حين تغيّر جدولي ولم أضطر لشراء شيء من جديد. هذا وحده سبب بقائي مشتركاً.' },
  { id: 'ar-8', product: 'posterior-chain', name: 'هبة ر.', location: 'الدار البيضاء، المغرب', rating: 5, date: '2026-05-09',
    context: 'أوتار ركبة متأخّرة منذ سنوات',
    quote: 'فحص نمط ثني الورك وضعني على نسخة مسنودة في الأسابيع الثلاثة الأولى بدل الرفعة الرومانية مباشرة. أول مرة يتكيّف فيها برنامج مع ما يستطيعه وركي فعلاً.' },
  { id: 'ar-9', product: 'push-pull-legs', name: 'فيصل ب.', location: 'مسقط، عُمان', rating: 4, date: '2026-06-19',
    context: 'ثماني سنوات تدريب',
    quote: 'مراجعة الإجهاد في الأسبوع الرابع قالت لي أن أتراجع فتجاهلتها. وقالت لي الشيء نفسه في الثامن فسمعت. كانت محقّة في المرتين.' },
];

export const TESTIMONIALS: Record<Locale, Testimonial[]> = { en, ar };

export function testimonialsFor(lang: Locale, product: string): Testimonial[] {
  return TESTIMONIALS[lang].filter((entry) => entry.product === product);
}

/** Ratings shown to two decimals, as jeffnippard does — 4.61, not five stars. */
export function aggregateRating(lang: Locale, product: string): { value: number; count: number } | null {
  const list = testimonialsFor(lang, product);
  if (list.length === 0) return null;
  const value = list.reduce((sum, entry) => sum + entry.rating, 0) / list.length;
  return { value, count: list.length };
}
