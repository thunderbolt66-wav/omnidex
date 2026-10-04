// ==============================================================================
// Vercel Serverless Backend: Secure Sentinel Admin Telemetry Endpoint
// Protected by Master Admin Secret Key (Zero Visitor Access)
// ==============================================================================

if (!globalThis.__OMNIDEX_VISITOR_BUFFER) {
  globalThis.__OMNIDEX_VISITOR_BUFFER = [];
}

function isAuthorized(adminKey) {
  const expectedKey = process.env.ADMIN_SECRET_KEY || 'omnidex-admin-vault-2026';
  return Boolean(adminKey && adminKey === expectedKey);
}

export default async function handler(req, res) {
  const isWebReq = typeof req?.headers?.get === 'function';
  const method = isWebReq ? req.method : req?.method;

  // Handle CORS Preflight
  if (method === 'OPTIONS') {
    if (isWebReq) {
      return new Response(null, {
        status: 204,
        headers: {
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

  // Extract auth key
  let authKey = '';
  if (isWebReq) {
    authKey =
      req.headers.get('x-admin-key') ||
      req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ||
      '';
  } else {
    authKey =
      req.headers['x-admin-key'] ||
      req.headers['authorization']?.replace(/^Bearer\s+/i, '') ||
      '';
  }

  // 1. Strict Gatekeeper Verification
  if (!isAuthorized(authKey)) {
    const deniedBody = {
      error: 'Access Denied',
      message: 'Invalid or missing Master Admin Key. This incident has been logged.',
    };

    if (isWebReq) {
      return new Response(JSON.stringify(deniedBody), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'WWW-Authenticate': 'Bearer realm="Omnidex Sentinel"',
        },
      });
    } else {
      res.setHeader('WWW-Authenticate', 'Bearer realm="Omnidex Sentinel"');
      return res.status(401).json(deniedBody);
    }
  }

  // 2. Wipe Logs (DELETE)
  if (method === 'DELETE') {
    globalThis.__OMNIDEX_VISITOR_BUFFER.length = 0;

    // Wipe Vercel KV if configured
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
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      return res.status(200).json(wipeBody);
    }
  }

  // 3. Retrieve Telemetry Data (GET)
  try {
    let records = [...(globalThis.__OMNIDEX_VISITOR_BUFFER || [])];

    // Attempt to merge from Vercel KV if available
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
      } catch (kvErr) {}
    }

    // Compute Summary Insights
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
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, max-age=0',
        },
      });
    } else {
      res.setHeader('Cache-Control', 'no-store, max-age=0');
      return res.status(200).json(payload);
    }
  } catch (error) {
    const errorBody = { error: error.message };
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
