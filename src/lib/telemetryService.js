// ==============================================================================
// Omnidex Telemetry & Visitor Intelligence Client Engine
// Silent, zero-latency visitor telemetry capture & secure admin gateway
// ==============================================================================

const SESSION_KEY = 'omnidex_client_session_id';

/**
 * Get or generate persistent session ID
 */
export function getOrCreateSessionId() {
  try {
    let sid = sessionStorage.getItem(SESSION_KEY);
    if (!sid) {
      sid = `s_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      sessionStorage.setItem(SESSION_KEY, sid);
    }
    return sid;
  } catch {
    return `s_${Date.now()}_temp`;
  }
}

/**
 * Determine device form factor
 */
function getDeviceType() {
  const ua = navigator.userAgent || '';
  if (/tablet|ipad|playbook|silk/i.test(ua)) return 'Tablet';
  if (/mobile|iphone|ipod|android|blackberry|iemobile|kindle/i.test(ua)) return 'Mobile';
  return 'Desktop';
}

/**
 * Ping backend with telemetry payload
 */
export async function trackPageView({ tab = 'home', theme = 'default' } = {}) {
  try {
    const payload = {
      sessionId: getOrCreateSessionId(),
      tab,
      theme,
      path: window.location.pathname + window.location.search,
      referrer: document.referrer || 'Direct',
      screen: `${window.screen?.width || 0}x${window.screen?.height || 0}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      language: navigator.language || 'en',
      deviceType: getDeviceType(),
      userAgent: navigator.userAgent,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
      connection: navigator.connection?.effectiveType || 'unknown',
    };

    // Use non-blocking fetch with keepalive
    await fetch('/api/track-visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  } catch (err) {
    // Fail silently so visitor experience is never interrupted
  }
}

/**
 * Fetch owner-only telemetry dossier (Guarded by Master Admin Key)
 */
export async function fetchAdminTelemetry(adminKey) {
  if (!adminKey) {
    throw new Error('Master Admin Key is required.');
  }

  const res = await fetch('/api/admin-telemetry', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-key': adminKey.trim(),
    },
  });

  if (res.status === 401) {
    throw new Error('Access Denied: Incorrect Master Admin Key.');
  }

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || 'Failed to retrieve telemetry data.');
  }

  return await res.json();
}

/**
 * Clear all visitor logs (Guarded by Master Admin Key)
 */
export async function wipeAdminTelemetry(adminKey) {
  const res = await fetch('/api/admin-telemetry', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-key': adminKey.trim(),
    },
  });

  if (!res.ok) {
    throw new Error('Failed to wipe telemetry logs.');
  }

  return await res.json();
}
