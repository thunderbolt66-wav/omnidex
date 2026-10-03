// ==============================================================================
// Netlify Serverless Backend: Secure Sentinel Admin Telemetry Endpoint
// Protected by Master Admin Secret Key (Zero Visitor Access)
// ==============================================================================

import { getStore } from '@netlify/blobs';

function isAuthorized(request) {
  const adminKey =
    request.headers.get('x-admin-key') ||
    request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');

  const expectedKey = process.env.ADMIN_SECRET_KEY || 'omnidex-admin-vault-2026';
  return Boolean(adminKey && adminKey === expectedKey);
}

export default async function handler(request, context) {
  // 1. Strict Authentication Gate
  if (!isAuthorized(request)) {
    return new Response(
      JSON.stringify({
        error: 'Access Denied',
        message: 'Invalid or missing Master Admin Key. This incident has been logged.',
      }),
      {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'WWW-Authenticate': 'Bearer realm="Omnidex Sentinel"',
        },
      }
    );
  }

  // Handle CORS Preflight if called from custom domain
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, x-admin-key, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      },
    });
  }

  // 2. Clear Telemetry Logs
  if (request.method === 'DELETE') {
    try {
      globalThis.__OMNIDEX_VISITOR_BUFFER = [];
      const store = getStore({ name: 'omnidex_telemetry' });
      await store.setJSON('recent_visit_ids', []);
      return new Response(JSON.stringify({ success: true, message: 'Telemetry logs wiped successfully.' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: 'Failed to clear logs' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // 3. Retrieve Telemetry Data
  try {
    let records = [];

    // Attempt to read from Netlify Blobs
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
    } catch (blobErr) {
      // Fallback to memory
    }

    // Merge with in-memory buffer if blobs was empty
    if (records.length === 0 && Array.isArray(globalThis.__OMNIDEX_VISITOR_BUFFER)) {
      records = [...globalThis.__OMNIDEX_VISITOR_BUFFER];
    }

    // Compute Analytical Insights
    const totalVisits = records.length;
    const uniqueIps = new Set(records.map((r) => r.ip)).size;

    const countries = {};
    const devices = {};
    const osMap = {};
    const browsers = {};

    records.forEach((r) => {
      // Countries
      const country = r.country || 'Unknown';
      countries[country] = (countries[country] || 0) + 1;

      // Devices
      const dev = r.device || 'Desktop';
      devices[dev] = (devices[dev] || 0) + 1;

      // OS
      const os = r.os || 'Unknown OS';
      osMap[os] = (osMap[os] || 0) + 1;

      // Browser
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
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
