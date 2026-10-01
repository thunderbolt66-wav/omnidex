import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Settings,
  X,
  Type,
  Database,
  Moon,
  Coffee,
  Sun,
  Zap,
  Trees,
  Compass,
  Flame,
  Check,
  History,
  Trash2,
  ChevronRight,
  BookOpen,
  Scroll,
  FileText,
  Feather,
  Download,
  Upload,
  HardDrive,
  Sparkles,
} from 'lucide-react';
import { useSettingsStore } from '../store/useSettingsStore';
import { THEME_LIST, getThemeClasses } from '../lib/themeStyles';
import { isSupabaseConnected } from '../lib/bookSyncService';
import {
  getSearchHistory,
  getFullSearchHistory,
  removeSearchQuery,
  clearSearchHistory,
  isSearchHistoryEnabled,
  setSearchHistoryEnabled,
} from '../lib/searchHistoryService';
import { getActiveProfile, updateProfile, exportLocalData, importLocalData, getProfiles } from '../lib/profileService';
import { FONT_LIST, FONT_CATEGORIES, getFontById } from '../lib/fontCatalog';
import SearchHistoryModal from './SearchHistoryModal';

const ICON_MAP = {
  Moon,
  Coffee,
  Sun,
  Zap,
  Trees,
  Compass,
  Flame,
  BookOpen,
  Scroll,
  FileText,
  Feather,
};

const THEME_CATEGORIES = ['All', 'Paper', 'Dark', 'Warm', 'Light', 'Nature', 'Vibrant'];

export default function SettingsPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [themeCategory, setThemeCategory] = useState('All');
  const [searchHistory, setSearchHistory] = useState(() => getSearchHistory());
  const [fullHistoryCount, setFullHistoryCount] = useState(() => getFullSearchHistory().length);
  const [historyEnabled, setHistoryEnabled] = useState(() => isSearchHistoryEnabled());
  const [historyNotice, setHistoryNotice] = useState(null);
  const [backupNotice, setBackupNotice] = useState(null);
  const [activeProfile, setActiveProfile] = useState(() => getActiveProfile());
  const panelRef = useRef(null);
  const fileInputRef = useRef(null);

  // Export full multi-profile bundle
  const handleExportAllProfiles = () => {
    try {
      const data = exportLocalData();
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `omnidex-all-profiles-settings-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      const count = data.profiles?.length || 1;
      setBackupNotice(`Exported ${count} profiles & settings!`);
      setTimeout(() => setBackupNotice(null), 3500);
    } catch (e) {
      console.error('Export error:', e);
      setBackupNotice('Export failed');
      setTimeout(() => setBackupNotice(null), 3000);
    }
  };

  // Import multi-profile bundle
  const handleImportAllProfiles = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result;
        const res = importLocalData(content);
        if (res.success) {
          setBackupNotice(`Restored ${res.count} profiles & settings!`);
          setActiveProfile(getActiveProfile());
          setSearchHistory(getSearchHistory());
          setFullHistoryCount(getFullSearchHistory().length);
        } else {
          setBackupNotice(`Restore error: ${res.message}`);
        }
      } catch (err) {
        setBackupNotice('Corrupted backup file');
      }
      setTimeout(() => setBackupNotice(null), 4000);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Sync profile changes
  useEffect(() => {
    const handleProfileUpdate = () => {
      setActiveProfile(getActiveProfile());
      setSearchHistory(getSearchHistory());
      setFullHistoryCount(getFullSearchHistory().length);
      setHistoryEnabled(isSearchHistoryEnabled());
    };
    window.addEventListener('antigravity:profile-switched', handleProfileUpdate);
    window.addEventListener('antigravity:profiles-updated', handleProfileUpdate);
    return () => {
      window.removeEventListener('antigravity:profile-switched', handleProfileUpdate);
      window.removeEventListener('antigravity:profiles-updated', handleProfileUpdate);
    };
  }, []);

  const {
    theme,
    fontFamily,
    reduceMotion,
    setTheme,
    setFontFamily,
    setReduceMotion,
  } = useSettingsStore();

  const themeStyles = getThemeClasses(theme);

  const filteredThemes = useMemo(() => {
    if (themeCategory === 'All') return THEME_LIST;
    return THEME_LIST.filter((t) => t.category === themeCategory);
  }, [themeCategory]);

  const [fontCategory, setFontCategory] = useState('All');

  const filteredFonts = useMemo(() => {
    if (fontCategory === 'All') return FONT_LIST;
    return FONT_LIST.filter((f) => f.category === fontCategory);
  }, [fontCategory]);

  const currentFont = getFontById(fontFamily);

  const handleSelectFont = (fontId) => {
    setFontFamily(fontId);
    if (activeProfile?.id) {
      updateProfile(activeProfile.id, { fontFamily: fontId });
    }
  };

  const handleSelectTheme = (themeId) => {
    setTheme(themeId);
    if (activeProfile?.id) {
      updateProfile(activeProfile.id, { theme: themeId });
    }
  };

  // Sync search history changes
  useEffect(() => {
    const updateHistory = () => {
      setSearchHistory(getSearchHistory());
      setFullHistoryCount(getFullSearchHistory().length);
      setHistoryEnabled(isSearchHistoryEnabled());
    };
    window.addEventListener('antigravity:search-history-updated', updateHistory);
    return () => window.removeEventListener('antigravity:search-history-updated', updateHistory);
  }, []);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleClearHistory = () => {
    clearSearchHistory();
    setHistoryNotice('Search history wiped');
    setTimeout(() => setHistoryNotice(null), 2500);
  };

  const handleToggleHistory = () => {
    const next = !historyEnabled;
    setSearchHistoryEnabled(next);
    setHistoryEnabled(next);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50" ref={panelRef}>
      {/* Floating Action Button (FAB) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-3.5 rounded-full shadow-2xl border transition-all duration-300 transform hover:scale-105 active:scale-95 ${
          isOpen
            ? 'rotate-90 bg-black/80 text-white border-white/20'
            : `${themeStyles.buttonPrimary} border-current border-opacity-20`
        }`}
        title="Settings & Appearance"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Settings className="w-5 h-5" />}
      </button>

      {/* Floating Settings Drawer / Flyout */}
      {isOpen && (
        <div
          className={`absolute bottom-16 right-0 w-88 sm:w-[440px] rounded-3xl p-6 border transition-all duration-200 animate-fade-in max-h-[85vh] overflow-y-auto ${themeStyles.dropdown}`}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-current border-opacity-10 mb-5">
            <div>
              <h3 className="text-base font-bold tracking-tight">Reading Environment</h3>
              <p className="text-xs opacity-50">Theme atmospheres & preferences</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full opacity-60 hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Active Reader Profile Section */}
            <div className="p-3.5 rounded-2xl border border-current border-opacity-15 bg-black/5 dark:bg-white/5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-emerald-500/80 shadow-sm shrink-0 bg-zinc-900">
                  <img
                    src={activeProfile?.avatarUrl}
                    alt={activeProfile?.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold">{activeProfile?.name}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-500 font-medium">
                      Active
                    </span>
                  </div>
                  <p className="text-[11px] opacity-50">Multi-user personal shelf</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsOpen(false);
                  window.dispatchEvent(new CustomEvent('antigravity:open-profile-modal'));
                }}
                className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-medium transition-all hover:scale-105 active:scale-95 ${themeStyles.badge} hover:brightness-110 flex items-center gap-1.5`}
              >
                <span>Profiles</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 1. Expanded Theme Selection (36 Distinct Atmospheres) */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <label className="text-xs font-semibold uppercase tracking-wider opacity-60">
                  Atmosphere Palette (36 Themes)
                </label>
                <span className="text-[10px] font-mono opacity-50 capitalize">{theme}</span>
              </div>

              {/* Category Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1.5 mb-2.5">
                {THEME_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setThemeCategory(cat)}
                    className={`text-[11px] font-medium px-2.5 py-1 rounded-full border transition-all flex-shrink-0 ${
                      themeCategory === cat
                        ? 'border-current bg-black/15 dark:bg-white/15 font-semibold shadow-xs'
                        : 'border-current border-opacity-10 opacity-60 hover:opacity-100 hover:border-opacity-30'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Scrollable Theme Grid */}
              <div className="grid grid-cols-2 gap-2 sm:gap-2.5 max-h-72 overflow-y-auto pr-1">
                {filteredThemes.map((t) => {
                  const isActive = theme === t.id;

                  return (
                    <button
                      key={t.id}
                      onClick={() => handleSelectTheme(t.id)}
                      className={`relative flex items-center gap-2.5 p-2.5 rounded-2xl border transition-all text-left ${
                        isActive
                          ? 'border-current bg-black/10 dark:bg-white/10 ring-1 ring-current shadow-sm'
                          : 'border-current border-opacity-10 hover:border-opacity-30 bg-black/5 dark:bg-white/5 opacity-80 hover:opacity-100'
                      }`}
                    >
                      {/* Color Preview Swatch */}
                      <div
                        className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center border border-black/20 shadow-sm"
                        style={{ backgroundColor: t.previewBg }}
                      >
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: t.previewAccent }}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold leading-tight flex items-center justify-between">
                          <span className="truncate">{t.name}</span>
                          {isActive && <Check className="w-3 h-3 flex-shrink-0" />}
                        </div>
                        <span className="text-[10px] opacity-50 truncate block leading-tight mt-0.5">
                          {t.subtext}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Curated Typography System (12 Distinct Reading Typefaces) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold uppercase tracking-wider opacity-60 flex items-center gap-1.5">
                  <Type className="w-3.5 h-3.5" /> Reading Typography
                </label>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-current border-opacity-15 bg-black/5 dark:bg-white/5 opacity-80">
                  {currentFont.typeface} • {currentFont.category}
                </span>
              </div>

              {/* Font Category Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1.5 mb-2.5">
                {FONT_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFontCategory(cat)}
                    className={`text-[11px] font-medium px-2.5 py-1 rounded-full border transition-all flex-shrink-0 ${
                      fontCategory === cat
                        ? 'border-current bg-black/15 dark:bg-white/15 font-semibold shadow-xs'
                        : 'border-current border-opacity-10 opacity-60 hover:opacity-100 hover:border-opacity-30'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Scrollable Font Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                {filteredFonts.map((f) => {
                  const isActive = fontFamily === f.id;
                  return (
                    <button
                      key={f.id}
                      onClick={() => handleSelectFont(f.id)}
                      className={`p-2.5 rounded-2xl border transition-all text-left group relative flex flex-col justify-between ${
                        isActive
                          ? 'border-current bg-black/10 dark:bg-white/10 ring-1 ring-current shadow-sm'
                          : 'border-current border-opacity-10 hover:border-opacity-30 bg-black/5 dark:bg-white/5 opacity-80 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 w-full mb-1">
                        <span className="text-xs font-bold truncate">{f.name}</span>
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-black/10 dark:bg-white/10 opacity-60">
                            {f.tag}
                          </span>
                          {isActive && <Check className="w-3.5 h-3.5 shrink-0" />}
                        </div>
                      </div>

                      <div className="text-[10px] font-mono opacity-50 mb-1.5 truncate">
                        {f.typeface} • {f.category}
                      </div>

                      {/* Live rendered sample text in this typeface */}
                      <div className={`p-2 rounded-xl bg-black/5 dark:bg-white/5 border border-current border-opacity-5 ${f.className}`}>
                        <p className="text-xs leading-snug line-clamp-1 italic opacity-90">
                          "{f.previewQuote}"
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Active Font Specimen Showcase Card */}
              <div className="mt-2.5 p-3 rounded-2xl border border-current border-opacity-15 bg-black/5 dark:bg-white/5">
                <div className="flex items-center justify-between text-[10px] font-mono opacity-50 mb-1">
                  <span>ACTIVE FONT SPECIMEN</span>
                  <span>{currentFont.typeface} ({currentFont.category})</span>
                </div>
                <p className={`text-sm leading-snug ${currentFont.className}`}>
                  "{currentFont.previewQuote}"
                </p>
                <p className="text-[11px] opacity-60 mt-1">
                  {currentFont.description}
                </p>
              </div>
            </div>

            {/* 3. Search History Management Option */}
            <div className="pt-2 border-t border-current border-opacity-10 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold tracking-wide flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 opacity-70" /> Search History
                  </span>
                  <span className="text-[11px] opacity-50 block mt-0.5">
                    Record past 5-7 searches for quick access
                  </span>
                </div>
                <button
                  onClick={handleToggleHistory}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    historyEnabled ? themeStyles.progressColor : 'bg-black/30 dark:bg-white/20'
                  }`}
                  title="Toggle search history recording"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      historyEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Button to open full search history modal with timeframe purging */}
              <button
                onClick={() => setIsHistoryModalOpen(true)}
                className="w-full flex items-center justify-between p-3 rounded-2xl border border-current border-opacity-15 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-all text-xs group"
              >
                <div className="flex items-center gap-2.5">
                  <History className={`w-4 h-4 ${themeStyles.accentText} group-hover:scale-110 transition-transform`} />
                  <div className="text-left">
                    <span className="font-semibold block leading-tight">Full Search History</span>
                    <span className="text-[10px] opacity-50 block mt-0.5">
                      Delete by today, 1 month, 3 months, or all
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 font-mono text-[11px]">
                  <span>{fullHistoryCount}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </button>

              {/* Recent search chips preview in settings */}
              {searchHistory.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {searchHistory.map((item) => (
                      <span
                        key={item}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] border border-current border-opacity-10 bg-black/5 dark:bg-white/5 font-mono"
                      >
                        <span className="truncate max-w-[120px]">{item}</span>
                        <button
                          onClick={() => removeSearchQuery(item)}
                          className="opacity-50 hover:opacity-100 transition-opacity p-0.5"
                          title="Remove item"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={handleClearHistory}
                      className="flex items-center gap-1.5 text-[11px] text-rose-500 hover:text-rose-600 font-medium transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Clear All Search History</span>
                    </button>
                    {historyNotice && (
                      <span className="text-[10px] text-emerald-500 font-mono">
                        {historyNotice}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-[11px] opacity-40 font-mono italic">
                  Search history is currently empty
                </p>
              )}
            </div>

            {/* 4. Reduce Motion Toggle */}
            <div className="pt-2 border-t border-current border-opacity-10">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold tracking-wide block">
                    Reduce Motion
                  </span>
                  <span className="text-[11px] opacity-50 block mt-0.5">
                    Use flat modal instead of 3D flipbook
                  </span>
                </div>
                <button
                  onClick={() => setReduceMotion(!reduceMotion)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    reduceMotion ? themeStyles.progressColor : 'bg-black/30 dark:bg-white/20'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      reduceMotion ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* 5. Multi-Profile Backup & Portability (Export / Import) */}
            <div className="pt-2 border-t border-current border-opacity-10 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold tracking-wide flex items-center gap-1.5">
                    <HardDrive className="w-3.5 h-3.5 text-emerald-500" /> Multi-Profile Portability
                  </span>
                  <span className="text-[11px] opacity-50 block mt-0.5">
                    Backup or transfer all profiles, settings & books at once
                  </span>
                </div>
              </div>

              {/* Feedback Banner */}
              {backupNotice && (
                <div className="px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center gap-2 animate-fade-in">
                  <Check className="w-3.5 h-3.5 shrink-0" />
                  <span>{backupNotice}</span>
                </div>
              )}

              {/* Action Buttons: Export & Import */}
              <div className="grid grid-cols-2 gap-2">
                {/* Export Button */}
                <button
                  type="button"
                  onClick={handleExportAllProfiles}
                  className="p-3 rounded-2xl border text-left flex flex-col justify-between transition-all hover:scale-102 active:scale-98 group border-current border-opacity-15 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10"
                  title="Export all profiles, bookshelves, and preferences into a single JSON file"
                >
                  <div className="flex items-center justify-between w-full mb-1.5">
                    <Download className="w-4 h-4 text-emerald-500 group-hover:translate-y-0.5 transition-transform" />
                    <span className="text-[9px] font-mono opacity-50 px-1.5 py-0.2 rounded bg-black/10 dark:bg-white/10">
                      Export
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-bold block leading-tight">Export All</span>
                    <span className="text-[10px] opacity-50 block mt-0.5">
                      All profiles & settings
                    </span>
                  </div>
                </button>

                {/* Import Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 rounded-2xl border text-left flex flex-col justify-between transition-all hover:scale-102 active:scale-98 group border-current border-opacity-15 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10"
                  title="Import and restore multiple profiles and their settings from a JSON file"
                >
                  <div className="flex items-center justify-between w-full mb-1.5">
                    <Upload className="w-4 h-4 text-sky-400 group-hover:-translate-y-0.5 transition-transform" />
                    <span className="text-[9px] font-mono opacity-50 px-1.5 py-0.2 rounded bg-black/10 dark:bg-white/10">
                      Import
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-bold block leading-tight">Import Backup</span>
                    <span className="text-[10px] opacity-50 block mt-0.5">
                      Restore from JSON file
                    </span>
                  </div>
                </button>

                {/* Hidden file input for import */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".json,application/json"
                  onChange={handleImportAllProfiles}
                  className="hidden"
                />
              </div>
            </div>

            {/* Local Storage & Device Guarantee */}
            <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-current border-opacity-10 flex items-start gap-2.5">
              <Database className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
              <div className="text-[11px]">
                <div className="font-semibold opacity-90 flex items-center gap-1.5">
                  <span>Locally Stored on this PC</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-500 font-bold uppercase">
                    Device Local
                  </span>
                </div>
                <div className="opacity-50 mt-0.5">
                  Profiles, personal bookshelves, and logins are preserved directly on this device in local storage.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search History Vault Modal with Timeframe Deletion */}
      <SearchHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
      />
    </div>
  );
}
