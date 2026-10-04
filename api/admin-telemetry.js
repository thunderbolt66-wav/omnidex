// ==============================================================================
// Vercel Serverless Backend: Hardened Sentinel Admin Telemetry Endpoint
// Zero-Trust Security: Timing-Safe Comparison, Brute-Force Rate Limiting, Fail-Closed
// ==============================================================================

import crypto from 'crypto';

if (!globalThis.__OMNIDEX_VISITOR_BUFFER) {
  globalThis.__OMNIDEX_VISITOR_BUFFER = [];
}

// In-memory rate limiting map for failed authentication attempts: ip -> { count, lockedUntil }
if (!globalThis.__OMNIDEX_AUTH_ATTEMPTS) {
  globalThis.__OMNIDEX_AUTH_ATTEMPTS = new Map();
}

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes lockout

/**
 * Timing-safe comparison using SHA-256 hash digests to eliminate side-channel leaks
 */
function timingSafeCheck(givenKey, expectedKey) {
  if (!givenKey || !expectedKey || typeof givenKey !== 'string' || typeof expectedKey !== 'string') {
    return false;
  }
  const h1 = crypto.createHash('sha256').update(givenKey.trim()).digest();
  const h2 = crypto.createHash('sha256').update(expectedKey.trim()).digest();
  return crypto.timingSafeEqual(h1, h2);
}

/**
 * Check and enforce brute-force rate limiting per IP
 */
function checkRateLimit(clientIp) {
  const store = globalThis.__OMNIDEX_AUTH_ATTEMPTS;
  const now = Date.now();
  const record = store.get(clientIp);

  if (record) {
    if (record.lockedUntil && now < record.lockedUntil) {
      const remainingMin = Math.ceil((record.lockedUntil - now) / 60000);
      return { locked: true, remainingMin };
    }
    // Lockout expired, reset
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

export default async function handler(req, res) {
  const isWebReq = typeof req?.headers?.get === 'function';
  const method = isWebReq ? req.method : req?.method;

  const securityHeaders = {
    'Content-Type': 'application/json',
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
    'Cache-Control': 'no-store, no-cache, must-revalidate, private',
    'X-Robots-Tag': 'noindex, nofollow, noarchive, nosnippet',
  };

  // 1. CORS Preflight
  if (method === 'OPTIONS') {
    if (isWebReq) {
      return new Response(null, {
        status: 204,
        headers: {
          ...securityHeaders,
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type, x-admin-key, Authorization',
          'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
        },
      });
    } else {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-key, Authorization');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
      return res.status(204).end();
    }
  }

  // 2. Extract Client IP for Security Audit
  const getHeader = (name) => {
    if (isWebReq) return req.headers.get(name) || '';
    return req.headers[name.toLowerCase()] || '';
  };

  const clientIp =
    getHeader('x-real-ip') ||
    getHeader('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    '127.0.0.1';

  // 3. Brute-Force Check
  const rateLimitStatus = checkRateLimit(clientIp);
  if (rateLimitStatus.locked) {
    const lockedBody = {
      error: 'Security Lockout',
      message: `Too many failed authentication attempts. Access locked for ${rateLimitStatus.remainingMin} minutes.`,
    };
    if (isWebReq) {
      return new Response(JSON.stringify(lockedBody), {
        status: 429,
        headers: securityHeaders,
      });
    } else {
      Object.entries(securityHeaders).forEach(([k, v]) => res.setHeader(k, v));
      return res.status(429).json(lockedBody);
    }
  }

  // 4. Resolve Master Key (Fail-closed in production)
  const isProduction =
    process.env.NODE_ENV === 'production' ||
    Boolean(process.env.VERCEL || process.env.NETLIFY);

  const expectedKey = process.env.ADMIN_SECRET_KEY || (!isProduction ? 'omnidex-admin-vault-2026' : null);

  if (!expectedKey) {
    // FAIL-CLOSED: No secret configured in production environment
    const unconfiguredBody = {
      error: 'Endpoint Guarded',
      message: 'ADMIN_SECRET_KEY is not configured in environment variables. Access is strictly disabled.',
    };
    if (isWebReq) {
      return new Response(JSON.stringify(unconfiguredBody), {
        status: 503,
        headers: securityHeaders,
      });
    } else {
      Object.entries(securityHeaders).forEach(([k, v]) => res.setHeader(k, v));
      return res.status(503).json(unconfiguredBody);
    }
  }

  // 5. Extract provided key
  const authKey =
    getHeader('x-admin-key') ||
    getHeader('authorization')?.replace(/^Bearer\s+/i, '') ||
    '';

  const isAuthorized = timingSafeCheck(authKey, expectedKey);

  if (!isAuthorized) {
    recordFailedAttempt(clientIp);
    const deniedBody = {
      error: 'Access Denied',
      message: 'Invalid or missing Master Admin Key. Security event logged.',
    };
    if (isWebReq) {
      return new Response(JSON.stringify(deniedBody), {
        status: 401,
        headers: securityHeaders,
      });
    } else {
      Object.entries(securityHeaders).forEach(([k, v]) => res.setHeader(k, v));
      return res.status(401).json(deniedBody);
    }
  }

  // Authentication succeeded - clear failed attempts counter
  recordSuccessfulAttempt(clientIp);

  // 6. Wipe Logs (DELETE)
  if (method === 'DELETE') {
    globalThis.__OMNIDEX_VISITOR_BUFFER.length = 0;

    const kvUrl = process.env.KV_REST_API_URL;
    const kvToken = process.env.KV_REST_API_TOKEN;
    if (kvUrl && kvToken) {
      try {
        await fetch(`${kvUrl}/del/recent_visits`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${kvToken}` },
        });
      } catch {}
    }

    const wipeBody = { success: true, message: 'Telemetry logs wiped successfully.' };
    if (isWebReq) {
      return new Response(JSON.stringify(wipeBody), {
        status: 200,
        headers: securityHeaders,
      });
    } else {
      Object.entries(securityHeaders).forEach(([k, v]) => res.setHeader(k, v));
      return res.status(200).json(wipeBody);
    }
  }

  // 7. Retrieve Telemetry Data (GET)
  try {
    let records = [...(globalThis.__OMNIDEX_VISITOR_BUFFER || [])];

    const kvUrl = process.env.KV_REST_API_URL;
    const kvToken = process.env.KV_REST_API_TOKEN;
    if (kvUrl && kvToken) {
      try {
        const idRes = await fetch(`${kvUrl}/lrange/recent_visits/0/150`, {
          headers: { Authorization: `Bearer ${kvToken}` },
        });
        const idData = await idRes.json();
        const ids = idData?.result || [];
        if (Array.isArray(ids) && ids.length > 0) {
          const kvRecords = await Promise.all(
            ids.map(async (id) => {
              try {
                const r = await fetch(`${kvUrl}/get/visit:${id}`, {
                  headers: { Authorization: `Bearer ${kvToken}` },
                });
                const d = await r.json();
                return d?.result ? JSON.parse(d.result) : null;
              } catch {
                return null;
              }
            })
          );
          const validKv = kvRecords.filter(Boolean);
          if (validKv.length > 0) {
            records = validKv;
          }
        }
      } catch {}
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

    const payload = {
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
    };

    if (isWebReq) {
      return new Response(JSON.stringify(payload), {
        status: 200,
        headers: securityHeaders,
      });
    } else {
      Object.entries(securityHeaders).forEach(([k, v]) => res.setHeader(k, v));
      return res.status(200).json(payload);
    }
  } catch (error) {
    const errorBody = { error: error.message };
    if (isWebReq) {
      return new Response(JSON.stringify(errorBody), {
        status: 500,
        headers: securityHeaders,
      });
    } else {
      Object.entries(securityHeaders).forEach(([k, v]) => res.setHeader(k, v));
      return res.status(500).json(errorBody);
    }
  }
}
