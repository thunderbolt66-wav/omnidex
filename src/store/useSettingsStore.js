import { create } from 'zustand';
import { getActiveProfile, getActiveProfileId, updateProfile } from '../lib/profileService.js';

// Read initial settings strictly scoped to the active profile
const getStoredSettings = () => {
  try {
    const active = getActiveProfile();
    const activeId = active?.id || getActiveProfileId();

    const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const urlTheme = urlParams?.get('theme');

    const theme =
      urlTheme ||
      localStorage.getItem(`antigravity_theme_${activeId}`) ||
      active?.theme ||
      localStorage.getItem('antigravity_theme') ||
      'dark';

    const fontFamily =
      localStorage.getItem(`antigravity_font_${activeId}`) ||
      active?.fontFamily ||
      localStorage.getItem('antigravity_font') ||
      'font-sans';

    const motionRaw = localStorage.getItem(`antigravity_motion_${activeId}`);
    const reduceMotion =
      motionRaw !== null
        ? motionRaw === 'true'
        : Boolean(active?.reduceMotion);

    return { theme, fontFamily, reduceMotion };
  } catch {
    return { theme: 'dark', fontFamily: 'font-sans', reduceMotion: false };
  }
};

const initial = getStoredSettings();

export const useSettingsStore = create((set) => ({
  theme: initial.theme,
  fontFamily: initial.fontFamily,
  reduceMotion: initial.reduceMotion,

  // Set theme strictly for the currently active profile
  setTheme: (theme) => {
    try {
      const activeId = getActiveProfileId();
      localStorage.setItem(`antigravity_theme_${activeId}`, theme);
      localStorage.setItem('antigravity_theme', theme);
      updateProfile(activeId, { theme });
    } catch {}
    set({ theme });
  },

  // Set font family strictly for the currently active profile
  setFontFamily: (fontFamily) => {
    try {
      const activeId = getActiveProfileId();
      localStorage.setItem(`antigravity_font_${activeId}`, fontFamily);
      localStorage.setItem('antigravity_font', fontFamily);
      updateProfile(activeId, { fontFamily });
    } catch {}
    set({ fontFamily });
  },

  // Set reduce motion strictly for the currently active profile
  setReduceMotion: (reduceMotion) => {
    try {
      const activeId = getActiveProfileId();
      localStorage.setItem(`antigravity_motion_${activeId}`, String(reduceMotion));
      localStorage.setItem('antigravity_motion', String(reduceMotion));
      updateProfile(activeId, { reduceMotion: Boolean(reduceMotion) });
    } catch {}
    set({ reduceMotion });
  },

  // Toggle reduce motion strictly for the currently active profile
  toggleReduceMotion: () =>
    set((state) => {
      const next = !state.reduceMotion;
      try {
        const activeId = getActiveProfileId();
        localStorage.setItem(`antigravity_motion_${activeId}`, String(next));
        localStorage.setItem('antigravity_motion', String(next));
        updateProfile(activeId, { reduceMotion: Boolean(next) });
      } catch {}
      return { reduceMotion: next };
    }),
}));

// Automatically synchronize store when switching profiles
if (typeof window !== 'undefined') {
  window.addEventListener('antigravity:profile-switched', (e) => {
    const profile = e.detail?.profile;
    const profileId = e.detail?.profileId || profile?.id;
    if (profile && profileId) {
      const theme =
        localStorage.getItem(`antigravity_theme_${profileId}`) ||
        profile.theme ||
        'dark';

      const fontFamily =
        localStorage.getItem(`antigravity_font_${profileId}`) ||
        profile.fontFamily ||
        'font-sans';

      const motionRaw = localStorage.getItem(`antigravity_motion_${profileId}`);
      const reduceMotion =
        motionRaw !== null ? motionRaw === 'true' : Boolean(profile.reduceMotion);

      // Keep active mirrors updated
      try {
        localStorage.setItem('antigravity_theme', theme);
        localStorage.setItem('antigravity_font', fontFamily);
        localStorage.setItem('antigravity_motion', String(reduceMotion));
      } catch {}

      useSettingsStore.setState({
        theme,
        fontFamily,
        reduceMotion,
      });
    }
  });
}
