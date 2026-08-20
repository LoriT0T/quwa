/* Calculator islands. Pure maths comes from lib/calculators; this file only
   reads the form, calls it, and writes the result. */
import {
  calcTdee, calcMacros, calcOneRm, calcBodyFat, calcProtein, calcWater, calcPlates,
  lbToKg, inToCm, kgToLb, PLATES_KG, PLATES_LB,
  type Sex, type ActivityKey, type GoalKey,
} from '../lib/calculators';

interface ToolStrings {
  lang: 'en' | 'ar';
  intlLocale: string;
  results: Record<string, string>;
  units: Record<string, string>;
  categories: Record<string, string> | null;
  labels: Record<string, string>;
}

const root = document.querySelector<HTMLElement>('[data-tool]');
const stringsEl = document.querySelector<HTMLScriptElement>('[data-tool-strings]');

if (root && stringsEl) {
  const S = JSON.parse(stringsEl.textContent ?? '{}') as ToolStrings;
  const form = root.querySelector<HTMLFormElement>('[data-calc-form]')!;
  const output = root.querySelector<HTMLElement>('[data-calc-result]')!;
  const body = root.querySelector<HTMLElement>('[data-result-body]')!;
  const floorWarning = root.querySelector<HTMLElement>('[data-floor-warning]')!;
  const tool = root.dataset.tool!;

  const nf = (value: number, dp = 0): string =>
    new Intl.NumberFormat(S.intlLocale, { minimumFractionDigits: dp, maximumFractionDigits: dp }).format(value);

  const num = (name: string): number => {
    const el = form.elements.namedItem(name);
    return el instanceof HTMLInputElement || el instanceof HTMLSelectElement ? Number(el.value) : 0;
  };
  const str = (name: string): string => {
    const el = form.elements.namedItem(name);
    if (el instanceof RadioNodeList) return el.value;
    return el instanceof HTMLInputElement || el instanceof HTMLSelectElement ? el.value : '';
  };
  const isImperial = (): boolean => str('units') === 'imperial';

  /* Unit labels follow the toggle. */
  const syncUnitLabels = (): void => {
    const imperial = isImperial();
    root.querySelectorAll<HTMLElement>('[data-unit="mass"]').forEach((el) => {
      el.textContent = imperial ? S.units.lb! : S.units.kg!;
    });
    root.querySelectorAll<HTMLElement>('[data-unit="length"]').forEach((el) => {
      el.textContent = imperial ? S.units.in! : S.units.cm!;
    });
  };

  const syncFemaleFields = (): void => {
    const female = str('sex') === 'female';
    root.querySelectorAll<HTMLElement>('[data-female-only]').forEach((el) => { el.hidden = !female; });
    const hip = form.elements.namedItem('hip');
    if (hip instanceof HTMLInputElement) hip.required = female;
  };

  form.addEventListener('change', () => { syncUnitLabels(); syncFemaleFields(); });
  syncUnitLabels();
  syncFemaleFields();

  const massToKg = (v: number): number => (isImperial() ? lbToKg(v) : v);
  const lengthToCm = (v: number): number => (isImperial() ? inToCm(v) : v);
  const massOut = (kg: number): string =>
    isImperial() ? `${nf(kgToLb(kg), 1)} ${S.units.lb}` : `${nf(kg, 1)} ${S.units.kg}`;

  const row = (label: string, value: string, emphasis = false): string =>
    `<div class="rrow${emphasis ? ' rrow-lead' : ''}"><dt>${label}</dt><dd><bdi>${value}</bdi></dd></div>`;

  function render(html: string, floored = false): void {
    body.innerHTML = `<dl class="rlist">${html}</dl>`;
    floorWarning.hidden = !floored;
    output.hidden = false;
    output.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const R = S.results;

    switch (tool) {
      case 'tdee': {
        const result = calcTdee({
          sex: str('sex') as Sex,
          age: num('age'),
          weightKg: massToKg(num('weight')),
          heightCm: lengthToCm(num('height')),
          activity: str('activity') as ActivityKey,
        });
        render(
          row(R.maintain!, `${nf(result.maintain.value)} ${S.units.kcal}`, true) +
          row(R.cut!, `${nf(result.cut.value)} ${S.units.kcal}`) +
          row(R.gain!, `${nf(result.gain.value)} ${S.units.kcal}`) +
          row(R.bmr!, `${nf(result.bmr)} ${S.units.kcal}`),
          result.anyFloored,
        );
        break;
      }

      case 'macros': {
        const result = calcMacros({
          calories: num('calories'),
          weightKg: massToKg(num('weight')),
          goal: str('goal') as GoalKey,
          sex: str('sex') as Sex,
        });
        render(
          row(R.protein!, `${nf(result.protein.grams)} ${S.units.g} · ${nf(result.protein.pct)}${S.units.pct}`, true) +
          row(R.carbs!, `${nf(result.carbs.grams)} ${S.units.g} · ${nf(result.carbs.pct)}${S.units.pct}`) +
          row(R.fat!, `${nf(result.fat.grams)} ${S.units.g} · ${nf(result.fat.pct)}${S.units.pct}`) +
          row(R.total!, `${nf(result.calories.value)} ${S.units.kcal}`),
          result.calories.floored,
        );
        break;
      }

      case 'protein': {
        const result = calcProtein(massToKg(num('weight')), str('goal') as GoalKey, num('meals'));
        render(
          row(R.daily!, `${nf(result.target)} ${S.units.g}`, true) +
          row(R.low!, `${nf(result.low)} ${S.units.g}`) +
          row(R.high!, `${nf(result.high)} ${S.units.g}`) +
          row(R.perMeal!, `${nf(result.perMeal)} ${S.units.g} × ${nf(result.meals)}`),
        );
        break;
      }

      case 'one-rep-max': {
        const weight = num('lift');
        const result = calcOneRm(weight, num('reps'));
        const table = result.table
          .map((r) => `<tr><th scope="row">${nf(r.pct)}${S.units.pct}</th><td><bdi>${massOut(r.weight)}</bdi></td><td><bdi>${nf(Number(r.reps))}</bdi> ${S.units.reps}</td></tr>`)
          .join('');
        body.innerHTML =
          `<dl class="rlist">${
            row(S.labels.avg!, massOut(result.average), true) +
            row('Epley', massOut(result.epley)) +
            row('Brzycki', massOut(result.brzycki)) +
            row('Lombardi', massOut(result.lombardi))
          }</dl>` +
          `<table class="rtable"><caption>${R.table}</caption><tbody>${table}</tbody></table>`;
        floorWarning.hidden = true;
        output.hidden = false;
        break;
      }

      case 'body-fat': {
        const sex = str('sex') as Sex;
        const result = calcBodyFat({
          sex,
          heightCm: lengthToCm(num('height')),
          neckCm: lengthToCm(num('neck')),
          waistCm: lengthToCm(num('waist')),
          hipCm: sex === 'female' ? lengthToCm(num('hip')) : 0,
          weightKg: massToKg(num('weight')),
        });
        if (!result.valid) { render(row(S.labels.error!, '—')); break; }
        const category = S.categories?.[result.category] ?? result.category;
        render(
          row(R.bf!, `${nf(result.percent, 1)}${S.units.pct}`, true) +
          row(R.category!, category) +
          row(R.lbm!, massOut(result.leanMassKg)) +
          row(R.fm!, massOut(result.fatMassKg)),
        );
        break;
      }

      case 'water': {
        const result = calcWater(massToKg(num('weight')), num('minutes'), str('climate') === 'hot');
        const total = isImperial()
          ? `${nf(result.totalFlOz)} ${S.units.floz}`
          : `${nf(result.totalL, 1)} ${S.units.l}`;
        render(
          row(R.total!, total, true) +
          row(R.base!, `${nf(result.baseMl)} ${S.units.ml}`) +
          row(R.training!, `${nf(result.trainingMl)} ${S.units.ml}`) +
          row(R.climate!, `${nf(result.climateMl)} ${S.units.ml}`),
        );
        break;
      }

      case 'plate-loading': {
        const plates = isImperial() ? PLATES_LB : PLATES_KG;
        const result = calcPlates(num('target'), num('bar'), plates);
        const unit = isImperial() ? S.units.lb : S.units.kg;
        const perSide = result.perSide.length
          ? result.perSide.map((p) => `${nf(p.count)} × ${nf(p.plate, p.plate % 1 ? 2 : 0)}`).join('  ·  ')
          : '—';
        render(
          row(R.perSide!, `${perSide} ${unit}`, true) +
          row(R.total!, `${nf(result.loadedTotal, result.loadedTotal % 1 ? 2 : 0)} ${unit}`) +
          (result.exact ? '' : row(S.labels.closest!, `${nf(result.closestBelow, 2)} / ${nf(result.closestAbove, 2)} ${unit}`)),
        );
        break;
      }
    }
  });

  form.addEventListener('reset', () => {
    output.hidden = true;
    setTimeout(() => { syncUnitLabels(); syncFemaleFields(); }, 0);
  });
}
