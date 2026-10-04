// ==============================================================================
// Omnidex Sentinel Admin API Client
// Used ONLY by the isolated Admin Standalone App. Never bundled into the main user app.
// ==============================================================================

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

  if (res.status === 401 || res.status === 403) {
    throw new Error('Access Denied: Incorrect Master Admin Key.');
  }

  if (res.status === 429) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Rate limit exceeded: Temporary lockout due to multiple failed attempts.');
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
