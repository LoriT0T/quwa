import type { Dict } from '../i18n/en';

export type ToolSlug = 'tdee' | 'macros' | 'one-rep-max' | 'body-fat' | 'protein' | 'water' | 'plate-loading';
type DictKey = 'tdee' | 'macros' | 'onerm' | 'bodyfat' | 'protein' | 'water' | 'plates';

export interface ToolDef {
  slug: ToolSlug;
  key: DictKey;
  /** Order on /tools — the two highest-intent calculators first. */
  order: number;
  related: ToolSlug[];
  /** Whether this tool can produce a calorie figure and therefore needs the floor. */
  hasCalorieFloor: boolean;
}

export const TOOLS: ToolDef[] = [
  { slug: 'tdee',          key: 'tdee',    order: 10, related: ['macros', 'protein'],            hasCalorieFloor: true },
  { slug: 'macros',        key: 'macros',  order: 20, related: ['tdee', 'protein'],              hasCalorieFloor: true },
  { slug: 'protein',       key: 'protein', order: 30, related: ['macros', 'tdee'],               hasCalorieFloor: false },
  { slug: 'one-rep-max',   key: 'onerm',   order: 40, related: ['plate-loading'],                hasCalorieFloor: false },
  { slug: 'body-fat',      key: 'bodyfat', order: 50, related: ['tdee', 'protein'],              hasCalorieFloor: false },
  { slug: 'water',         key: 'water',   order: 60, related: ['tdee'],                         hasCalorieFloor: false },
  { slug: 'plate-loading', key: 'plates',  order: 70, related: ['one-rep-max'],                  hasCalorieFloor: false },
];

export function getTool(slug: string): ToolDef | undefined {
  return TOOLS.find((tool) => tool.slug === slug);
}

/** The locale strings for a tool, resolved from its dictionary key. */
export function toolStrings(dict: Dict, tool: ToolDef) {
  return dict.tools[tool.key];
}
