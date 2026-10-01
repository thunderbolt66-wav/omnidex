import { sanitizeString, safeLocalStorageSet } from './securityUtils.js';
import { getProfileSearchHistoryKey, getActiveProfileId, updateProfile } from './profileService.js';

function getStorageKey(profileId) {
  const activeId = profileId || getActiveProfileId();
  return `antigravity_search_history_${activeId}`;
}

const MAX_ARCHIVE = 300;
const DEFAULT_RECENT_LIMIT = 7;

/**
 * Checks if search history is enabled for this profile
 */
export function isSearchHistoryEnabled(profileId) {
  try {
    const activeId = profileId || getActiveProfileId();
    const val = localStorage.getItem(`antigravity_search_history_enabled_${activeId}`);
    return val === null ? true : val === 'true';
  } catch {
    return true;
  }
}

/**
 * Toggles search history for this profile only
 */
export function setSearchHistoryEnabled(enabled, profileId) {
  try {
    const activeId = profileId || getActiveProfileId();
    safeLocalStorageSet(`antigravity_search_history_enabled_${activeId}`, String(enabled));
    try {
      updateProfile(activeId, { searchHistoryEnabled: Boolean(enabled) });
    } catch {}
    window.dispatchEvent(new CustomEvent('antigravity:search-history-updated'));
  } catch (e) {
    console.error('Error toggling search history:', e);
  }
}

/**
 * Normalizes raw stored array to standardized object array:
 * [{ id: string, query: string, timestamp: number }]
 */
function normalizeEntries(raw) {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item, index) => {
        if (typeof item === 'string') {
          return {
            id: `legacy-${index}-${item}`,
            query: item,
            timestamp: Date.now() - index * 60000,
          };
        }
        if (item && typeof item === 'object' && item.query) {
          return {
            id: item.id || `sh-${item.timestamp || Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            query: String(item.query),
            timestamp: Number(item.timestamp) || Date.now(),
          };
        }
        return null;
      })
      .filter(Boolean)
      .sort((a, b) => b.timestamp - a.timestamp);
  } catch {
    return [];
  }
}

/**
 * Returns the full list of search history entries strictly for this profile
 */
export function getFullSearchHistory(profileId) {
  try {
    const activeId = profileId || getActiveProfileId();
    const key = `antigravity_search_history_${activeId}`;
    let raw = localStorage.getItem(key);
    
    if (raw !== null) {
      return normalizeEntries(raw);
    }

    // Only legacy guest profile checks fallback
    if (activeId === 'profile-guest') {
      const legacy = localStorage.getItem('antigravity_search_history');
      if (legacy) {
        safeLocalStorageSet(key, legacy);
        return normalizeEntries(legacy);
      }
    }

    // Any other profile starts with an isolated empty history
    safeLocalStorageSet(key, JSON.stringify([]));
    return [];
  } catch {
    return [];
  }
}

/**
 * Returns string queries for quick dropdowns and chips (defaults to top 7)
 */
export function getSearchHistory(limit = DEFAULT_RECENT_LIMIT, profileId) {
  try {
    const full = getFullSearchHistory(profileId);
    // Unique queries maintaining newest order
    const seen = new Set();
    const result = [];
    for (const item of full) {
      const lower = item.query.toLowerCase();
      if (!seen.has(lower)) {
        seen.add(lower);
        result.push(item.query);
        if (result.length >= limit) break;
      }
    }
    return result;
  } catch {
    return [];
  }
}

/**
 * Adds or updates a search query with current timestamp for active profile
 */
export function addSearchQuery(query, profileId) {
  if (!query || typeof query !== 'string') return;
  const sanitized = sanitizeString(query, 120);
  if (sanitized.length < 2) return;
  const activeId = profileId || getActiveProfileId();
  if (!isSearchHistoryEnabled(activeId)) return;

  try {
    const current = getFullSearchHistory(activeId);
    // Remove previous occurrences of this query (case-insensitive)
    const filtered = current.filter((item) => item.query.toLowerCase() !== sanitized.toLowerCase());
    const newEntry = {
      id: `sh-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      query: sanitized,
      timestamp: Date.now(),
    };
    const updated = [newEntry, ...filtered].slice(0, MAX_ARCHIVE);
    safeLocalStorageSet(getStorageKey(activeId), JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('antigravity:search-history-updated'));
  } catch (e) {
    console.error('Error saving search history:', e);
  }
}

/**
 * Removes a specific search query or ID for active profile
 */
export function removeSearchQuery(queryOrId, profileId) {
  try {
    const activeId = profileId || getActiveProfileId();
    const current = getFullSearchHistory(activeId);
    const target = String(queryOrId).toLowerCase();
    const updated = current.filter(
      (item) => item.id !== queryOrId && item.query.toLowerCase() !== target
    );
    safeLocalStorageSet(getStorageKey(activeId), JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('antigravity:search-history-updated'));
  } catch (e) {
    console.error('Error removing search history item:', e);
  }
}

/**
 * Deletes search history by timeframe for active profile:
 * - 'today': searches from start of today (midnight)
 * - '1month': searches from past 30 days
 * - '3months': searches from past 90 days
 * - 'all': all search history
 */
export function deleteSearchHistoryByTimeframe(timeframe, profileId) {
  try {
    const activeId = profileId || getActiveProfileId();
    const current = getFullSearchHistory(activeId);
    let updated = [];
    const now = Date.now();

    if (timeframe === 'all') {
      updated = [];
    } else if (timeframe === 'today') {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const cutoff = startOfToday.getTime();
      // Keep searches older than today
      updated = current.filter((item) => item.timestamp < cutoff);
    } else if (timeframe === '1month') {
      const cutoff = now - 30 * 24 * 60 * 60 * 1000;
      // Keep searches older than 1 month
      updated = current.filter((item) => item.timestamp < cutoff);
    } else if (timeframe === '3months') {
      const cutoff = now - 90 * 24 * 60 * 60 * 1000;
      // Keep searches older than 3 months
      updated = current.filter((item) => item.timestamp < cutoff);
    } else {
      updated = current;
    }

    const removedCount = current.length - updated.length;
    safeLocalStorageSet(getStorageKey(activeId), JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('antigravity:search-history-updated'));
    return { removedCount, remainingCount: updated.length };
  } catch (e) {
    console.error('Error deleting search history by timeframe:', e);
    return { removedCount: 0, remainingCount: 0 };
  }
}

/**
 * Clear all search history for active profile
 */
export function clearSearchHistory(profileId) {
  return deleteSearchHistoryByTimeframe('all', profileId);
}
