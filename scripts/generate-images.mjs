#!/usr/bin/env node
/**
 * Generation behind a provider adapter. Slots marked `source: "generate"` in
 * assets/manifest.json are brand compositions and abstract textures only —
 * never a person, a body, a food item or a piece of equipment.
 *
 *   IMAGE_PROVIDER=local    (default) sharp-composited brand art. No key, no network.
 *   IMAGE_PROVIDER=openai   stub: correct request shape, needs OPENAI_API_KEY.
 *   IMAGE_PROVIDER=replicate stub: correct request shape, needs REPLICATE_API_TOKEN.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '..');
const manifest = JSON.parse(await fs.readFile(path.join(ROOT, 'assets/manifest.json'), 'utf8'));
const PROVIDER = process.env.IMAGE_PROVIDER ?? 'local';

const INK = '#0b0e12';
const PAPER = '#f5f7fa';
const ACCENT = '#ff6b2c';
const SURFACE = '#161b22';

/* ── Provider adapters ─────────────────────────────────────────────────────── */

const providers = {
  /** Deterministic brand art. This is the one that actually runs in CI. */
  async local(slot) {
    if (slot.id === 'texture-grain') return grainTexture(slot);
    return brandCard(slot);
  },

  /** STUB — request shape matches POST /v1/images/generations. No key present. */
  async openai(slot) {
    const key = process.env.OPENAI_API_KEY;
    if (!key) throw new Error('IMAGE_PROVIDER=openai but OPENAI_API_KEY is not set');
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: slot.prompt,
        size: `${slot.width}x${slot.height}`,
        n: 1,
        output_format: 'png',
        background: 'opaque',
      }),
    });
    if (!response.ok) throw new Error(`OpenAI images ${response.status}`);
    const json = await response.json();
    return Buffer.from(json.data[0].b64_json, 'base64');
  },

  /** STUB — request shape matches the Replicate predictions API. No token present. */
  async replicate(slot) {
    const token = process.env.REPLICATE_API_TOKEN;
    if (!token) throw new Error('IMAGE_PROVIDER=replicate but REPLICATE_API_TOKEN is not set');
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json', prefer: 'wait' },
      body: JSON.stringify({
        version: process.env.REPLICATE_MODEL_VERSION ?? '<model-version-id>',
        input: {
          prompt: slot.prompt,
          width: slot.width,
          height: slot.height,
          output_format: 'png',
          num_outputs: 1,
        },
      }),
    });
    if (!response.ok) throw new Error(`Replicate ${response.status}`);
    const json = await response.json();
    const url = Array.isArray(json.output) ? json.output[0] : json.output;
    return Buffer.from(await (await fetch(url)).arrayBuffer());
  },
};

/* ── Local composition ─────────────────────────────────────────────────────── */

function brandCard(slot) {
  const { width: w, height: h } = slot;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${SURFACE}"/>
      <stop offset="60%" stop-color="${INK}"/>
    </linearGradient>
    <radialGradient id="glow" cx="18%" cy="22%" r="55%">
      <stop offset="0%" stop-color="${ACCENT}" stop-opacity="0.20"/>
      <stop offset="100%" stop-color="${ACCENT}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  <rect width="${w}" height="${h}" fill="url(#glow)"/>
  <rect x="${Math.round(w * 0.07)}" y="${Math.round(h * 0.38)}" width="16" height="${Math.round(h * 0.14)}" rx="3" fill="${ACCENT}"/>
  <rect x="${Math.round(w * 0.07) + 30}" y="${Math.round(h * 0.38)}" width="16" height="${Math.round(h * 0.14)}" rx="3" fill="${PAPER}"/>
  <rect x="${Math.round(w * 0.07) + 60}" y="${Math.round(h * 0.38)}" width="16" height="${Math.round(h * 0.14)}" rx="3" fill="${ACCENT}" opacity="0.55"/>
  <text x="${Math.round(w * 0.07)}" y="${Math.round(h * 0.66)}"
    font-family="Inter, system-ui, -apple-system, Segoe UI, sans-serif"
    font-size="${Math.round(h * 0.13)}" font-weight="700" letter-spacing="2" fill="${PAPER}">QUWA</text>
  <text x="${Math.round(w * 0.07)}" y="${Math.round(h * 0.78)}"
    font-family="Inter, system-ui, -apple-system, Segoe UI, sans-serif"
    font-size="${Math.round(h * 0.042)}" font-weight="400" fill="${PAPER}" opacity="0.62">Train with a plan, not a guess.</text>
  <rect x="0" y="${h - 8}" width="${w}" height="8" fill="${ACCENT}"/>
</svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

function grainTexture(slot) {
  const { width: w, height: h } = slot;
  const pixels = Buffer.alloc(w * h * 4);
  for (let i = 0; i < w * h; i += 1) {
    const v = Math.round(Math.random() * 255);
    pixels[i * 4] = v; pixels[i * 4 + 1] = v; pixels[i * 4 + 2] = v;
    pixels[i * 4 + 3] = 10; // ~4% opacity once composited
  }
  return sharp(pixels, { raw: { width: w, height: h, channels: 4 } }).png().toBuffer();
}

/* ── Run ───────────────────────────────────────────────────────────────────── */

const adapter = providers[PROVIDER];
if (!adapter) {
  console.error(`Unknown IMAGE_PROVIDER "${PROVIDER}". Use local, openai or replicate.`);
  process.exit(1);
}

const only = process.argv.slice(2);
const slots = manifest.slots.filter(
  (s) => s.source === 'generate' && !s.blocked && (only.length === 0 || only.includes(s.id)),
);

for (const slot of slots) {
  const out = path.join(ROOT, slot.path);
  await fs.mkdir(path.dirname(out), { recursive: true });
  try {
    const buffer = await adapter(slot);
    await fs.writeFile(out, buffer);
    console.log(`OK     ${slot.id} → ${slot.path} (${PROVIDER})`);
  } catch (error) {
    console.log(`ERR    ${slot.id}: ${error.message}`);
  }
}
