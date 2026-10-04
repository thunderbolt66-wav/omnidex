// ==============================================================================
// Omnidex Visitor Tracker (Client Side)
// Strictly write-only. Contains ZERO admin routes, ZERO credentials, ZERO admin code.
// ==============================================================================

const SESSION_KEY = 'omnidex_client_session_id';

function getOrCreateSessionId() {
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

function getDeviceType() {
  const ua = navigator.userAgent || '';
  if (/tablet|ipad|playbook|silk/i.test(ua)) return 'Tablet';
  if (/mobile|iphone|ipod|android|blackberry|iemobile|kindle/i.test(ua)) return 'Mobile';
  return 'Desktop';
}

/**
 * Ping backend with telemetry payload (write-only)
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

    // Non-blocking write-only ping
    await fetch('/api/track-visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Fail silently
  }
}
