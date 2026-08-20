/* ─────────────────────────────────────────────────────────────────────────────
   Pure calculator maths. No DOM, no i18n, no formatting — those live in the
   island components. Every function that can return a calorie figure routes it
   through `applyCalorieFloor` first.
   ───────────────────────────────────────────────────────────────────────────── */

export type Sex = 'male' | 'female';
export type ActivityKey = 'sedentary' | 'light' | 'moderate' | 'high' | 'athlete';
export type GoalKey = 'cut' | 'maintain' | 'gain';

/**
 * A calorie target below these figures is a product defect and a liability.
 * Anything under them is clamped and flagged so the UI can tell the user to
 * speak to a professional instead of quietly showing a starvation number.
 */
export const CALORIE_FLOOR: Record<Sex, number> = { female: 1200, male: 1500 };

export const ACTIVITY_MULTIPLIER: Record<ActivityKey, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  high: 1.725,
  athlete: 1.9,
};

export interface FlooredCalories {
  value: number;
  /** True when the raw figure was below the floor and has been clamped. */
  floored: boolean;
  raw: number;
}

export function applyCalorieFloor(kcal: number, sex: Sex): FlooredCalories {
  const floor = CALORIE_FLOOR[sex];
  const raw = Math.round(kcal);
  return raw < floor ? { value: floor, floored: true, raw } : { value: raw, floored: false, raw };
}

/* ── Units ─────────────────────────────────────────────────────────────────── */
export const lbToKg = (lb: number): number => lb * 0.45359237;
export const kgToLb = (kg: number): number => kg / 0.45359237;
export const inToCm = (inches: number): number => inches * 2.54;
export const cmToIn = (cm: number): number => cm / 2.54;

const clamp = (n: number, min: number, max: number): number => Math.min(max, Math.max(min, n));
const round = (n: number, dp = 0): number => {
  const f = 10 ** dp;
  return Math.round(n * f) / f;
};

/* ── 1. TDEE and maintenance calories ──────────────────────────────────────── */
export interface TdeeInput {
  sex: Sex;
  age: number;
  weightKg: number;
  heightCm: number;
  activity: ActivityKey;
}
export interface TdeeResult {
  bmr: number;
  tdee: number;
  maintain: FlooredCalories;
  cut: FlooredCalories;
  gain: FlooredCalories;
  anyFloored: boolean;
}

/** Mifflin-St Jeor — the most accurate published equation for the general population. */
export function bmrMifflinStJeor({ sex, age, weightKg, heightCm }: Omit<TdeeInput, 'activity'>): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === 'male' ? base + 5 : base - 161;
}

export function calcTdee(input: TdeeInput): TdeeResult {
  const bmr = bmrMifflinStJeor(input);
  const tdee = bmr * ACTIVITY_MULTIPLIER[input.activity];
  const maintain = applyCalorieFloor(tdee, input.sex);
  const cut = applyCalorieFloor(tdee * 0.8, input.sex);
  const gain = applyCalorieFloor(tdee * 1.1, input.sex);
  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    maintain,
    cut,
    gain,
    anyFloored: maintain.floored || cut.floored || gain.floored,
  };
}

/* ── 2. Macro split ────────────────────────────────────────────────────────── */
export interface MacroInput {
  calories: number;
  weightKg: number;
  goal: GoalKey;
  sex: Sex;
}
export interface MacroResult {
  calories: FlooredCalories;
  protein: { grams: number; kcal: number; pct: number };
  fat: { grams: number; kcal: number; pct: number };
  carbs: { grams: number; kcal: number; pct: number };
}

const PROTEIN_G_PER_KG: Record<GoalKey, number> = { cut: 2.2, maintain: 1.8, gain: 1.8 };
/** Fat floor as a share of calories. Below ~20% is not a nutrition position we will ship. */
const FAT_PCT: Record<GoalKey, number> = { cut: 0.25, maintain: 0.28, gain: 0.25 };

export function calcMacros({ calories, weightKg, goal, sex }: MacroInput): MacroResult {
  const floored = applyCalorieFloor(calories, sex);
  const kcal = floored.value;

  const proteinG = round(weightKg * PROTEIN_G_PER_KG[goal]);
  const proteinKcal = proteinG * 4;

  let fatKcal = kcal * FAT_PCT[goal];
  // Protein plus the fat floor must still leave room for some carbohydrate.
  const minFatKcal = kcal * 0.2;
  if (proteinKcal + fatKcal > kcal * 0.9) fatKcal = Math.max(minFatKcal, kcal * 0.9 - proteinKcal);
  const fatG = round(fatKcal / 9);

  const carbsKcal = Math.max(0, kcal - proteinKcal - fatG * 9);
  const carbsG = round(carbsKcal / 4);

  return {
    calories: floored,
    protein: { grams: proteinG, kcal: proteinKcal, pct: round((proteinKcal / kcal) * 100) },
    fat: { grams: fatG, kcal: fatG * 9, pct: round(((fatG * 9) / kcal) * 100) },
    carbs: { grams: carbsG, kcal: carbsG * 4, pct: round(((carbsG * 4) / kcal) * 100) },
  };
}

/* ── 3. One-rep max ────────────────────────────────────────────────────────── */
export interface OneRmResult {
  epley: number;
  brzycki: number;
  lombardi: number;
  average: number;
  /** Reliability drops sharply above ~10 reps. */
  lowConfidence: boolean;
  table: { pct: number; weight: number; reps: string }[];
}

const PCT_TABLE: { pct: number; reps: string }[] = [
  { pct: 100, reps: '1' },
  { pct: 95, reps: '2' },
  { pct: 92, reps: '3' },
  { pct: 89, reps: '4' },
  { pct: 86, reps: '5' },
  { pct: 83, reps: '6' },
  { pct: 81, reps: '7' },
  { pct: 78, reps: '8' },
  { pct: 76, reps: '9' },
  { pct: 74, reps: '10' },
  { pct: 70, reps: '12' },
  { pct: 65, reps: '15' },
];

export function calcOneRm(weight: number, reps: number): OneRmResult {
  const r = clamp(reps, 1, 20);
  const epley = reps === 1 ? weight : weight * (1 + r / 30);
  const brzycki = reps === 1 ? weight : weight * (36 / (37 - r));
  const lombardi = weight * Math.pow(r, 0.1);
  const average = (epley + brzycki + lombardi) / 3;
  return {
    epley: round(epley, 1),
    brzycki: round(brzycki, 1),
    lombardi: round(lombardi, 1),
    average: round(average, 1),
    lowConfidence: reps > 10,
    table: PCT_TABLE.map(({ pct, reps: rp }) => ({
      pct,
      weight: round((average * pct) / 100, 1),
      reps: rp,
    })),
  };
}

/* ── 4. Body-fat estimate (US Navy circumference method) ───────────────────── */
export interface BodyFatInput {
  sex: Sex;
  heightCm: number;
  neckCm: number;
  waistCm: number;
  /** Required for female estimates; ignored for male. */
  hipCm?: number;
  weightKg: number;
}
export type BodyFatCategory = 'essential' | 'athlete' | 'fitness' | 'average' | 'high';
export interface BodyFatResult {
  percent: number;
  leanMassKg: number;
  fatMassKg: number;
  category: BodyFatCategory;
  valid: boolean;
}

const CATEGORY_BOUNDS: Record<Sex, [number, number, number, number]> = {
  // upper bound of: essential, athlete, fitness, average
  male: [5, 13, 17, 24],
  female: [13, 20, 24, 31],
};

export function calcBodyFat(input: BodyFatInput): BodyFatResult {
  const { sex, heightCm, neckCm, waistCm, hipCm = 0, weightKg } = input;
  const h = cmToIn(heightCm);
  const neck = cmToIn(neckCm);
  const waist = cmToIn(waistCm);
  const hip = cmToIn(hipCm);

  // The logarithm is undefined unless the girth difference is positive.
  const girth = sex === 'male' ? waist - neck : waist + hip - neck;
  if (girth <= 0 || h <= 0) {
    return { percent: 0, leanMassKg: 0, fatMassKg: 0, category: 'average', valid: false };
  }

  const percent =
    sex === 'male'
      ? 495 / (1.0324 - 0.19077 * Math.log10(girth) + 0.15456 * Math.log10(h)) - 450
      : 495 / (1.29579 - 0.35004 * Math.log10(girth) + 0.221 * Math.log10(h)) - 450;

  const pct = clamp(round(percent, 1), 3, 65);
  const fatMassKg = round((weightKg * pct) / 100, 1);
  const bounds = CATEGORY_BOUNDS[sex];
  const category: BodyFatCategory =
    pct <= bounds[0] ? 'essential'
    : pct <= bounds[1] ? 'athlete'
    : pct <= bounds[2] ? 'fitness'
    : pct <= bounds[3] ? 'average'
    : 'high';

  return {
    percent: pct,
    leanMassKg: round(weightKg - fatMassKg, 1),
    fatMassKg,
    category,
    valid: true,
  };
}

/* ── 5. Protein target ─────────────────────────────────────────────────────── */
export interface ProteinResult {
  low: number;
  high: number;
  target: number;
  perMeal: number;
  meals: number;
}

const PROTEIN_RANGE: Record<GoalKey, [number, number]> = {
  cut: [2.0, 2.4],
  maintain: [1.6, 2.0],
  gain: [1.6, 2.2],
};

export function calcProtein(weightKg: number, goal: GoalKey, meals = 4): ProteinResult {
  const [lowFactor, highFactor] = PROTEIN_RANGE[goal];
  const low = Math.round(weightKg * lowFactor);
  const high = Math.round(weightKg * highFactor);
  const target = Math.round((low + high) / 2);
  const mealCount = clamp(Math.round(meals), 2, 6);
  return { low, high, target, perMeal: Math.round(target / mealCount), meals: mealCount };
}

/* ── 6. Water intake ───────────────────────────────────────────────────────── */
export interface WaterResult {
  baseMl: number;
  trainingMl: number;
  climateMl: number;
  totalMl: number;
  totalL: number;
  totalFlOz: number;
}

export function calcWater(weightKg: number, trainingMinutes: number, hotClimate: boolean): WaterResult {
  const baseMl = Math.round(weightKg * 35);
  const trainingMl = Math.round((clamp(trainingMinutes, 0, 300) / 60) * 500);
  const climateMl = hotClimate ? 500 : 0;
  const totalMl = baseMl + trainingMl + climateMl;
  return {
    baseMl,
    trainingMl,
    climateMl,
    totalMl,
    totalL: round(totalMl / 1000, 1),
    totalFlOz: Math.round(totalMl / 29.5735),
  };
}

/* ── 7. Plate loading ──────────────────────────────────────────────────────── */
export const PLATES_KG = [25, 20, 15, 10, 5, 2.5, 1.25] as const;
export const PLATES_LB = [45, 35, 25, 10, 5, 2.5] as const;

export interface PlateResult {
  perSide: { plate: number; count: number }[];
  loadedTotal: number;
  exact: boolean;
  /** The nearest loadable weights either side of the target, when it is not exact. */
  closestBelow: number;
  closestAbove: number;
}

export function calcPlates(
  target: number,
  barWeight: number,
  available: readonly number[],
): PlateResult {
  const perSideTarget = (target - barWeight) / 2;
  if (perSideTarget < 0) {
    return { perSide: [], loadedTotal: barWeight, exact: target === barWeight, closestBelow: barWeight, closestAbove: barWeight };
  }

  const sorted = [...available].sort((a, b) => b - a);
  const perSide: { plate: number; count: number }[] = [];
  let remaining = perSideTarget;

  for (const plate of sorted) {
    const count = Math.floor((remaining + 1e-9) / plate);
    if (count > 0) {
      perSide.push({ plate, count });
      remaining = round(remaining - count * plate, 4);
    }
  }

  const loadedPerSide = perSideTarget - remaining;
  const loadedTotal = round(barWeight + loadedPerSide * 2, 2);
  const smallest = sorted[sorted.length - 1] ?? 0;
  return {
    perSide,
    loadedTotal,
    exact: Math.abs(remaining) < 1e-6,
    closestBelow: loadedTotal,
    closestAbove: round(loadedTotal + smallest * 2, 2),
  };
}
