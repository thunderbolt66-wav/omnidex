// ==============================================================================
// Netlify Serverless Backend: Hardened Sentinel Admin Telemetry Endpoint
// Zero-Trust Security: Timing-Safe Comparison, Brute-Force Rate Limiting, Fail-Closed
// ==============================================================================

import crypto from 'crypto';
import { getStore } from '@netlify/blobs';

if (!globalThis.__OMNIDEX_VISITOR_BUFFER) {
  globalThis.__OMNIDEX_VISITOR_BUFFER = [];
}

if (!globalThis.__OMNIDEX_AUTH_ATTEMPTS) {
  globalThis.__OMNIDEX_AUTH_ATTEMPTS = new Map();
}

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

function timingSafeCheck(givenKey, expectedKey) {
  if (!givenKey || !expectedKey || typeof givenKey !== 'string' || typeof expectedKey !== 'string') {
    return false;
  }
  const h1 = crypto.createHash('sha256').update(givenKey.trim()).digest();
  const h2 = crypto.createHash('sha256').update(expectedKey.trim()).digest();
  return crypto.timingSafeEqual(h1, h2);
}

function checkRateLimit(clientIp) {
  const store = globalThis.__OMNIDEX_AUTH_ATTEMPTS;
  const now = Date.now();
  const record = store.get(clientIp);

  if (record) {
    if (record.lockedUntil && now < record.lockedUntil) {
      const remainingMin = Math.ceil((record.lockedUntil - now) / 60000);
      return { locked: true, remainingMin };
    }
    if (record.lockedUntil && now >= record.lockedUntil) {
      store.delete(clientIp);
    }
  }
  return { locked: false };
}

function recordFailedAttempt(clientIp) {
  const store = globalThis.__OMNIDEX_AUTH_ATTEMPTS;
  const now = Date.now();
  const record = store.get(clientIp) || { count: 0, firstAttempt: now };
  record.count += 1;

  if (record.count >= MAX_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_MS;
  }
  store.set(clientIp, record);
}

function recordSuccessfulAttempt(clientIp) {
  globalThis.__OMNIDEX_AUTH_ATTEMPTS.delete(clientIp);
}

export default async function handler(request, context) {
  const securityHeaders = {
    'Content-Type': 'application/json',
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
    'Cache-Control': 'no-store, no-cache, must-revalidate, private',
    'X-Robots-Tag': 'noindex, nofollow, noarchive, nosnippet',
  };

  // CORS Preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        ...securityHeaders,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, x-admin-key, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      },
    });
  }

  // Extract Client IP
  const headers = Object.fromEntries(request.headers);
  const clientIp =
    headers['x-nf-client-connection-ip'] ||
    headers['client-ip'] ||
    headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    context?.ip ||
    '127.0.0.1';

  // Rate Limiting
  const rateLimitStatus = checkRateLimit(clientIp);
  if (rateLimitStatus.locked) {
    return new Response(
      JSON.stringify({
        error: 'Security Lockout',
        message: `Too many failed authentication attempts. Access locked for ${rateLimitStatus.remainingMin} minutes.`,
      }),
      { status: 429, headers: securityHeaders }
    );
  }

  // Fail-closed in production
  const isProduction = process.env.NODE_ENV === 'production' || Boolean(process.env.NETLIFY);
  const expectedKey = process.env.ADMIN_SECRET_KEY || (!isProduction ? 'omnidex-admin-vault-2026' : null);

  if (!expectedKey) {
    return new Response(
      JSON.stringify({
        error: 'Endpoint Guarded',
        message: 'ADMIN_SECRET_KEY is not configured in environment variables. Access is strictly disabled.',
      }),
      { status: 503, headers: securityHeaders }
    );
  }

  const authKey =
    headers['x-admin-key'] ||
    request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ||
    '';

  const isAuthorized = timingSafeCheck(authKey, expectedKey);

  if (!isAuthorized) {
    recordFailedAttempt(clientIp);
    return new Response(
      JSON.stringify({
        error: 'Access Denied',
        message: 'Invalid or missing Master Admin Key. Security event logged.',
      }),
      {
        status: 401,
        headers: {
          ...securityHeaders,
          'WWW-Authenticate': 'Bearer realm="Omnidex Sentinel"',
        },
      }
    );
  }

  recordSuccessfulAttempt(clientIp);

  // Clear Logs
  if (request.method === 'DELETE') {
    try {
      globalThis.__OMNIDEX_VISITOR_BUFFER.length = 0;
      const store = getStore({ name: 'omnidex_telemetry' });
      await store.setJSON('recent_visit_ids', []);
      return new Response(JSON.stringify({ success: true, message: 'Telemetry logs wiped successfully.' }), {
        status: 200,
        headers: securityHeaders,
      });
    } catch {
      return new Response(JSON.stringify({ error: 'Failed to clear logs' }), {
        status: 500,
        headers: securityHeaders,
      });
    }
  }

  // Retrieve Records
  try {
    let records = [];

    try {
      const store = getStore({ name: 'omnidex_telemetry' });
      const recentIds = (await store.get('recent_visit_ids', { type: 'json' })) || [];
      if (Array.isArray(recentIds) && recentIds.length > 0) {
        const fetched = await Promise.all(
          recentIds.slice(0, 150).map(async (id) => {
            try {
              return await store.get(`visit:${id}`, { type: 'json' });
            } catch {
              return null;
            }
          })
        );
        records = fetched.filter(Boolean);
      }
    } catch {}

    if (records.length === 0 && Array.isArray(globalThis.__OMNIDEX_VISITOR_BUFFER)) {
      records = [...globalThis.__OMNIDEX_VISITOR_BUFFER];
    }

    const totalVisits = records.length;
    const uniqueIps = new Set(records.map((r) => r.ip)).size;

    const countries = {};
    const devices = {};
    const osMap = {};
    const browsers = {};

    records.forEach((r) => {
      const country = r.country || 'Unknown';
      countries[country] = (countries[country] || 0) + 1;

      const dev = r.device || 'Desktop';
      devices[dev] = (devices[dev] || 0) + 1;

      const os = r.os || 'Unknown OS';
      osMap[os] = (osMap[os] || 0) + 1;

      const br = r.browser || 'Unknown Browser';
      browsers[br] = (browsers[br] || 0) + 1;
    });

    return new Response(
      JSON.stringify({
        authenticated: true,
        generatedAt: new Date().toISOString(),
        summary: {
          totalVisits,
          uniqueIps,
          countriesCount: Object.keys(countries).length,
          topCountries: countries,
          deviceBreakdown: devices,
          osBreakdown: osMap,
          browserBreakdown: browsers,
        },
        visitors: records.slice(0, 150),
      }),
      { status: 200, headers: securityHeaders }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: securityHeaders,
    });
  }
}
