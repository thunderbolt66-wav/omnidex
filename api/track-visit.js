// ==============================================================================
// Vercel Serverless Backend: Omnidex Visitor Tracker
// Compatible with Vercel Node.js and Edge runtimes
// Extracts Real IP, Geolocation (Vercel CDN Headers), Device, and Session Telemetry
// ==============================================================================

// In-memory buffer across warm serverless invocations
if (!globalThis.__OMNIDEX_VISITOR_BUFFER) {
  globalThis.__OMNIDEX_VISITOR_BUFFER = [];
}

/**
 * Parse User-Agent into clean device, OS, and browser labels
 */
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
  // Support both Web API Request (Edge) and Node.js (req, res)
  const isWebReq = typeof req?.headers?.get === 'function';
  const method = isWebReq ? req.method : req?.method;

  if (method === 'OPTIONS') {
    if (isWebReq) {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    } else {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      return res.status(204).end();
    }
  }

  if (method !== 'POST') {
    const errorBody = { error: 'Method Not Allowed' };
    if (isWebReq) {
      return new Response(JSON.stringify(errorBody), {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      return res.status(405).json(errorBody);
    }
  }

  try {
    // Extract payload
    let payload = {};
    if (isWebReq) {
      try {
        payload = await req.json();
      } catch {}
    } else {
      if (typeof req.body === 'string') {
        try {
          payload = JSON.parse(req.body);
        } catch {}
      } else {
        payload = req.body || {};
      }
    }

    // Extract headers
    const getHeader = (name) => {
      if (isWebReq) return req.headers.get(name) || '';
      return req.headers[name.toLowerCase()] || '';
    };

    // Real client IP extraction
    const clientIp =
      getHeader('x-real-ip') ||
      getHeader('x-forwarded-for')?.split(',')[0]?.trim() ||
      getHeader('x-vercel-ip') ||
      req.socket?.remoteAddress ||
      '127.0.0.1';

    // Geolocation from Vercel Edge Headers
    const geoCountry =
      getHeader('x-vercel-ip-country') ||
      payload.reportedCountry ||
      'Unknown';
    const geoCity =
      getHeader('x-vercel-ip-city') ||
      payload.reportedCity ||
      'Unknown';
    const geoRegion =
      getHeader('x-vercel-ip-country-region') ||
      '';
    const geoTimezone =
      getHeader('x-vercel-ip-timezone') ||
      payload.reportedTimezone ||
      '';

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
      pageviews: 1,
    };

    // 1. In-Memory Store
    const memoryBuffer = globalThis.__OMNIDEX_VISITOR_BUFFER;
    memoryBuffer.unshift(visitRecord);
    if (memoryBuffer.length > 500) {
      memoryBuffer.length = 500;
    }

    // 2. Optional Vercel KV / Upstash Redis support
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
      } catch (kvErr) {
        // Fallback to memory
      }
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
      } catch (sbErr) {
        // Silently continue
      }
    }

    const successResponse = {
      success: true,
      acknowledgedAt: visitRecord.timestamp,
    };

    if (isWebReq) {
      return new Response(JSON.stringify(successResponse), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } else {
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.status(200).json(successResponse);
    }
  } catch (err) {
    const errorBody = { error: 'Telemetry logging error' };
    if (isWebReq) {
      return new Response(JSON.stringify(errorBody), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      return res.status(500).json(errorBody);
    }
  }
}
