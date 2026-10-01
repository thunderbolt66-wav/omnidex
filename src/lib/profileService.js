/**
 * Multi-User Profile Management Service for Omnidex
 * Strictly Local Device Storage: all profiles, active logins, bookshelves, and histories
 * are preserved 100% locally on this PC without remote server or cloud account requirements.
 */

import { PRESET_AVATARS, resolveAvatarUrl } from './profileAvatars.js';
import { sanitizeString, safeLocalStorageSet } from './securityUtils.js';
import { APP_VERSION } from './appConfig.js';

const PROFILES_KEY = 'antigravity_profiles';
const PROFILES_BACKUP_KEY = 'antigravity_profiles_backup';
const ACTIVE_PROFILE_KEY = 'antigravity_active_profile_id';
const ACTIVE_PROFILE_BACKUP_KEY = 'antigravity_active_profile_backup';
const LEGACY_BOOKS_KEY = 'antigravity_books';
const LEGACY_HISTORY_KEY = 'antigravity_search_history';

// Initial default profile: strictly 1 prebuilt profile named 'Guest'
const INITIAL_PROFILES = [
  {
    id: 'profile-guest',
    name: 'Guest',
    avatar: 'avatar-guest',
    theme: 'dark',
    fontFamily: 'font-sans',
    reduceMotion: false,
    pinHash: null,
    isLocked: false,
    createdAt: Date.now(),
    lastLoginAt: Date.now(),
  },
];

/**
 * Local storage write with redundant backup layer
 */
function saveProfilesLocally(profiles) {
  const json = JSON.stringify(profiles);
  safeLocalStorageSet(PROFILES_KEY, json);
  safeLocalStorageSet(PROFILES_BACKUP_KEY, json);
}

function saveActiveProfileLocally(profileId) {
  safeLocalStorageSet(ACTIVE_PROFILE_KEY, profileId);
  safeLocalStorageSet(ACTIVE_PROFILE_BACKUP_KEY, profileId);
}

/**
 * Migration & initialization of profiles strictly in local storage
 */
function initProfiles() {
  try {
    let raw = localStorage.getItem(PROFILES_KEY);
    if (!raw) {
      raw = localStorage.getItem(PROFILES_BACKUP_KEY);
    }

    if (!raw) {
      saveProfilesLocally(INITIAL_PROFILES);
      saveActiveProfileLocally(INITIAL_PROFILES[0].id);

      // Migrate existing books to Guest profile
      const legacyBooks = localStorage.getItem(LEGACY_BOOKS_KEY);
      if (legacyBooks) {
        safeLocalStorageSet(`antigravity_books_${INITIAL_PROFILES[0].id}`, legacyBooks);
      }
      const legacyHistory = localStorage.getItem(LEGACY_HISTORY_KEY);
      if (legacyHistory) {
        safeLocalStorageSet(`antigravity_search_history_${INITIAL_PROFILES[0].id}`, legacyHistory);
      }

      return INITIAL_PROFILES;
    }

    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // If user had the old sample trio [Dave, Chris, Ronnie], migrate cleanly to single Guest profile
      const isLegacySampleTrio =
        parsed.length === 3 &&
        parsed.some((p) => p.id === 'profile-dave') &&
        parsed.some((p) => p.id === 'profile-chris') &&
        parsed.some((p) => p.id === 'profile-ronnie');

      if (isLegacySampleTrio) {
        // Move any books from Dave to Guest
        const daveBooks =
          localStorage.getItem('antigravity_books_profile-dave') ||
          localStorage.getItem(LEGACY_BOOKS_KEY);
        if (daveBooks) {
          safeLocalStorageSet('antigravity_books_profile-guest', daveBooks);
        }
        const daveHistory =
          localStorage.getItem('antigravity_search_history_profile-dave') ||
          localStorage.getItem(LEGACY_HISTORY_KEY);
        if (daveHistory) {
          safeLocalStorageSet('antigravity_search_history_profile-guest', daveHistory);
        }

        saveProfilesLocally(INITIAL_PROFILES);
        saveActiveProfileLocally(INITIAL_PROFILES[0].id);
        return INITIAL_PROFILES;
      }

      // Normalize schema ensuring local fields exist
      return parsed.map((p) => ({
        ...p,
        isLocked: Boolean(p.isLocked),
        pinHash: p.pinHash || null,
        lastLoginAt: p.lastLoginAt || p.createdAt || Date.now(),
      }));
    }
    return INITIAL_PROFILES;
  } catch {
    return INITIAL_PROFILES;
  }
}

/**
 * Get all available reader profiles saved locally
 */
export function getProfiles() {
  return initProfiles();
}

/**
 * Get the currently active/logged-in profile ID saved locally
 */
export function getActiveProfileId() {
  try {
    let active = localStorage.getItem(ACTIVE_PROFILE_KEY);
    if (!active) {
      active = localStorage.getItem(ACTIVE_PROFILE_BACKUP_KEY);
    }
    const profiles = getProfiles();
    if (active && profiles.some((p) => p.id === active)) {
      return active;
    }
    const fallback = profiles[0]?.id || 'profile-guest';
    saveActiveProfileLocally(fallback);
    return fallback;
  } catch {
    return 'profile-guest';
  }
}

/**
 * Get active profile full details with resolved avatar
 */
export function getActiveProfile() {
  const profiles = getProfiles();
  const activeId = getActiveProfileId();
  const found = profiles.find((p) => p.id === activeId);
  if (found) {
    return {
      ...found,
      avatarUrl: resolveAvatarUrl(found.avatar),
    };
  }
  return {
    ...profiles[0],
    avatarUrl: resolveAvatarUrl(profiles[0].avatar),
  };
}

/**
 * Switch active profile and preserve login session locally on this device
 */
export function switchActiveProfile(profileId) {
  const profiles = getProfiles();
  const target = profiles.find((p) => p.id === profileId);
  if (!target) return null;

  saveActiveProfileLocally(profileId);

  // Update lastLoginAt timestamp locally
  const updatedProfiles = profiles.map((p) =>
    p.id === profileId ? { ...p, lastLoginAt: Date.now() } : p
  );
  saveProfilesLocally(updatedProfiles);

  // Read isolated profile preferences strictly scoped to this profile
  const pTheme = localStorage.getItem(`antigravity_theme_${profileId}`) || target.theme || 'dark';
  const pFont = localStorage.getItem(`antigravity_font_${profileId}`) || target.fontFamily || 'font-sans';
  const motionRaw = localStorage.getItem(`antigravity_motion_${profileId}`);
  const pMotion = motionRaw !== null ? motionRaw === 'true' : Boolean(target.reduceMotion);

  safeLocalStorageSet('antigravity_theme', pTheme);
  safeLocalStorageSet('antigravity_font', pFont);
  safeLocalStorageSet('antigravity_motion', String(pMotion));

  // Notify components across app (Library, Search, Settings)
  window.dispatchEvent(
    new CustomEvent('antigravity:profile-switched', {
      detail: {
        profileId,
        profile: {
          ...target,
          theme: pTheme,
          fontFamily: pFont,
          reduceMotion: pMotion,
          avatarUrl: resolveAvatarUrl(target.avatar),
        },
      },
    })
  );

  return target;
}

/**
 * Hashes a 4-digit PIN using standard SHA-256 for secure local verification
 */
export async function hashPin(pin) {
  if (!pin || typeof pin !== 'string') return null;
  const trimmed = pin.trim();
  if (!trimmed) return null;

  try {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      const msgUint8 = new TextEncoder().encode(`omni_pin_${trimmed}`);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    }
  } catch {}

  // Fallback hash if subtle crypto unavailable
  let hash = 0;
  const str = `omni_pin_${trimmed}`;
  for (let i = 0; i < str.length; i++) {
    hash = (Math.imul(31, hash) + str.charCodeAt(i)) | 0;
  }
  return 'pin_hash_' + Math.abs(hash).toString(16);
}

/**
 * Verify profile PIN locally on this device
 */
export async function verifyProfilePin(profileId, pin) {
  const profiles = getProfiles();
  const target = profiles.find((p) => p.id === profileId);
  if (!target) return false;
  if (!target.isLocked || !target.pinHash) return true;
  const hashed = await hashPin(pin);
  return hashed === target.pinHash;
}

/**
 * Set or change a profile PIN locally
 */
export async function setProfilePin(profileId, pin) {
  if (!pin || !pin.trim()) {
    return updateProfile(profileId, { pinHash: null, isLocked: false });
  }
  const hashed = await hashPin(pin);
  return updateProfile(profileId, { pinHash: hashed, isLocked: true });
}

/**
 * Remove PIN lock from a profile locally
 */
export async function removeProfilePin(profileId) {
  return updateProfile(profileId, { pinHash: null, isLocked: false });
}

/**
 * Create a new user profile saved locally
 */
export function createProfile({
  name,
  avatar,
  theme = 'dark',
  fontFamily = 'font-sans',
  pin = '',
}) {
  const cleanName = sanitizeString(name, 30) || 'Reader';
  const profiles = getProfiles();

  const newProfile = {
    id: 'profile-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
    name: cleanName,
    avatar: avatar || PRESET_AVATARS[profiles.length % PRESET_AVATARS.length].id,
    theme: theme || 'dark',
    fontFamily: fontFamily || 'font-sans',
    reduceMotion: false,
    searchHistoryEnabled: true,
    pinHash: null,
    isLocked: false,
    createdAt: Date.now(),
    lastLoginAt: Date.now(),
  };

  const updated = [...profiles, newProfile];
  saveProfilesLocally(updated);

  // Initialize completely isolated, fresh reading shelf & settings for this profile
  safeLocalStorageSet(`antigravity_books_${newProfile.id}`, JSON.stringify([]));
  safeLocalStorageSet(`antigravity_search_history_${newProfile.id}`, JSON.stringify([]));
  safeLocalStorageSet(`antigravity_search_history_enabled_${newProfile.id}`, 'true');
  safeLocalStorageSet(`antigravity_theme_${newProfile.id}`, newProfile.theme);
  safeLocalStorageSet(`antigravity_font_${newProfile.id}`, newProfile.fontFamily);
  safeLocalStorageSet(`antigravity_motion_${newProfile.id}`, 'false');

  // If a pin was supplied, hash and store it
  if (pin && pin.trim().length === 4) {
    hashPin(pin).then((hashed) => {
      updateProfile(newProfile.id, { pinHash: hashed, isLocked: true });
    });
  }

  window.dispatchEvent(new CustomEvent('antigravity:profiles-updated'));
  return newProfile;
}

/**
 * Update an existing profile stored locally
 */
export function updateProfile(profileId, updates) {
  const profiles = getProfiles();
  let updatedTarget = null;

  const updated = profiles.map((p) => {
    if (p.id === profileId) {
      updatedTarget = {
        ...p,
        ...(updates.name ? { name: sanitizeString(updates.name, 30) } : {}),
        ...(updates.avatar !== undefined ? { avatar: updates.avatar } : {}),
        ...(updates.theme ? { theme: updates.theme } : {}),
        ...(updates.fontFamily ? { fontFamily: updates.fontFamily } : {}),
        ...(updates.reduceMotion !== undefined ? { reduceMotion: Boolean(updates.reduceMotion) } : {}),
        ...(updates.searchHistoryEnabled !== undefined ? { searchHistoryEnabled: Boolean(updates.searchHistoryEnabled) } : {}),
        ...(updates.isLocked !== undefined ? { isLocked: Boolean(updates.isLocked) } : {}),
        ...(updates.pinHash !== undefined ? { pinHash: updates.pinHash } : {}),
      };
      return updatedTarget;
    }
    return p;
  });

  if (updatedTarget) {
    saveProfilesLocally(updated);

    // Persist scoped keys strictly isolated for this specific profile
    if (updates.theme) safeLocalStorageSet(`antigravity_theme_${profileId}`, updates.theme);
    if (updates.fontFamily) safeLocalStorageSet(`antigravity_font_${profileId}`, updates.fontFamily);
    if (updates.reduceMotion !== undefined) safeLocalStorageSet(`antigravity_motion_${profileId}`, String(updates.reduceMotion));
    if (updates.searchHistoryEnabled !== undefined) safeLocalStorageSet(`antigravity_search_history_enabled_${profileId}`, String(updates.searchHistoryEnabled));

    window.dispatchEvent(new CustomEvent('antigravity:profiles-updated'));

    // If updating current active profile, sync live settings
    if (getActiveProfileId() === profileId) {
      if (updates.theme) safeLocalStorageSet('antigravity_theme', updates.theme);
      if (updates.fontFamily) safeLocalStorageSet('antigravity_font', updates.fontFamily);
      if (updates.reduceMotion !== undefined) safeLocalStorageSet('antigravity_motion', String(updates.reduceMotion));
      window.dispatchEvent(
        new CustomEvent('antigravity:profile-switched', {
          detail: {
            profileId,
            profile: {
              ...updatedTarget,
              theme: updates.theme || updatedTarget.theme,
              fontFamily: updates.fontFamily || updatedTarget.fontFamily,
              reduceMotion: updates.reduceMotion !== undefined ? updatedTarget.reduceMotion : undefined,
              avatarUrl: resolveAvatarUrl(updatedTarget.avatar),
            },
          },
        })
      );
    }
  }

  return updatedTarget;
}

/**
 * Delete a profile stored locally (prevents deleting last profile)
 */
export function deleteProfile(profileId) {
  const profiles = getProfiles();
  if (profiles.length <= 1) {
    return { success: false, message: 'You must keep at least one profile.' };
  }

  const filtered = profiles.filter((p) => p.id !== profileId);
  saveProfilesLocally(filtered);

  // Remove profile-scoped data locally
  try {
    localStorage.removeItem(`antigravity_books_${profileId}`);
    localStorage.removeItem(`antigravity_search_history_${profileId}`);
    localStorage.removeItem(`antigravity_search_history_enabled_${profileId}`);
    localStorage.removeItem(`antigravity_theme_${profileId}`);
    localStorage.removeItem(`antigravity_font_${profileId}`);
    localStorage.removeItem(`antigravity_motion_${profileId}`);
  } catch {}

  // If deleted profile was active, switch to first remaining
  if (getActiveProfileId() === profileId) {
    switchActiveProfile(filtered[0].id);
  }

  window.dispatchEvent(new CustomEvent('antigravity:profiles-updated'));
  return { success: true };
}

/**
 * Storage keys scoped by active profile
 */
export function getProfileBooksKey(profileId) {
  const id = profileId || getActiveProfileId();
  return `antigravity_books_${id}`;
}

export function getProfileSearchHistoryKey(profileId) {
  const id = profileId || getActiveProfileId();
  return `antigravity_search_history_${id}`;
}

/**
 * Export all local profiles, bookshelves, and search history to a downloadable JSON file
 */
export function exportLocalData() {
  const profiles = getProfiles();
  const activeId = getActiveProfileId();

  const exportPayload = {
    appName: 'Omnidex',
    version: APP_VERSION.replace('v', ''),
    exportedAt: new Date().toISOString(),
    activeProfileId: activeId,
    profiles,
    data: {},
  };

  // Bundle books and search history for each profile
  for (const prof of profiles) {
    try {
      const booksKey = `antigravity_books_${prof.id}`;
      const historyKey = `antigravity_search_history_${prof.id}`;
      const booksRaw = localStorage.getItem(booksKey);
      const historyRaw = localStorage.getItem(historyKey);
      exportPayload.data[prof.id] = {
        books: booksRaw ? JSON.parse(booksRaw) : [],
        history: historyRaw ? JSON.parse(historyRaw) : [],
        theme: localStorage.getItem(`antigravity_theme_${prof.id}`) || prof.theme || 'dark',
        fontFamily: localStorage.getItem(`antigravity_font_${prof.id}`) || prof.fontFamily || 'font-sans',
        reduceMotion: localStorage.getItem(`antigravity_motion_${prof.id}`) === 'true' || Boolean(prof.reduceMotion),
        searchHistoryEnabled: localStorage.getItem(`antigravity_search_history_enabled_${prof.id}`) !== 'false',
      };
    } catch (e) {
      console.warn(`Export error for profile ${prof.id}:`, e);
    }
  }

  return exportPayload;
}

/**
 * Import and restore local profiles and data from backup JSON directly into local storage
 */
export function importLocalData(payload) {
  try {
    const data = typeof payload === 'string' ? JSON.parse(payload) : payload;
    if (!data || !Array.isArray(data.profiles) || data.profiles.length === 0) {
      return { success: false, message: 'Invalid backup file format.' };
    }

    // Save restored profiles
    saveProfilesLocally(data.profiles);

    // Save books, history, and isolated settings for each profile
    if (data.data && typeof data.data === 'object') {
      for (const [profId, profData] of Object.entries(data.data)) {
        if (profData.books) {
          safeLocalStorageSet(`antigravity_books_${profId}`, JSON.stringify(profData.books));
        }
        if (profData.history) {
          safeLocalStorageSet(`antigravity_search_history_${profId}`, JSON.stringify(profData.history));
        }
        if (profData.theme) {
          safeLocalStorageSet(`antigravity_theme_${profId}`, profData.theme);
        }
        if (profData.fontFamily) {
          safeLocalStorageSet(`antigravity_font_${profId}`, profData.fontFamily);
        }
        if (profData.reduceMotion !== undefined) {
          safeLocalStorageSet(`antigravity_motion_${profId}`, String(profData.reduceMotion));
        }
        if (profData.searchHistoryEnabled !== undefined) {
          safeLocalStorageSet(`antigravity_search_history_enabled_${profId}`, String(profData.searchHistoryEnabled));
        }
      }
    }

    // Set active profile
    const targetActive =
      data.activeProfileId && data.profiles.some((p) => p.id === data.activeProfileId)
        ? data.activeProfileId
        : data.profiles[0].id;

    switchActiveProfile(targetActive);
    window.dispatchEvent(new CustomEvent('antigravity:profiles-updated'));
    window.dispatchEvent(new CustomEvent('antigravity:books-updated', { detail: { type: 'sync' } }));

    return { success: true, count: data.profiles.length };
  } catch (err) {
    console.error('Import failure:', err);
    return { success: false, message: err.message || 'Corrupted file' };
  }
}

/**
 * Return system diagnostics about local storage on this PC
 */
export function getLocalStorageDiagnostics() {
  const profiles = getProfiles();
  const activeId = getActiveProfileId();
  let totalBooks = 0;
  let totalHistory = 0;
  let estimatedBytes = 0;

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('antigravity_')) {
        const val = localStorage.getItem(k) || '';
        estimatedBytes += (k.length + val.length) * 2;
      }
    }

    for (const p of profiles) {
      const bRaw = localStorage.getItem(`antigravity_books_${p.id}`);
      if (bRaw) {
        try {
          const parsed = JSON.parse(bRaw);
          if (Array.isArray(parsed)) totalBooks += parsed.length;
        } catch {}
      }
      const hRaw = localStorage.getItem(`antigravity_search_history_${p.id}`);
      if (hRaw) {
        try {
          const parsed = JSON.parse(hRaw);
          if (Array.isArray(parsed)) totalHistory += parsed.length;
        } catch {}
      }
    }
  } catch {}

  return {
    storageType: 'Local Device Storage (localStorage)',
    isLocallyPreserved: true,
    profilesCount: profiles.length,
    activeProfileId: activeId,
    totalBooksStored: totalBooks,
    totalHistoryEntries: totalHistory,
    storageSizeKb: (estimatedBytes / 1024).toFixed(1),
  };
}
