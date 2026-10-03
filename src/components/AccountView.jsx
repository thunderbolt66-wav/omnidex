import React, { useState, useEffect } from 'react';
import {
  User,
  Plus,
  ShieldCheck,
  Lock,
  Unlock,
  KeyRound,
  Download,
  Upload,
  HardDrive,
  Palette,
  Check,
  ChevronRight,
  Sparkles,
  Settings2,
  RefreshCw,
  Sliders,
} from 'lucide-react';
import {
  getProfiles,
  getActiveProfile,
  getActiveProfileId,
  switchActiveProfile,
  verifyProfilePin,
  exportLocalData,
  importLocalData,
  getLocalStorageDiagnostics,
} from '../lib/profileService';
import { THEME_LIST, getThemeClasses } from '../lib/themeStyles';
import { resolveAvatarUrl } from '../lib/profileAvatars';
import { useSettingsStore } from '../store/useSettingsStore';

export default function AccountView({ onOpenFullProfileModal }) {
  const [profiles, setProfiles] = useState(() => getProfiles());
  const [activeProfile, setActiveProfile] = useState(() => getActiveProfile());
  const [activeId, setActiveId] = useState(() => getActiveProfileId());
  const [diagnostics, setDiagnostics] = useState(() => getLocalStorageDiagnostics());
  const [pinChallengeProfile, setPinChallengeProfile] = useState(null);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [backupNotice, setBackupNotice] = useState(null);

  const fileInputRef = React.useRef(null);
  const theme = useSettingsStore((state) => state.theme);
  const setTheme = useSettingsStore((state) => state.setTheme);
  const themeStyles = getThemeClasses(theme);

  // Sync profile state on updates
  useEffect(() => {
    const handleUpdate = () => {
      setProfiles(getProfiles());
      setActiveProfile(getActiveProfile());
      setActiveId(getActiveProfileId());
      setDiagnostics(getLocalStorageDiagnostics());
    };

    window.addEventListener('antigravity:profile-switched', handleUpdate);
    window.addEventListener('antigravity:profiles-updated', handleUpdate);
    return () => {
      window.removeEventListener('antigravity:profile-switched', handleUpdate);
      window.removeEventListener('antigravity:profiles-updated', handleUpdate);
    };
  }, []);

  // Handle switching to a profile
  const handleSelectProfile = (profile) => {
    if (profile.id === activeId) return;

    if (profile.hasPin) {
      setPinChallengeProfile(profile);
      setEnteredPin('');
      setPinError('');
    } else {
      switchActiveProfile(profile.id);
    }
  };

  // Verify PIN submission
  const handleVerifyPin = (e) => {
    e.preventDefault();
    if (!pinChallengeProfile) return;

    if (!enteredPin || enteredPin.length !== 4) {
      setPinError('Please enter a 4-digit PIN');
      return;
    }

    const isValid = verifyProfilePin(pinChallengeProfile.id, enteredPin);
    if (isValid) {
      switchActiveProfile(pinChallengeProfile.id);
      setPinChallengeProfile(null);
      setEnteredPin('');
      setPinError('');
    } else {
      setPinError('Incorrect PIN. Access denied.');
    }
  };

  // Export JSON backup
  const handleExportBackup = () => {
    try {
      const dataStr = exportLocalData();
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `omnidex-sanctum-backup-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
      setBackupNotice('Sanctum backup exported successfully!');
      setTimeout(() => setBackupNotice(null), 3500);
    } catch (err) {
      setBackupNotice('Failed to export backup.');
    }
  };

  // Import JSON backup
  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = event.target.result;
        const res = importLocalData(json);
        if (res.success) {
          setBackupNotice('Library restored successfully!');
          setProfiles(getProfiles());
          setActiveProfile(getActiveProfile());
          setActiveId(getActiveProfileId());
          setDiagnostics(getLocalStorageDiagnostics());
        } else {
          setBackupNotice(`Import error: ${res.error}`);
        }
      } catch (err) {
        setBackupNotice('Malformed JSON file.');
      }
      setTimeout(() => setBackupNotice(null), 4000);
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
            <User className="w-7 h-7 opacity-80" />
            <span>Reader Profiles & Account</span>
          </h2>
          <p className="text-xs sm:text-sm opacity-60 mt-1">
            Seamlessly switch between reading personas, manage security PINs, and backup your library.
          </p>
        </div>

        {onOpenFullProfileModal && (
          <button
            onClick={onOpenFullProfileModal}
            className="flex items-center gap-2 px-4 py-2 rounded-full glass-card hover:bg-white/10 text-xs font-semibold transition-all active:scale-95 w-fit"
          >
            <Settings2 className="w-4 h-4" />
            <span>Advanced Manager</span>
          </button>
        )}
      </div>

      {backupNotice && (
        <div className="glass-card p-3.5 rounded-2xl border-emerald-500/30 bg-emerald-950/20 text-emerald-300 text-xs font-medium flex items-center gap-2 animate-fade-in">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{backupNotice}</span>
        </div>
      )}

      {/* Active Profile Highlight Card */}
      <div className="glass-card p-6 rounded-3xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-emerald-500/80 shadow-lg shrink-0 bg-zinc-950">
              <img
                src={resolveAvatarUrl(activeProfile?.avatarUrl || activeProfile?.avatar)}
                alt={activeProfile?.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Active Persona
                </span>
                {activeProfile?.hasPin && (
                  <span className="text-[11px] font-mono text-amber-400 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> PIN Locked
                  </span>
                )}
              </div>
              <h3 className="text-xl sm:text-2xl font-bold">{activeProfile?.name}</h3>
              <p className="text-xs opacity-60">
                Created {new Date(activeProfile?.createdAt || Date.now()).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenFullProfileModal}
              className="px-4 py-2 rounded-full glass-card hover:bg-white/10 text-xs font-semibold transition-all active:scale-95"
            >
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* Switch Reader Personas Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider opacity-70">
            Switch Reader Profile
          </h3>
          <span className="text-xs opacity-50 font-mono">{profiles.length} profiles</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {profiles.map((p) => {
            const isCurrent = p.id === activeId;
            return (
              <div
                key={p.id}
                onClick={() => handleSelectProfile(p)}
                className={`glass-card p-4 rounded-2xl cursor-pointer transition-all duration-200 flex items-center justify-between gap-3 ${
                  isCurrent
                    ? 'ring-2 ring-emerald-500/70 border-emerald-500/40 bg-white/10'
                    : 'hover:scale-[1.02] active:scale-[0.98]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-xl overflow-hidden border border-white/15 shrink-0 bg-zinc-900">
                    <img
                      src={resolveAvatarUrl(p.avatarUrl || p.avatar)}
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate flex items-center gap-1.5">
                      <span>{p.name}</span>
                      {p.hasPin && <Lock className="w-3 h-3 text-amber-400 shrink-0" />}
                    </div>
                    <div className="text-[11px] opacity-50 truncate">
                      {isCurrent ? 'Currently Active' : 'Tap to switch'}
                    </div>
                  </div>
                </div>

                {isCurrent ? (
                  <div className="w-6 h-6 rounded-full bg-emerald-500 text-zinc-950 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                ) : (
                  <ChevronRight className="w-4 h-4 opacity-40 shrink-0" />
                )}
              </div>
            );
          })}

          {/* Create New Profile Button */}
          <button
            onClick={onOpenFullProfileModal}
            className="glass-card p-4 rounded-2xl border-dashed border-white/20 hover:border-white/40 flex items-center justify-center gap-2 text-xs font-semibold opacity-70 hover:opacity-100 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Persona</span>
          </button>
        </div>
      </div>

      {/* PIN Unlock Challenge Overlay */}
      {pinChallengeProfile && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel p-6 sm:p-7 rounded-3xl max-w-sm w-full space-y-4 animate-scale-in">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
                <Lock className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold">Security PIN Required</h4>
              <p className="text-xs opacity-60">
                Enter the 4-digit PIN for <span className="font-semibold">{pinChallengeProfile.name}</span>.
              </p>
            </div>

            <form onSubmit={handleVerifyPin} className="space-y-4">
              <input
                type="password"
                maxLength={4}
                autoFocus
                value={enteredPin}
                onChange={(e) => setEnteredPin(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                className="w-full text-center text-2xl tracking-[0.5em] font-mono glass-input rounded-2xl py-3 text-white focus:outline-none"
              />

              {pinError && <p className="text-xs text-rose-400 text-center font-medium">{pinError}</p>}

              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setPinChallengeProfile(null)}
                  className="flex-1 py-2.5 rounded-full glass-card hover:bg-white/10 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs shadow-md"
                >
                  Unlock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Local-First Data Sovereignty & Diagnostics */}
      <div className="glass-card p-5 sm:p-6 rounded-3xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <HardDrive className="w-5 h-5 opacity-70" />
            <div>
              <h3 className="text-sm font-bold">Local-First Vault & Data Backup</h3>
              <p className="text-xs opacity-60">
                Your data lives 100% inside your browser storage. Export or restore at any time.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono opacity-50 hidden sm:inline">
            {diagnostics.approximateKb} KB used
          </span>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={handleExportBackup}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full glass-card hover:bg-white/10 text-xs font-medium transition-all active:scale-95"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export JSON Archive</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full glass-card hover:bg-white/10 text-xs font-medium transition-all active:scale-95"
          >
            <Upload className="w-3.5 h-3.5 text-amber-400" />
            <span>Restore From Backup</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportFile}
            accept=".json,application/json"
            className="hidden"
          />
        </div>
      </div>

      {/* Theme Quick Switcher */}
      <div className="glass-card p-5 sm:p-6 rounded-3xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Palette className="w-5 h-5 opacity-70" />
            <div>
              <h3 className="text-sm font-bold">Visual Ambience & Atmosphere</h3>
              <p className="text-xs opacity-60">
                Select from 36 tactile paper, dark, and futuristic themes.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono uppercase px-2.5 py-0.5 rounded-full bg-white/10 opacity-70">
            {theme}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5 pt-2">
          {THEME_LIST.slice(0, 12).map((t) => {
            const isSelected = theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`p-2.5 rounded-xl border text-left text-xs transition-all flex flex-col justify-between h-20 ${
                  isSelected
                    ? 'ring-2 ring-white/60 border-white/40 font-bold bg-white/10'
                    : 'border-white/10 hover:border-white/20 opacity-70 hover:opacity-100 bg-white/5'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0"
                    style={{ backgroundColor: t.previewAccent || '#fff' }}
                  />
                  {isSelected && <Check className="w-3 h-3 text-emerald-400" />}
                </div>
                <div className="truncate font-medium text-[11px]">{t.name}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
