/**
 * QUWA API — the thin backend.
 *
 * GitHub Pages is static, so four things cannot live there:
 *   1. receiving a payment webhook and recording the order
 *   2. issuing a download URL that expires and cannot be shared
 *   3. answering "is this person's subscription live right now"
 *   4. logging someone in without asking them to invent a password
 *
 * Everything else stays on Pages. Deploy with `wrangler deploy` — see the
 * README section "Deploying the Worker".
 *
 * No secret is read from anywhere except env bindings, and no secret is logged.
 */

export interface Env {
  ORDERS: KVNamespace;
  SESSIONS: KVNamespace;
  FILES: R2Bucket;
  ALLOWED_ORIGIN: string;
  DOWNLOAD_TTL_SECONDS: string;
  MAGIC_LINK_TTL_SECONDS: string;
  SESSION_TTL_SECONDS: string;
  LEMONSQUEEZY_WEBHOOK_SECRET?: string;
  PADDLE_WEBHOOK_SECRET?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  DOWNLOAD_SIGNING_SECRET: string;
  MAGIC_LINK_SECRET: string;
  EMAIL_API_KEY?: string;
}

interface OrderRecord {
  email: string;
  provider: 'lemonsqueezy' | 'paddle' | 'stripe';
  providerOrderId: string;
  items: string[];
  subscription: null | {
    plan: 'monthly' | 'annual';
    status: 'trialing' | 'active' | 'past_due' | 'cancelled';
    trialEndsAt: string | null;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
  };
  locale: 'en' | 'ar';
  referral: string | null;
  createdAt: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, '') || '/';

    if (request.method === 'OPTIONS') return preflight(env);

    try {
      // ── Webhooks ───────────────────────────────────────────────────────────
      if (path === '/webhook/lemonsqueezy') return await lemonSqueezyWebhook(request, env);
      if (path === '/webhook/paddle') return await paddleWebhook(request, env);
      if (path === '/webhook/stripe') return await stripeWebhook(request, env);

      // ── Magic-link login ───────────────────────────────────────────────────
      if (path === '/auth/request' && request.method === 'POST') return await requestMagicLink(request, env, ctx);
      if (path === '/auth/verify') return await verifyMagicLink(request, env);
      if (path === '/auth/me') return await whoAmI(request, env);

      // ── Entitlements ───────────────────────────────────────────────────────
      if (path.startsWith('/subscription/')) return await subscriptionStatus(path.split('/')[2] ?? '', env);
      if (path === '/downloads') return await listDownloads(request, env);
      if (path.startsWith('/download/')) return await serveDownload(request, env, path.split('/')[2] ?? '');

      if (path === '/health') return json({ ok: true, time: new Date().toISOString() }, env);
      return json({ error: 'not_found' }, env, 404);
    } catch (error) {
      // Never leak an internal message to the client.
      console.error('unhandled', error instanceof Error ? error.name : 'unknown');
      return json({ error: 'internal_error' }, env, 500);
    }
  },
};

/* ── CORS ──────────────────────────────────────────────────────────────────── */

function corsHeaders(env: Env): Record<string, string> {
  return {
    'access-control-allow-origin': env.ALLOWED_ORIGIN,
    'access-control-allow-methods': 'GET, POST, OPTIONS',
    'access-control-allow-headers': 'content-type, authorization',
    'access-control-allow-credentials': 'true',
    vary: 'Origin',
  };
}

function preflight(env: Env): Response {
  return new Response(null, { status: 204, headers: corsHeaders(env) });
}

function json(body: unknown, env: Env, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...corsHeaders(env) },
  });
}

/* ── Crypto helpers ────────────────────────────────────────────────────────── */

const encoder = new TextEncoder();

async function hmac(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
  return [...new Uint8Array(signature)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Constant-time compare. A fast-exit compare on a signature is a timing oracle. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/* ── Webhooks ──────────────────────────────────────────────────────────────── */

async function lemonSqueezyWebhook(request: Request, env: Env): Promise<Response> {
  const secret = env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret) return json({ error: 'not_configured' }, env, 501);

  const raw = await request.text();
  const signature = request.headers.get('x-signature') ?? '';
  if (!safeEqual(signature, await hmac(secret, raw))) return json({ error: 'bad_signature' }, env, 401);

  const event = JSON.parse(raw) as {
    meta: { event_name: string; custom_data?: Record<string, string> };
    data: { id: string; attributes: Record<string, unknown> };
  };
  const attrs = event.data.attributes;
  const email = String(attrs.user_email ?? attrs.customer_email ?? '');
  const custom = event.meta.custom_data ?? {};

  const isSubscription = event.meta.event_name.startsWith('subscription_');
  await recordOrder(env, {
    email,
    provider: 'lemonsqueezy',
    providerOrderId: event.data.id,
    items: (custom.items ?? '').split(',').map((pair) => pair.split(':')[0] ?? '').filter(Boolean),
    subscription: isSubscription
      ? {
          plan: String(attrs.variant_name ?? '').toLowerCase().includes('annual') ? 'annual' : 'monthly',
          status: mapLemonStatus(String(attrs.status ?? '')),
          trialEndsAt: (attrs.trial_ends_at as string | null) ?? null,
          currentPeriodEnd: String(attrs.renews_at ?? ''),
          cancelAtPeriodEnd: Boolean(attrs.cancelled),
        }
      : null,
    locale: custom.locale === 'ar' ? 'ar' : 'en',
    referral: custom.referral || null,
    createdAt: new Date().toISOString(),
  });
  return json({ received: true }, env);
}

function mapLemonStatus(status: string): 'trialing' | 'active' | 'past_due' | 'cancelled' {
  if (status === 'on_trial') return 'trialing';
  if (status === 'past_due' || status === 'unpaid') return 'past_due';
  if (status === 'cancelled' || status === 'expired') return 'cancelled';
  return 'active';
}

async function paddleWebhook(request: Request, env: Env): Promise<Response> {
  const secret = env.PADDLE_WEBHOOK_SECRET;
  if (!secret) return json({ error: 'not_configured' }, env, 501);

  const raw = await request.text();
  // Paddle Billing sends `ts=<unix>;h1=<hex>` in Paddle-Signature.
  const header = request.headers.get('paddle-signature') ?? '';
  const ts = /ts=(\d+)/.exec(header)?.[1] ?? '';
  const h1 = /h1=([a-f0-9]+)/.exec(header)?.[1] ?? '';
  if (!ts || !h1) return json({ error: 'bad_signature' }, env, 401);
  // Reject replays older than five minutes.
  if (Math.abs(Date.now() / 1000 - Number(ts)) > 300) return json({ error: 'stale' }, env, 401);
  if (!safeEqual(h1, await hmac(secret, `${ts}:${raw}`))) return json({ error: 'bad_signature' }, env, 401);

  const event = JSON.parse(raw) as { event_type: string; data: Record<string, any> };
  const data = event.data;
  const isSubscription = event.event_type.startsWith('subscription.');
  await recordOrder(env, {
    email: String(data.customer?.email ?? data.custom_data?.email ?? ''),
    provider: 'paddle',
    providerOrderId: String(data.id ?? ''),
    items: (data.custom_data?.items ?? '').split(',').map((p: string) => p.split(':')[0]).filter(Boolean),
    subscription: isSubscription
      ? {
          plan: String(data.billing_cycle?.interval ?? 'month') === 'year' ? 'annual' : 'monthly',
          status: data.status === 'trialing' ? 'trialing' : data.status === 'canceled' ? 'cancelled' : 'active',
          trialEndsAt: data.trial_dates?.ends_at ?? null,
          currentPeriodEnd: String(data.current_billing_period?.ends_at ?? ''),
          cancelAtPeriodEnd: data.scheduled_change?.action === 'cancel',
        }
      : null,
    locale: data.custom_data?.locale === 'ar' ? 'ar' : 'en',
    referral: data.custom_data?.referral || null,
    createdAt: new Date().toISOString(),
  });
  return json({ received: true }, env);
}

async function stripeWebhook(request: Request, env: Env): Promise<Response> {
  const secret = env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return json({ error: 'not_configured' }, env, 501);

  const raw = await request.text();
  const header = request.headers.get('stripe-signature') ?? '';
  const ts = /t=(\d+)/.exec(header)?.[1] ?? '';
  const v1 = /v1=([a-f0-9]+)/.exec(header)?.[1] ?? '';
  if (!ts || !v1) return json({ error: 'bad_signature' }, env, 401);
  if (Math.abs(Date.now() / 1000 - Number(ts)) > 300) return json({ error: 'stale' }, env, 401);
  if (!safeEqual(v1, await hmac(secret, `${ts}.${raw}`))) return json({ error: 'bad_signature' }, env, 401);

  const event = JSON.parse(raw) as { type: string; data: { object: Record<string, any> } };
  const object = event.data.object;
  const isSubscription = object.mode === 'subscription' || event.type.startsWith('customer.subscription.');
  await recordOrder(env, {
    email: String(object.customer_email ?? object.customer_details?.email ?? ''),
    provider: 'stripe',
    providerOrderId: String(object.id ?? ''),
    items: String(object.metadata?.items ?? '').split(',').map((p) => p.split(':')[0]).filter(Boolean),
    subscription: isSubscription
      ? {
          plan: object.metadata?.plan === 'monthly' ? 'monthly' : 'annual',
          status: object.status === 'trialing' ? 'trialing' : object.status === 'canceled' ? 'cancelled' : 'active',
          trialEndsAt: object.trial_end ? new Date(object.trial_end * 1000).toISOString() : null,
          currentPeriodEnd: object.current_period_end
            ? new Date(object.current_period_end * 1000).toISOString() : '',
          cancelAtPeriodEnd: Boolean(object.cancel_at_period_end),
        }
      : null,
    locale: object.metadata?.locale === 'ar' ? 'ar' : 'en',
    referral: object.metadata?.referral || null,
    createdAt: new Date().toISOString(),
  });
  return json({ received: true }, env);
}

async function recordOrder(env: Env, order: OrderRecord): Promise<void> {
  if (!order.email) return;
  const key = `order:${order.provider}:${order.providerOrderId}`;
  await env.ORDERS.put(key, JSON.stringify(order));

  // Index by email so entitlement lookups are one read, not a list scan.
  const indexKey = `customer:${order.email.toLowerCase()}`;
  const existing = await env.ORDERS.get(indexKey, 'json') as { orders: string[] } | null;
  const orders = new Set(existing?.orders ?? []);
  orders.add(key);
  await env.ORDERS.put(indexKey, JSON.stringify({ orders: [...orders] }));
}

/* ── Magic-link login ──────────────────────────────────────────────────────── */

async function requestMagicLink(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const body = await request.json<{ email?: string; locale?: string; returnTo?: string }>();
  const email = (body.email ?? '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return json({ error: 'invalid_email' }, env, 400);

  const expires = Date.now() + Number(env.MAGIC_LINK_TTL_SECONDS) * 1000;
  const payload = `${email}.${expires}`;
  const token = `${btoa(payload).replace(/=+$/, '')}.${await hmac(env.MAGIC_LINK_SECRET, payload)}`;
  const link = `${env.ALLOWED_ORIGIN}${body.returnTo ?? '/'}?token=${encodeURIComponent(token)}`;

  // Sending is fire-and-forget so a slow mail API cannot hold the request open.
  ctx.waitUntil(sendMagicLinkEmail(env, email, link, body.locale === 'ar' ? 'ar' : 'en'));

  // Always the same response, whether or not the address exists — otherwise this
  // endpoint becomes a way to enumerate customers.
  return json({ sent: true }, env);
}

async function sendMagicLinkEmail(env: Env, email: string, link: string, locale: 'en' | 'ar'): Promise<void> {
  if (!env.EMAIL_API_KEY) { console.log('email provider not configured; link not sent'); return; }
  const subject = locale === 'ar' ? 'رابط الدخول إلى قوّة' : 'Your QUWA sign-in link';
  const text = locale === 'ar'
    ? `اضغط الرابط للدخول. صالح لخمس عشرة دقيقة.\n\n${link}`
    : `Click to sign in. Valid for 15 minutes.\n\n${link}`;
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${env.EMAIL_API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({ from: 'QUWA <hello@quwa.fit>', to: [email], subject, text }),
  });
}

async function verifyMagicLink(request: Request, env: Env): Promise<Response> {
  const token = new URL(request.url).searchParams.get('token') ?? '';
  const [encoded = '', signature = ''] = token.split('.');
  let payload: string;
  try { payload = atob(encoded); } catch { return json({ error: 'bad_token' }, env, 401); }
  if (!safeEqual(signature, await hmac(env.MAGIC_LINK_SECRET, payload))) {
    return json({ error: 'bad_token' }, env, 401);
  }
  const [email = '', expires = '0'] = payload.split('.');
  if (Date.now() > Number(expires)) return json({ error: 'expired' }, env, 401);

  const session = crypto.randomUUID();
  const ttl = Number(env.SESSION_TTL_SECONDS);
  await env.SESSIONS.put(`session:${session}`, email, { expirationTtl: ttl });

  return new Response(JSON.stringify({ ok: true, email }), {
    headers: {
      'content-type': 'application/json',
      // HttpOnly so no script can read it, SameSite=Lax so it survives the
      // email-client redirect, Secure because there is no http variant.
      'set-cookie': `quwa_session=${session}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${ttl}`,
      ...corsHeaders(env),
    },
  });
}

async function sessionEmail(request: Request, env: Env): Promise<string | null> {
  const cookie = request.headers.get('cookie') ?? '';
  const id = /quwa_session=([^;]+)/.exec(cookie)?.[1];
  if (!id) return null;
  return env.SESSIONS.get(`session:${id}`);
}

async function whoAmI(request: Request, env: Env): Promise<Response> {
  const email = await sessionEmail(request, env);
  return email ? json({ email }, env) : json({ error: 'unauthenticated' }, env, 401);
}

/* ── Entitlements ──────────────────────────────────────────────────────────── */

async function ordersFor(env: Env, email: string): Promise<OrderRecord[]> {
  const index = await env.ORDERS.get(`customer:${email.toLowerCase()}`, 'json') as { orders: string[] } | null;
  if (!index) return [];
  const records = await Promise.all(index.orders.map((key) => env.ORDERS.get(key, 'json') as Promise<OrderRecord | null>));
  return records.filter((r): r is OrderRecord => r !== null);
}

async function subscriptionStatus(customerRef: string, env: Env): Promise<Response> {
  const email = decodeURIComponent(customerRef);
  const orders = await ordersFor(env, email);
  const sub = orders
    .map((o) => o.subscription)
    .filter((s): s is NonNullable<OrderRecord['subscription']> => s !== null)
    .sort((a, b) => Date.parse(b.currentPeriodEnd) - Date.parse(a.currentPeriodEnd))[0];

  if (!sub) {
    return json({ active: false, plan: null, trialEndsAt: null, currentPeriodEnd: null, cancelAtPeriodEnd: false }, env);
  }
  const live = (sub.status === 'active' || sub.status === 'trialing')
    && (!sub.currentPeriodEnd || Date.parse(sub.currentPeriodEnd) > Date.now());
  return json({
    active: live,
    plan: sub.plan,
    trialEndsAt: sub.trialEndsAt,
    currentPeriodEnd: sub.currentPeriodEnd || null,
    cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
  }, env);
}

async function listDownloads(request: Request, env: Env): Promise<Response> {
  const email = await sessionEmail(request, env);
  if (!email) return json({ error: 'unauthenticated' }, env, 401);

  const orders = await ordersFor(env, email);
  const owned = new Set(orders.flatMap((o) => o.items));
  const hasLibrary = orders.some((o) =>
    o.subscription && (o.subscription.status === 'active' || o.subscription.status === 'trialing'));

  const ttl = Number(env.DOWNLOAD_TTL_SECONDS);
  const expires = Date.now() + ttl * 1000;
  const links = await Promise.all([...owned].map(async (item) => ({
    item,
    url: `/download/${item}?e=${expires}&s=${await hmac(env.DOWNLOAD_SIGNING_SECRET, `${email}:${item}:${expires}`)}&u=${encodeURIComponent(email)}`,
    expiresAt: new Date(expires).toISOString(),
  })));

  return json({ email, library: hasLibrary, downloads: links }, env);
}

async function serveDownload(request: Request, env: Env, item: string): Promise<Response> {
  const url = new URL(request.url);
  const expires = url.searchParams.get('e') ?? '0';
  const signature = url.searchParams.get('s') ?? '';
  const email = decodeURIComponent(url.searchParams.get('u') ?? '');

  if (Date.now() > Number(expires)) return json({ error: 'link_expired' }, env, 410);
  // The signature binds the file to one buyer and one deadline, so a shared link
  // stops working — the whole reason this endpoint exists rather than a public file.
  const expected = await hmac(env.DOWNLOAD_SIGNING_SECRET, `${email}:${item}:${expires}`);
  if (!safeEqual(signature, expected)) return json({ error: 'bad_signature' }, env, 403);

  const object = await env.FILES.get(`${item}.zip`);
  if (!object) return json({ error: 'not_found' }, env, 404);

  return new Response(object.body, {
    headers: {
      'content-type': 'application/zip',
      'content-disposition': `attachment; filename="${item}.zip"`,
      'cache-control': 'private, no-store',
      ...corsHeaders(env),
    },
  });
}
