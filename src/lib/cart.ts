/* Client-side cart. localStorage only — there is no server on GitHub Pages.
   Imported by islands; never evaluated during the build. */

export interface CartLine {
  id: string;
  title: string;
  /** USD cents. Display conversion happens at render time. */
  unitAmount: number;
  quantity: number;
  kind: 'one_time' | 'subscription';
  slug: string;
}

const KEY = 'quwa.cart.v1';
const REF_KEY = 'quwa.referral.v1';
export const CART_EVENT = 'quwa:cart';

function read(): CartLine[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as CartLine[]) : [];
  } catch {
    return [];
  }
}

function write(lines: CartLine[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(lines));
  } catch {
    /* storage full or blocked — the cart degrades to in-memory for this page */
  }
  window.dispatchEvent(new CustomEvent(CART_EVENT, { detail: lines }));
}

export const getCart = read;

export function addItem(line: Omit<CartLine, 'quantity'>, quantity = 1): CartLine[] {
  const lines = read();
  const existing = lines.find((l) => l.id === line.id);
  // A subscription is a singleton; buying two memberships is not a thing.
  if (existing) {
    if (line.kind !== 'subscription') existing.quantity += quantity;
  } else {
    lines.push({ ...line, quantity: line.kind === 'subscription' ? 1 : quantity });
  }
  write(lines);
  return lines;
}

export function removeItem(id: string): CartLine[] {
  const lines = read().filter((l) => l.id !== id);
  write(lines);
  return lines;
}

export function setQuantity(id: string, quantity: number): CartLine[] {
  if (quantity <= 0) return removeItem(id);
  const lines = read();
  const line = lines.find((l) => l.id === id);
  if (line) line.quantity = quantity;
  write(lines);
  return lines;
}

export function clearCart(): void {
  write([]);
}

export function countItems(lines: CartLine[] = read()): number {
  return lines.reduce((sum, l) => sum + l.quantity, 0);
}

export function subtotal(lines: CartLine[] = read()): number {
  return lines.reduce((sum, l) => sum + l.unitAmount * l.quantity, 0);
}

export function hasItem(id: string): boolean {
  return read().some((l) => l.id === id);
}

/* ── Referral capture ─────────────────────────────────────────────────────── */
export function captureReferral(): string | null {
  if (typeof window === 'undefined') return null;
  const fromUrl = new URLSearchParams(window.location.search).get('ref');
  if (fromUrl) {
    try { localStorage.setItem(REF_KEY, fromUrl); } catch { /* ignore */ }
    return fromUrl;
  }
  try { return localStorage.getItem(REF_KEY); } catch { return null; }
}

export function getReferral(): string | null {
  try { return localStorage.getItem(REF_KEY); } catch { return null; }
}
