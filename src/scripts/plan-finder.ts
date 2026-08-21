/* Plan finder. Scores the real catalogue against four answers; no network, no email. */

interface Program {
  id: string; title: string; line: string;
  level: string; goal: string; equipment: string; days: number;
  href: string; price: string; cents: number;
}
interface Copy {
  resultTitle: string; resultNone: string; resultWhy: string; alsoFits: string;
  viewProgram: string; progress: string;
  level: string; goal: string; equipment: string; daysPerWeek: string;
}

const root = document.querySelector<HTMLElement>('[data-plan-finder]');

if (root) {
  const catalogue = JSON.parse(
    root.querySelector('[data-finder-catalogue]')?.textContent ?? '[]',
  ) as Program[];
  const copy = JSON.parse(root.querySelector('[data-finder-copy]')?.textContent ?? '{}') as Copy;

  const quiz = root.querySelector<HTMLElement>('[data-finder-quiz]')!;
  const result = root.querySelector<HTMLElement>('[data-finder-result]')!;
  const restart = root.querySelector<HTMLButtonElement>('[data-finder-restart]')!;
  const progress = root.querySelector<HTMLElement>('[data-finder-progress]')!;
  const bar = root.querySelector<HTMLElement>('[data-finder-bar]')!;
  const questions = Array.from(root.querySelectorAll<HTMLFieldSetElement>('[data-question]'));

  const answers: Record<string, string> = {};
  let step = 0;

  /** Equipment is a ladder: a full gym can run a minimal program, not the reverse. */
  const EQUIPMENT_RANK: Record<string, number> = { none: 0, minimal: 1, 'home-rack': 2, 'full-gym': 3 };

  function score(program: Program): { total: number; reasons: string[] } {
    const reasons: string[] = [];
    let total = 0;

    if (program.level === answers.level) { total += 3; reasons.push(copy.level); }
    else if (program.level === 'all') total += 2;
    // One step out of your band is workable; two is not.
    else {
      const order = ['beginner', 'intermediate', 'advanced'];
      const gap = Math.abs(order.indexOf(program.level) - order.indexOf(answers.level ?? ''));
      total += gap === 1 ? 1 : -2;
    }

    if (program.goal === answers.goal) { total += 3; reasons.push(copy.goal); }
    else if (program.goal === 'muscle' && answers.goal === 'strength') total += 1;
    else if (program.goal === 'strength' && answers.goal === 'muscle') total += 1;

    const have = EQUIPMENT_RANK[answers.equipment ?? 'full-gym'] ?? 3;
    const need = EQUIPMENT_RANK[program.equipment] ?? 0;
    if (need <= have) { total += 2; if (need === have) reasons.push(copy.equipment); }
    else total -= 4; // cannot be run at all

    const days = Number(answers.days ?? 4);
    const diff = Math.abs(program.days - days);
    if (diff === 0) { total += 2; reasons.push(copy.daysPerWeek.replace('{n}', String(program.days))); }
    else if (diff === 1) total += 1;
    else if (program.days > days) total -= 3; // asks for more days than they have

    return { total, reasons };
  }

  function show(index: number): void {
    questions.forEach((q, i) => { q.hidden = i !== index; });
    progress.textContent = copy.progress.replace('{n}', String(index + 1));
    bar.style.inlineSize = `${((index + 1) / questions.length) * 100}%`;
  }

  function finish(): void {
    quiz.hidden = true;
    restart.hidden = false;

    const ranked = catalogue
      .map((program) => ({ program, ...score(program) }))
      .sort((a, b) => b.total - a.total);

    const best = ranked[0];
    const alternatives = ranked.slice(1, 3).filter((r) => r.total > 0);
    if (!best || best.total <= 0) {
      result.innerHTML = `<p class="none">${escape(copy.resultNone)}</p>`;
      result.hidden = false;
      return;
    }

    result.innerHTML = `
      <p class="r-eyebrow">${escape(copy.resultTitle)}</p>
      <h3 class="r-title">${escape(best.program.title)}</h3>
      <p class="r-line">${escape(best.program.line)}</p>
      ${best.reasons.length ? `
        <p class="r-why">${escape(copy.resultWhy)}</p>
        <ul class="r-tags">${best.reasons.map((r) => `<li>${escape(r)}</li>`).join('')}</ul>` : ''}
      <p class="r-actions">
        <a class="btn btn-primary" href="${best.program.href}">${escape(copy.viewProgram)} · ${escape(best.program.price)}</a>
      </p>
      ${alternatives.length ? `
        <div class="r-alt">
          <p class="r-alt-label">${escape(copy.alsoFits)}</p>
          <ul class="r-alt-list">
            ${alternatives.map((a) => `<li><a href="${a.program.href}"><span>${escape(a.program.title)}</span><span class="r-alt-price">${escape(a.program.price)}</span></a></li>`).join('')}
          </ul>
        </div>` : ''}
    `;
    result.hidden = false;
    result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  questions.forEach((q) => {
    q.querySelectorAll<HTMLButtonElement>('[data-answer]').forEach((btn) => {
      btn.addEventListener('click', () => {
        answers[q.dataset.question ?? ''] = btn.dataset.answer ?? '';
        step += 1;
        if (step >= questions.length) finish();
        else show(step);
      });
    });
  });

  restart.addEventListener('click', () => {
    step = 0;
    for (const key of Object.keys(answers)) delete answers[key];
    quiz.hidden = false;
    result.hidden = true;
    restart.hidden = true;
    show(0);
  });

  show(0);
}

function escape(value: string): string {
  return String(value).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c);
}
