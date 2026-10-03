// ==============================================================================
// Netlify Serverless Backend: Omnidex Visitor Tracker
// Extracts Real IP, Geolocation, Device, Browser, and Session Telemetry
// ==============================================================================

import { getStore } from '@netlify/blobs';

// Fallback in-memory store for serverless warm instances
const memoryBuffer = globalThis.__OMNIDEX_VISITOR_BUFFER || [];
globalThis.__OMNIDEX_VISITOR_BUFFER = memoryBuffer;

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

export default async function handler(request, context) {
  // Only accept POST requests
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    let payload = {};
    try {
      payload = await request.json();
    } catch {}

    // Extract real IP from Netlify edge headers
    const headers = Object.fromEntries(request.headers);
    const clientIp =
      headers['x-nf-client-connection-ip'] ||
      headers['client-ip'] ||
      headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      context?.ip ||
      '127.0.0.1';

    // Extract Geolocation provided by Netlify's Edge CDN
    const geoCountry = headers['x-country'] || context?.geo?.country?.code || payload.reportedCountry || 'Unknown';
    const geoCity = headers['x-city'] || context?.geo?.city || payload.reportedCity || 'Unknown';
    const geoRegion = headers['x-subdivision'] || context?.geo?.subdivision?.name || '';
    const geoTimezone = headers['x-timezone'] || context?.geo?.timezone || payload.reportedTimezone || '';

    // Parse Device & User Agent
    const userAgent = headers['user-agent'] || payload.userAgent || '';
    const { device, os, browser } = parseUserAgent(userAgent);

    const now = new Date();
    const visitRecord = {
      id: `vis_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      ip: clientIp,
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
      language: payload.language || headers['accept-language']?.split(',')[0] || 'Unknown',
      referrer: payload.referrer || headers['referer'] || 'Direct',
      currentTab: payload.tab || 'home',
      activeTheme: payload.theme || 'default',
      sessionId: payload.sessionId || `sess_${Math.random().toString(36).slice(2, 9)}`,
      pageviews: 1,
    };

    // 1. Add to In-Memory Ring Buffer
    memoryBuffer.unshift(visitRecord);
    if (memoryBuffer.length > 500) {
      memoryBuffer.length = 500;
    }

    // 2. Persist to Netlify Blobs (Free serverless Key-Value store)
    try {
      const store = getStore({
        name: 'omnidex_telemetry',
        consistency: 'strong',
      });
      // Save under chronological key
      await store.setJSON(`visit:${visitRecord.id}`, visitRecord);

      // Keep index of recent 200 visit keys
      const recentKeys = (await store.get('recent_visit_ids', { type: 'json' })) || [];
      recentKeys.unshift(visitRecord.id);
      if (recentKeys.length > 300) recentKeys.length = 300;
      await store.setJSON('recent_visit_ids', recentKeys);
    } catch (blobErr) {
      // Blobs may not be active in non-Netlify environments; memoryBuffer serves as fallback
    }

    // 3. Optional Supabase PostgreSQL Sync if environment variables are provided
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
        // Silently skip if table is not created yet
      }
    }

    // Secure response: zero visitor leak
    return new Response(
      JSON.stringify({
        success: true,
        acknowledgedAt: visitRecord.timestamp,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Telemetry logging error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
