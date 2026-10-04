// ==============================================================================
// Vercel Serverless Backend: Unified Omnidex Sentinel Telemetry Hub
// Handles both /api/track-visit and /api/admin-telemetry in a shared runtime
// Supports: /tmp local JSON persistence, In-Memory buffer, Vercel KV & Supabase
// ==============================================================================

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const TMP_FILE = path.join('/tmp', 'omnidex_telemetry_store.json');

// Persistent memory buffer across warm invocations
if (!globalThis.__OMNIDEX_VISITOR_BUFFER) {
  globalThis.__OMNIDEX_VISITOR_BUFFER = loadFromDisk();
}

if (!globalThis.__OMNIDEX_AUTH_ATTEMPTS) {
  globalThis.__OMNIDEX_AUTH_ATTEMPTS = new Map();
}

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

function loadFromDisk() {
  try {
    if (fs.existsSync(TMP_FILE)) {
      const raw = fs.readFileSync(TMP_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

function saveToDisk(records) {
  try {
    fs.writeFileSync(TMP_FILE, JSON.stringify(records.slice(0, 300)), 'utf8');
  } catch {}
}

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

function parseUserAgent(ua = '') {
  let device = 'Desktop';
  if (/mobile|android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua)) {
    device = /ipad|tablet/i.test(ua) ? 'Tablet' : 'Mobile';
  }

  let os = 'Unknown OS';
  if (/windows/i.test(ua)) os = 'Windows';
  else if (/macintosh|mac os x/i.test(ua)) os = 'macOS';
  else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/linux/i.test(ua)) os = 'Linux';

  let browser = 'Unknown Browser';
  if (/edg/i.test(ua)) browser = 'Microsoft Edge';
  else if (/chrome|crios/i.test(ua) && !/opr|opera|brave/i.test(ua)) browser = 'Google Chrome';
  else if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) browser = 'Apple Safari';
  else if (/firefox|fxios/i.test(ua)) browser = 'Mozilla Firefox';
  else if (/opr|opera/i.test(ua)) browser = 'Opera';
  else if (/brave/i.test(ua)) browser = 'Brave';

  return { device, os, browser };
}

export default async function handler(req, res) {
  const isWebReq = typeof req?.headers?.get === 'function';
  const method = isWebReq ? req.method : req?.method;
  const url = isWebReq ? new URL(req.url).pathname : (req.url || '').split('?')[0];

  const securityHeaders = {
    'Content-Type': 'application/json',
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
    'Cache-Control': 'no-store, no-cache, must-revalidate, private',
    'X-Robots-Tag': 'noindex, nofollow, noarchive, nosnippet',
  };

  const getHeader = (name) => {
    if (isWebReq) return req.headers.get(name) || '';
    return req.headers[name.toLowerCase()] || '';
  };

  const clientIp =
    getHeader('x-real-ip') ||
    getHeader('x-forwarded-for')?.split(',')[0]?.trim() ||
    getHeader('x-vercel-ip') ||
    req.socket?.remoteAddress ||
    '127.0.0.1';

  // Handle CORS Preflight
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

  // ============================================================================
  // ROUTE 1: VISITOR TELEMETRY INGESTION (POST /api/track-visit)
  // ============================================================================
  const isTrackVisit = url.includes('track-visit') || (method === 'POST' && !getHeader('x-admin-key'));

  if (isTrackVisit && method === 'POST') {
    try {
      let payload = {};
      if (isWebReq) {
        try {
          payload = await req.json();
        } catch {}
      } else {
        payload = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      }

      const geoCountry = getHeader('x-vercel-ip-country') || payload.reportedCountry || 'Unknown';
      const geoCity = getHeader('x-vercel-ip-city') || payload.reportedCity || 'Unknown';
      const geoRegion = getHeader('x-vercel-ip-country-region') || '';
      const geoTimezone = getHeader('x-vercel-ip-timezone') || payload.reportedTimezone || '';

      const userAgent = getHeader('user-agent') || payload.userAgent || '';
      const { device, os, browser } = parseUserAgent(userAgent);

      const now = new Date();
      const visitRecord = {
        id: `vis_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        ip: clientIp.replace(/^.*:/, '') || '127.0.0.1',
        timestamp: now.toISOString(),
        timestampEpoch: Date.now(),
        country: geoCountry,
        city: geoCity,
        region: geoRegion,
        timezone: geoTimezone,
        device: payload.deviceType || device,
        os: payload.os || os,
        browser: payload.browser || browser,
        screenResolution: payload.screen || 'Unknown',
        language: payload.language || getHeader('accept-language')?.split(',')[0] || 'Unknown',
        referrer: payload.referrer || getHeader('referer') || 'Direct',
        currentTab: payload.tab || 'home',
        activeTheme: payload.theme || 'default',
        sessionId: payload.sessionId || `sess_${Math.random().toString(36).slice(2, 9)}`,
      };

      // 1. Add to In-Memory & /tmp Disk Buffer
      const records = globalThis.__OMNIDEX_VISITOR_BUFFER;
      records.unshift(visitRecord);
      if (records.length > 500) records.length = 500;
      saveToDisk(records);

      // 2. Optional Vercel KV / Upstash Redis
      const kvUrl = process.env.KV_REST_API_URL;
      const kvToken = process.env.KV_REST_API_TOKEN;
      if (kvUrl && kvToken) {
        try {
          await fetch(`${kvUrl}/set/visit:${visitRecord.id}`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${kvToken}` },
            body: JSON.stringify(visitRecord),
          });
          await fetch(`${kvUrl}/lpush/recent_visits/${visitRecord.id}`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${kvToken}` },
          });
        } catch {}
      }

      // 3. Optional Supabase PostgreSQL Sync
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (supabaseUrl && supabaseKey) {
        try {
          await fetch(`${supabaseUrl}/rest/v1/visitor_logs`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              apikey: supabaseKey,
              Authorization: `Bearer ${supabaseKey}`,
              Prefer: 'return=minimal',
            },
            body: JSON.stringify({
              ip: visitRecord.ip,
              country: visitRecord.country,
              city: visitRecord.city,
              device: visitRecord.device,
              os: visitRecord.os,
              browser: visitRecord.browser,
              screen_resolution: visitRecord.screenResolution,
              referrer: visitRecord.referrer,
              tab: visitRecord.currentTab,
              session_id: visitRecord.sessionId,
              created_at: visitRecord.timestamp,
            }),
          });
        } catch {}
      }

      const resBody = { success: true, acknowledgedAt: visitRecord.timestamp };
      if (isWebReq) {
        return new Response(JSON.stringify(resBody), {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      } else {
        res.setHeader('Access-Control-Allow-Origin', '*');
        return res.status(200).json(resBody);
      }
    } catch (e) {
      if (isWebReq) return new Response(JSON.stringify({ error: 'Ingestion error' }), { status: 500 });
      return res.status(500).json({ error: 'Ingestion error' });
    }
  }

  // ============================================================================
  // ROUTE 2: ADMIN TELEMETRY & AUDIT GATE (/api/admin-telemetry)
  // ============================================================================
  const rateLimitStatus = checkRateLimit(clientIp);
  if (rateLimitStatus.locked) {
    const lockedBody = {
      error: 'Security Lockout',
      message: `Too many failed authentication attempts. Access locked for ${rateLimitStatus.remainingMin} minutes.`,
    };
    if (isWebReq) return new Response(JSON.stringify(lockedBody), { status: 429, headers: securityHeaders });
    Object.entries(securityHeaders).forEach(([k, v]) => res.setHeader(k, v));
    return res.status(429).json(lockedBody);
  }

  const expectedKey = process.env.ADMIN_SECRET_KEY || 'omnidex-admin-vault-2026';
  const authKey =
    getHeader('x-admin-key') ||
    (isWebReq ? req.headers.get('authorization') : req.headers['authorization'])?.replace(/^Bearer\s+/i, '') ||
    '';

  const isAuthorized = timingSafeCheck(authKey, expectedKey);

  if (!isAuthorized) {
    recordFailedAttempt(clientIp);
    const deniedBody = { error: 'Access Denied', message: 'Invalid or missing Master Admin Key.' };
    if (isWebReq) {
      return new Response(JSON.stringify(deniedBody), {
        status: 401,
        headers: { ...securityHeaders, 'WWW-Authenticate': 'Bearer realm="Omnidex Sentinel"' },
      });
    }
    Object.entries(securityHeaders).forEach(([k, v]) => res.setHeader(k, v));
    return res.status(401).json(deniedBody);
  }

  recordSuccessfulAttempt(clientIp);

  // Clear Telemetry Logs (DELETE)
  if (method === 'DELETE') {
    globalThis.__OMNIDEX_VISITOR_BUFFER = [];
    saveToDisk([]);

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

    const wipeBody = { success: true, message: 'Telemetry logs wiped.' };
    if (isWebReq) return new Response(JSON.stringify(wipeBody), { status: 200, headers: securityHeaders });
    Object.entries(securityHeaders).forEach(([k, v]) => res.setHeader(k, v));
    return res.status(200).json(wipeBody);
  }

  // Retrieve Records (GET)
  try {
    let records = globalThis.__OMNIDEX_VISITOR_BUFFER;
    if (!records || records.length === 0) {
      records = loadFromDisk();
      globalThis.__OMNIDEX_VISITOR_BUFFER = records;
    }

    // Try Vercel KV if available
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
          if (validKv.length > 0) records = validKv;
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

    if (isWebReq) return new Response(JSON.stringify(payload), { status: 200, headers: securityHeaders });
    Object.entries(securityHeaders).forEach(([k, v]) => res.setHeader(k, v));
    return res.status(200).json(payload);
  } catch (err) {
    if (isWebReq) return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: securityHeaders });
    Object.entries(securityHeaders).forEach(([k, v]) => res.setHeader(k, v));
    return res.status(500).json({ error: err.message });
  }
}
