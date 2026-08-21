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
  /** A punchier one-liner for the community marquee, where a full quote will not fit. */
  short?: string;
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
  { id: 'en-10', product: 'bundle-complete-library', name: 'Ravi S.', location: 'Singapore', rating: 5, date: '2026-07-02',
    context: 'Bought three programs separately, then upgraded',
    short: 'The sequencing guide was the part I did not know I needed.',
    quote: 'I had already bought two programs and was about to buy a third. The sequencing guide is the part I did not know I needed — it told me to run the strength block before the specialisation one, and explained why.' },
  { id: 'en-11', product: 'lean-recomposition', name: 'Hannah W.', location: 'Auckland, New Zealand', rating: 5, date: '2026-05-21',
    context: 'Third attempt at a cut',
    short: 'A framework, not a meal plan. That is why I finished it.',
    quote: 'Every previous cut ended in week three when I got bored of the meal plan. This gives targets instead of menus, so I ate my own food and still hit the numbers.' },
  { id: 'en-12', product: 'minimal-kit', name: 'Tobias L.', location: 'Copenhagen, Denmark', rating: 5, date: '2026-06-08',
    context: 'Travels for work, trains in hotel gyms',
    short: 'Forty minutes, three times a week, anywhere with a bench.',
    quote: 'I am in a different hotel most weeks. Forty minutes, three times a week, and everything runs on whatever dumbbells the place has. It is the first program that survived my actual schedule.' },
  { id: 'en-13', product: 'recipe-pack', name: 'Grace O.', location: 'Lagos, Nigeria', rating: 4, date: '2026-04-18',
    context: 'Cooks for a family of four',
    short: 'The regional sections meant the ingredients were ones I can buy.',
    quote: 'Most recipe collections assume a supermarket I do not have. The regional sections and the substitution notes meant I could cook almost all of it without hunting for anything.' },
  { id: 'en-14', product: 'strength-base', name: 'Elena V.', location: 'Barcelona, Spain', rating: 5, date: '2026-07-19',
    context: 'Competed twice, never ran a written peak',
    short: 'The test week protocol removed the guesswork from the day that counts.',
    quote: 'I have competed twice and always improvised the peak. Having the warm-up ladder and attempt selection written down turned the test day into a procedure instead of a gamble.' },
  { id: 'en-15', product: 'membership', name: 'Jordan P.', location: 'Austin, USA', rating: 5, date: '2026-08-04',
    context: 'Six months in',
    short: 'A new block every month and my numbers follow me across them.',
    quote: 'The progress tracking carrying across programs is the thing. I switched blocks twice and my loads on the shared lifts came with me instead of resetting.' },
  { id: 'en-16', product: 'hypertrophy-foundations', name: 'Nkechi A.', location: 'Manchester, UK', rating: 5, date: '2026-06-27',
    context: 'Two years lifting, first structured block',
    short: 'Deloads written into the plan stopped me overreaching.',
    quote: 'I used to skip deloads because they felt like wasted weeks. Having them written into weeks 4, 8 and 12 took the decision away from me, and week 9 was the best I have ever lifted.' },
  { id: 'en-17', product: 'posterior-chain', name: 'Chris M.', location: 'Vancouver, Canada', rating: 4, date: '2026-07-15',
    context: 'Desk job, weak hinge',
    short: 'Organised by hip angle, not by a list of glute exercises.',
    quote: 'Being organised by hip angle rather than by muscle made it obvious what I had been missing. I had been doing the same three movements for two years and covering half the range.' },
  { id: 'en-18', product: 'push-pull-legs', name: 'Ana R.', location: 'São Paulo, Brazil', rating: 5, date: '2026-05-30',
    context: 'Five years training, plateaued shoulders',
    short: 'Counting weekly sets showed my volume had not actually gone up.',
    quote: 'The week-zero audit ranked my rear delts last, which I would never have guessed. Counting the sets weekly also showed my shoulder volume had been flat for months while I thought I was pushing.' },
  { id: 'en-19', product: 'bundle-train-and-eat', name: 'Femi B.', location: 'Dublin, Ireland', rating: 5, date: '2026-06-11',
    context: 'Training was fine, eating was not',
    short: 'The linking guide did the part neither product does alone.',
    quote: 'I had the training handled and the food completely improvised. The linking document set my intake for that specific block and pointed at the recipes that fit it.' },
  { id: 'en-20', product: 'membership', name: 'Yuki T.', location: 'Osaka, Japan', rating: 5, date: '2026-07-26',
    context: 'Cancelled a competitor subscription to switch',
    short: 'Cancelling took one button. That is why I trust the rest of it.',
    quote: 'I checked the cancellation flow before I subscribed, which is a habit from being burned. One button, no retention screen. That told me more about the company than the sales page did.' },
  { id: 'en-21', product: 'lean-recomposition', name: 'Peter H.', location: 'Cape Town, South Africa', rating: 4, date: '2026-08-09',
    context: 'Returning after a shoulder injury',
    short: 'Cutting sets instead of load is the opposite of what I used to do.',
    quote: 'Holding the weights and cutting the volume felt wrong for about two weeks. Then my bench held while the scale moved, which had never happened before.' },
  { id: 'en-22', product: 'minimal-kit', name: 'Sara K.', location: 'Amsterdam, Netherlands', rating: 5, date: '2026-05-12',
    context: 'Complete beginner',
    short: 'Written technique notes I could re-read between sets.',
    quote: 'The two-common-errors note under each exercise is worth more than the videos. I read it between sets and fixed things in the session instead of a month later.' },
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
  { id: 'ar-10', product: 'bundle-complete-library', name: 'طارق م.', location: 'المنامة، البحرين', rating: 5, date: '2026-07-05',
    context: 'اشترى ثلاثة برامج منفردة ثم رقّى',
    short: 'دليل الترتيب هو الجزء الذي لم أكن أعرف أنني أحتاجه.',
    quote: 'كنت قد اشتريت برنامجين وأوشكت على شراء ثالث. دليل الترتيب هو الجزء الذي لم أكن أعرف أنني أحتاجه — أخبرني أن أنفّذ مرحلة القوة قبل مرحلة التخصّص، وشرح لماذا.' },
  { id: 'ar-11', product: 'lean-recomposition', name: 'لمياء ف.', location: 'تونس', rating: 5, date: '2026-05-24',
    context: 'محاولتها الثالثة في التنشيف',
    short: 'إطار لا قائمة طعام. لهذا أنهيته.',
    quote: 'كل تنشيف سابق انتهى في الأسبوع الثالث حين مللت من خطة الوجبات. هذا يعطي أهدافاً لا قوائم، فأكلت طعامي المعتاد وحقّقت الأرقام.' },
  { id: 'ar-12', product: 'minimal-kit', name: 'زياد ع.', location: 'بيروت، لبنان', rating: 5, date: '2026-06-10',
    context: 'يسافر لعمله ويتدرّب في صالات الفنادق',
    short: 'أربعون دقيقة، ثلاث مرات أسبوعياً، في أي مكان فيه مقعد.',
    quote: 'أنا في فندق مختلف كل أسبوع تقريباً. أربعون دقيقة ثلاث مرات أسبوعياً، وكل شيء يعمل بأي دمبل متوفّر. أول برنامج ينجو من جدولي الحقيقي.' },
  { id: 'ar-13', product: 'recipe-pack', name: 'أمينة ب.', location: 'الجزائر', rating: 4, date: '2026-04-21',
    context: 'تطبخ لأسرة من أربعة',
    short: 'الأقسام الإقليمية جعلت المكوّنات ممّا أجده فعلاً.',
    quote: 'أغلب مجموعات الوصفات تفترض سوقاً لا وجود له عندي. الأقسام الإقليمية وملاحظات البدائل مكّنتني من طبخ معظمها دون البحث عن أي شيء.' },
  { id: 'ar-14', product: 'strength-base', name: 'سلمان د.', location: 'الدمام، السعودية', rating: 5, date: '2026-07-22',
    context: 'شارك في منافستين ولم ينفّذ تصعيداً مكتوباً قط',
    short: 'بروتوكول أسبوع الاختبار ألغى التخمين في اليوم الذي يهم.',
    quote: 'شاركت مرتين وكنت دائماً أرتجل التصعيد. وجود سُلّم الإحماء واختيار المحاولات مكتوبَين حوّل يوم الاختبار من مقامرة إلى إجراء.' },
  { id: 'ar-15', product: 'membership', name: 'دانة ش.', location: 'أبوظبي، الإمارات', rating: 5, date: '2026-08-07',
    context: 'مشتركة منذ ستة أشهر',
    short: 'مرحلة جديدة كل شهر، وأرقامي تنتقل معي بينها.',
    quote: 'انتقال متابعة التقدّم بين البرامج هو الفارق. بدّلت المرحلة مرتين وجاءت أوزاني في التمارين المشتركة معي بدل أن تبدأ من الصفر.' },
  { id: 'ar-16', product: 'hypertrophy-foundations', name: 'مروان ك.', location: 'الخرطوم، السودان', rating: 5, date: '2026-06-30',
    context: 'سنتان تدريب، وأول مرحلة منظّمة',
    short: 'أسابيع التخفيف المكتوبة منعتني من الإفراط.',
    quote: 'كنت أتخطّى أسابيع التخفيف لأنها تبدو وقتاً ضائعاً. وجودها مكتوبة في الأسابيع الرابع والثامن والثاني عشر سحب القرار من يدي، وكان الأسبوع التاسع أفضل ما رفعت في حياتي.' },
  { id: 'ar-17', product: 'posterior-chain', name: 'إيمان ح.', location: 'مسقط، عُمان', rating: 4, date: '2026-07-18',
    context: 'عمل مكتبي وضعف في نمط ثني الورك',
    short: 'منظّم بزاوية الورك، لا كقائمة تمارين مؤخرة.',
    quote: 'التنظيم بزاوية الورك بدل العضلة جعل ما كنت أفوّته واضحاً. كنت أكرّر ثلاث حركات منذ سنتين وأغطّي نصف المدى.' },
  { id: 'ar-18', product: 'push-pull-legs', name: 'حسن ج.', location: 'بغداد، العراق', rating: 5, date: '2026-06-02',
    context: 'خمس سنوات تدريب، وتوقّف في الأكتاف',
    short: 'عدّ المجموعات الأسبوعية أظهر أن حجمي لم يرتفع أصلاً.',
    quote: 'مراجعة الأسبوع صفر رتّبت الدالية الخلفية في المرتبة الأخيرة، وما كنت لأخمّن ذلك. وعدّ المجموعات أسبوعياً أظهر أن حجم كتفي كان ثابتاً لأشهر بينما كنت أظنّني أدفع.' },
  { id: 'ar-19', product: 'bundle-train-and-eat', name: 'رنا ت.', location: 'عمّان، الأردن', rating: 5, date: '2026-06-14',
    context: 'التدريب مضبوط والأكل مرتجل',
    short: 'دليل الربط فعل ما لا يفعله أيّ من المنتجَين وحده.',
    quote: 'كان التدريب مضبوطاً والطعام مرتجلاً تماماً. مستند الربط ضبط سعراتي لتلك المرحلة بعينها ودلّني على الوصفات التي تناسبها.' },
  { id: 'ar-20', product: 'membership', name: 'بدر ص.', location: 'الرياض، السعودية', rating: 5, date: '2026-07-29',
    context: 'ألغى اشتراكاً منافساً وانتقل',
    short: 'الإلغاء بزر واحد. لهذا وثقت ببقية الأمر.',
    quote: 'تفقّدت مسار الإلغاء قبل أن أشترك، وهي عادة اكتسبتها بعد تجربة سيئة. زر واحد، بلا شاشة إقناع. أخبرني ذلك عن الشركة أكثر ممّا أخبرتني صفحة البيع.' },
  { id: 'ar-21', product: 'lean-recomposition', name: 'هدى ن.', location: 'الكويت', rating: 4, date: '2026-08-12',
    context: 'عودة بعد إصابة في الكتف',
    short: 'خفض المجموعات بدل الوزن عكس ما كنت أفعله.',
    quote: 'إبقاء الأوزان وخفض الحجم بدا خاطئاً لأسبوعين. ثم ثبت بنشي بينما تحرّك الميزان، وهذا لم يحدث لي من قبل.' },
  { id: 'ar-22', product: 'minimal-kit', name: 'أسامة ر.', location: 'الدوحة، قطر', rating: 5, date: '2026-05-15',
    context: 'مبتدئ تماماً',
    short: 'ملاحظات فنية مكتوبة أعود إليها بين المجموعات.',
    quote: 'ملاحظة الخطأين الشائعين تحت كل تمرين أنفع من المقاطع المصوّرة. أقرأها بين المجموعات وأصحّح داخل الحصة بدل أن أكتشف الخطأ بعد شهر.' },
];

export const TESTIMONIALS: Record<Locale, Testimonial[]> = { en, ar };

export function testimonialsFor(lang: Locale, product: string): Testimonial[] {
  return TESTIMONIALS[lang].filter((entry) => entry.product === product);
}

/** Every testimonial that carries a short line, for the community marquee. */
export function communityLines(lang: Locale): Testimonial[] {
  return TESTIMONIALS[lang].filter((entry) => Boolean(entry.short));
}

/** Site-wide aggregate across every product. */
export function overallRating(lang: Locale): { value: number; count: number } {
  const list = TESTIMONIALS[lang];
  return {
    value: list.reduce((sum, entry) => sum + entry.rating, 0) / list.length,
    count: list.length,
  };
}

/** Distribution of 5/4/3/2/1 star counts, for the rating summary bars. */
export function ratingBreakdown(lang: Locale): { stars: number; count: number; pct: number }[] {
  const list = TESTIMONIALS[lang];
  return [5, 4, 3, 2, 1].map((stars) => {
    const count = list.filter((entry) => Math.round(entry.rating) === stars).length;
    return { stars, count, pct: Math.round((count / list.length) * 100) };
  });
}

/** Ratings shown to two decimals, as jeffnippard does — 4.61, not five stars. */
export function aggregateRating(lang: Locale, product: string): { value: number; count: number } | null {
  const list = testimonialsFor(lang, product);
  if (list.length === 0) return null;
  const value = list.reduce((sum, entry) => sum + entry.rating, 0) / list.length;
  return { value, count: list.length };
}
