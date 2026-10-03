import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Settings,
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
  ShieldCheck,
  Eye,
} from 'lucide-react';
import { useSettingsStore } from '../store/useSettingsStore';
import { THEME_LIST, getThemeClasses } from '../lib/themeStyles';
import {
  getSearchHistory,
  getFullSearchHistory,
  clearSearchHistory,
  isSearchHistoryEnabled,
  setSearchHistoryEnabled,
} from '../lib/searchHistoryService';
import {
  getActiveProfile,
  updateProfile,
  exportLocalData,
  importLocalData,
} from '../lib/profileService';
import { FONT_LIST, FONT_CATEGORIES, getFontById } from '../lib/fontCatalog';
import SearchHistoryModal from './SearchHistoryModal';

const THEME_CATEGORIES = ['All', 'Paper', 'Dark', 'Warm', 'Light', 'Nature', 'Vibrant'];

export default function SettingsView() {
  const [themeCategory, setThemeCategory] = useState('All');
  const [fontCategory, setFontCategory] = useState('All');
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [searchHistory, setSearchHistory] = useState(() => getSearchHistory());
  const [fullHistoryCount, setFullHistoryCount] = useState(() => getFullSearchHistory().length);
  const [historyEnabled, setHistoryEnabled] = useState(() => isSearchHistoryEnabled());
  const [historyNotice, setHistoryNotice] = useState(null);
  const [backupNotice, setBackupNotice] = useState(null);
  const [activeProfile, setActiveProfile] = useState(() => getActiveProfile());

  const fileInputRef = useRef(null);

  const {
    theme,
    fontFamily,
    reduceMotion,
    setTheme,
    setFontFamily,
    setReduceMotion,
  } = useSettingsStore();

  const themeStyles = getThemeClasses(theme);

  // Filtered themes
  const filteredThemes = useMemo(() => {
    if (themeCategory === 'All') return THEME_LIST;
    return THEME_LIST.filter((t) => t.category === themeCategory);
  }, [themeCategory]);

  // Filtered fonts
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

  const handleClearHistory = () => {
    clearSearchHistory();
    setSearchHistory([]);
    setFullHistoryCount(0);
    setHistoryNotice('Search history wiped');
    setTimeout(() => setHistoryNotice(null), 2500);
  };

  const handleToggleHistory = () => {
    const next = !historyEnabled;
    setSearchHistoryEnabled(next);
    setHistoryEnabled(next);
  };

  const handleExportAllProfiles = () => {
    try {
      const data = exportLocalData();
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `omnidex-sanctum-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setBackupNotice('Sanctum backup exported successfully!');
      setTimeout(() => setBackupNotice(null), 3500);
    } catch {
      setBackupNotice('Export failed');
      setTimeout(() => setBackupNotice(null), 3000);
    }
  };

  const handleImportAllProfiles = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = event.target.result;
        const res = importLocalData(json);
        if (res.success) {
          setBackupNotice('Sanctum restored successfully!');
          window.location.reload();
        } else {
          setBackupNotice(`Import error: ${res.error}`);
        }
      } catch {
        setBackupNotice('Corrupted backup file');
      }
      setTimeout(() => setBackupNotice(null), 3500);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2.5">
            <Settings className="w-7 h-7 opacity-80" />
            <span>Sanctum Ambience & Settings</span>
          </h2>
          <p className="text-xs sm:text-sm opacity-60 mt-1">
            Personalize your reading atmosphere, typography, tactile textures, and privacy preferences.
          </p>
        </div>

        {backupNotice && (
          <div className="glass-card p-3 rounded-2xl border-emerald-500/30 bg-emerald-950/20 text-emerald-300 text-xs font-medium flex items-center gap-2 animate-fade-in">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{backupNotice}</span>
          </div>
        )}
      </div>

      {/* 1. Theme Atmosphere Section */}
      <div className="glass-card p-5 sm:p-6 rounded-3xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/10 text-white">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold">36 Handcrafted Atmospheres</h3>
              <p className="text-xs opacity-60">
                Calibrated across tactile paper, dark, warm, nature, and cyberpunk palettes.
              </p>
            </div>
          </div>

          {/* Theme Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
            {THEME_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setThemeCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                  themeCategory === cat
                    ? 'glass-tab-capsule font-bold text-white shadow-sm'
                    : 'opacity-60 hover:opacity-100 hover:bg-white/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Theme Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-2">
          {filteredThemes.map((t) => {
            const isSelected = theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => handleSelectTheme(t.id)}
                className={`p-3 rounded-2xl border text-left text-xs transition-all flex flex-col justify-between h-24 group ${
                  isSelected
                    ? 'ring-2 ring-current border-current font-bold bg-white/10'
                    : 'border-current border-opacity-15 hover:border-opacity-35 opacity-75 hover:opacity-100 bg-white/5'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span
                    className="w-4 h-4 rounded-full border border-black/20 shadow-xs shrink-0"
                    style={{ backgroundColor: t.previewAccent || '#fff' }}
                  />
                  {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </div>

                <div>
                  <div className="font-semibold text-xs truncate leading-tight">{t.name}</div>
                  <div className="text-[10px] opacity-50 truncate mt-0.5">{t.subtext}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Curated Typography Section */}
      <div className="glass-card p-5 sm:p-6 rounded-3xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/10 text-white">
              <Type className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold">12 Curated Typographic Stacks</h3>
              <p className="text-xs opacity-60">
                Active: <span className="font-semibold">{currentFont?.name || fontFamily}</span> ({currentFont?.category || 'Sans'})
              </p>
            </div>
          </div>

          {/* Font Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
            {FONT_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setFontCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                  fontCategory === cat
                    ? 'glass-tab-capsule font-bold text-white shadow-sm'
                    : 'opacity-60 hover:opacity-100 hover:bg-white/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Font Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
          {filteredFonts.map((f) => {
            const isSelected = fontFamily === f.id;
            return (
              <div
                key={f.id}
                onClick={() => handleSelectFont(f.id)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between h-24 ${
                  isSelected
                    ? 'ring-2 ring-current border-current font-bold bg-white/10'
                    : 'border-current border-opacity-15 hover:border-opacity-35 opacity-75 hover:opacity-100 bg-white/5'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">{f.name}</span>
                  <span className="text-[10px] font-mono opacity-50 px-1.5 py-0.5 rounded bg-white/10">
                    {f.category}
                  </span>
                </div>
                <div className={`text-base truncate opacity-90 ${f.id}`}>
                  The quick brown fox jumps
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Reading Motion & Accessibility */}
      <div className="glass-card p-5 sm:p-6 rounded-3xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-white/10 text-white">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold">Reduce Motion & Skeuomorphic Physics</h3>
            <p className="text-xs opacity-60">
              Disables 3D page flip transitions and ambient background animations for maximum battery and performance.
            </p>
          </div>
        </div>

        <button
          onClick={() => setReduceMotion(!reduceMotion)}
          className={`w-12 h-6.5 rounded-full transition-colors relative p-1 shrink-0 ${
            reduceMotion ? 'bg-emerald-500' : 'bg-black/20 dark:bg-white/20'
          }`}
          title="Toggle reduce motion"
        >
          <div
            className={`w-4.5 h-4.5 rounded-full bg-white transition-transform ${
              reduceMotion ? 'translate-x-5.5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* 4. Search History & Privacy Vault */}
      <div className="glass-card p-5 sm:p-6 rounded-3xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/10 text-white">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold">Search History & Query Telemetry</h3>
              <p className="text-xs opacity-60">
                {fullHistoryCount} total search records stored strictly on this device.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {historyNotice && (
              <span className="text-xs text-rose-400 font-medium animate-fade-in mr-2">
                {historyNotice}
              </span>
            )}

            <button
              onClick={() => setIsHistoryModalOpen(true)}
              className="px-3.5 py-1.5 rounded-full glass-card hover:bg-white/10 text-xs font-semibold"
            >
              Inspect Vault
            </button>

            <button
              onClick={handleClearHistory}
              className="px-3.5 py-1.5 rounded-full bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 text-xs font-semibold"
            >
              Wipe History
            </button>
          </div>
        </div>
      </div>

      {/* 5. Multi-Profile Archive Backup & Local Sovereignty */}
      <div className="glass-card p-5 sm:p-6 rounded-3xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-white/10 text-white">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold">Data Sovereignty & Local Portability</h3>
            <p className="text-xs opacity-60">
              Download your entire reading sanctuary into a portable JSON file or restore from a previous save.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={handleExportAllProfiles}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full glass-card hover:bg-white/10 text-xs font-semibold transition-all active:scale-95"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export Complete Archive</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full glass-card hover:bg-white/10 text-xs font-semibold transition-all active:scale-95"
          >
            <Upload className="w-3.5 h-3.5 text-amber-400" />
            <span>Restore From File</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportAllProfiles}
            accept=".json,application/json"
            className="hidden"
          />
        </div>
      </div>

      {/* History Vault Modal */}
      <SearchHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
      />
    </div>
  );
}
