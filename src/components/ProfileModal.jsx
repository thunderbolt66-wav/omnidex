import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  User,
  Plus,
  Pencil,
  Trash2,
  Check,
  Sparkles,
  ChevronLeft,
  AlertTriangle,
  Palette,
  BookOpen,
  Type,
  Image,
  Camera,
  Lock,
  Unlock,
  KeyRound,
  Download,
  Upload,
  HardDrive,
  ShieldCheck,
} from 'lucide-react';
import { useSettingsStore } from '../store/useSettingsStore';
import { THEME_LIST, getThemeClasses } from '../lib/themeStyles';
import { PRESET_AVATARS, resolveAvatarUrl, processCustomAvatarFile } from '../lib/profileAvatars';
import { FONT_LIST, FONT_CATEGORIES, getFontById } from '../lib/fontCatalog';
import {
  getProfiles,
  getActiveProfileId,
  switchActiveProfile,
  createProfile,
  updateProfile,
  deleteProfile,
  verifyProfilePin,
  setProfilePin,
  removeProfilePin,
  exportLocalData,
  importLocalData,
  getLocalStorageDiagnostics,
} from '../lib/profileService';

export default function ProfileModal({ isOpen, onClose }) {
  const [profiles, setProfiles] = useState(() => getProfiles());
  const [activeId, setActiveId] = useState(() => getActiveProfileId());
  const [viewMode, setViewMode] = useState('SELECT'); // 'SELECT' | 'MANAGE' | 'CREATE' | 'EDIT' | 'PIN_LOGIN'
  const [editingProfile, setEditingProfile] = useState(null);

  // Form states for Create / Edit
  const [formName, setFormName] = useState('');
  const [formAvatar, setFormAvatar] = useState(PRESET_AVATARS[0].id);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [formTheme, setFormTheme] = useState('dark');
  const [formFont, setFormFont] = useState('font-sans');
  const [formFontCategory, setFormFontCategory] = useState('All');
  const [formEnablePin, setFormEnablePin] = useState(false);
  const [formPin, setFormPin] = useState('');
  const [formError, setFormError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  // PIN login challenge state
  const [pinTarget, setPinTarget] = useState(null);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [isVerifyingPin, setIsVerifyingPin] = useState(false);

  // Backup & Storage notification
  const [backupNotice, setBackupNotice] = useState(null);
  const [diagnostics, setDiagnostics] = useState(() => getLocalStorageDiagnostics());
  const fileInputRef = useRef(null);
  const avatarFileInputRef = useRef(null);

  const theme = useSettingsStore((state) => state.theme);
  const themeStyles = getThemeClasses(theme);

  // Sync state when modal opens or profiles change
  useEffect(() => {
    if (isOpen) {
      setProfiles(getProfiles());
      setActiveId(getActiveProfileId());
      setViewMode('SELECT');
      setEditingProfile(null);
      setPinTarget(null);
      setEnteredPin('');
      setPinError('');
      setConfirmDelete(false);
      setFormError('');
      setBackupNotice(null);
      setDiagnostics(getLocalStorageDiagnostics());
    }
  }, [isOpen]);

  // Global profiles listener
  useEffect(() => {
    const handleProfilesUpdated = () => {
      setProfiles(getProfiles());
      setActiveId(getActiveProfileId());
      setDiagnostics(getLocalStorageDiagnostics());
    };
    window.addEventListener('antigravity:profiles-updated', handleProfilesUpdated);
    window.addEventListener('antigravity:profile-switched', handleProfilesUpdated);
    return () => {
      window.removeEventListener('antigravity:profiles-updated', handleProfilesUpdated);
      window.removeEventListener('antigravity:profile-switched', handleProfilesUpdated);
    };
  }, []);

  // Keyboard navigation: Escape key closes modal or returns to SELECT
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (viewMode === 'CREATE' || viewMode === 'EDIT' || viewMode === 'PIN_LOGIN') {
          setViewMode('SELECT');
          setEditingProfile(null);
          setPinTarget(null);
        } else if (viewMode === 'MANAGE') {
          setViewMode('SELECT');
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, viewMode, onClose]);

  if (!isOpen) return null;

  // Handle switching active profile (with PIN verification if locked)
  const handleSelectProfile = async (profile) => {
    if (viewMode === 'MANAGE') {
      if (profile.isLocked) {
        // Must verify PIN before editing locked profile
        setPinTarget({ ...profile, intent: 'edit' });
        setEnteredPin('');
        setPinError('');
        setViewMode('PIN_LOGIN');
      } else {
        handleStartEdit(profile);
      }
      return;
    }

    // Normal switch intent
    if (profile.isLocked) {
      setPinTarget({ ...profile, intent: 'switch' });
      setEnteredPin('');
      setPinError('');
      setViewMode('PIN_LOGIN');
      return;
    }

    switchActiveProfile(profile.id);
    setActiveId(profile.id);
    onClose();
  };

  // Verify PIN submission
  const handlePinSubmit = async (pinValue = enteredPin) => {
    if (!pinTarget || pinValue.length !== 4) return;
    setIsVerifyingPin(true);
    setPinError('');

    try {
      const isValid = await verifyProfilePin(pinTarget.id, pinValue);
      if (isValid) {
        if (pinTarget.intent === 'edit') {
          handleStartEdit(pinTarget);
        } else {
          switchActiveProfile(pinTarget.id);
          setActiveId(pinTarget.id);
          onClose();
        }
      } else {
        setPinError('Incorrect 4-digit PIN. Try again.');
        setEnteredPin('');
      }
    } catch {
      setPinError('Verification error.');
    } finally {
      setIsVerifyingPin(false);
    }
  };

  // Keypad click handler for PIN
  const handleKeypadPress = (num) => {
    if (enteredPin.length < 4) {
      const nextPin = enteredPin + String(num);
      setEnteredPin(nextPin);
      if (nextPin.length === 4) {
        handlePinSubmit(nextPin);
      }
    }
  };

  const handleKeypadBackspace = () => {
    setEnteredPin((prev) => prev.slice(0, -1));
    if (pinError) setPinError('');
  };

  const handleKeypadClear = () => {
    setEnteredPin('');
    if (pinError) setPinError('');
  };

  // Handle local avatar photo upload from user's device
  const handleAvatarFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    setFormError('');
    try {
      const dataUrl = await processCustomAvatarFile(file, 256);
      setCustomAvatarUrl(dataUrl);
      setFormAvatar(dataUrl);
    } catch (err) {
      setFormError(err.message || 'Failed to process selected photo.');
    } finally {
      setIsUploadingAvatar(false);
      if (avatarFileInputRef.current) {
        avatarFileInputRef.current.value = '';
      }
    }
  };

  // Start creating new profile
  const handleStartCreate = () => {
    const defaultAvatar = PRESET_AVATARS[0].id;
    setFormName('');
    setFormAvatar(defaultAvatar);
    setCustomAvatarUrl('');
    setFormTheme(theme || 'dark');
    setFormFont('font-sans');
    setFormEnablePin(false);
    setFormPin('');
    setFormError('');
    setViewMode('CREATE');
  };

  // Start editing existing profile
  const handleStartEdit = (profile) => {
    if (!profile) return;
    setEditingProfile(profile);
    setFormName(profile.name || '');
    setFormAvatar(profile.avatar || PRESET_AVATARS[0].id);
    const isCustom =
      profile.avatar?.startsWith('http') || profile.avatar?.startsWith('data:');
    setCustomAvatarUrl(isCustom ? profile.avatar : '');
    setFormTheme(profile.theme || 'dark');
    setFormFont(profile.fontFamily || 'font-sans');
    setFormEnablePin(Boolean(profile.isLocked));
    setFormPin('');
    setConfirmDelete(false);
    setFormError('');
    setViewMode('EDIT');
  };

  // Save new profile
  const handleSaveCreate = async (e) => {
    e.preventDefault();
    const trimmed = formName.trim();
    if (!trimmed) {
      setFormError('Please enter a reader name.');
      return;
    }
    if (formEnablePin && formPin.trim().length !== 4) {
      setFormError('PIN must be exactly 4 numeric digits.');
      return;
    }

    const chosenAvatar = customAvatarUrl.trim() || formAvatar;
    const newProf = createProfile({
      name: trimmed,
      avatar: chosenAvatar,
      theme: formTheme,
      fontFamily: formFont,
      pin: formEnablePin ? formPin.trim() : '',
    });

    switchActiveProfile(newProf.id);
    setActiveId(newProf.id);
    onClose();
  };

  // Save edits to existing profile
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingProfile) return;
    const trimmed = formName.trim();
    if (!trimmed) {
      setFormError('Please enter a reader name.');
      return;
    }

    if (formEnablePin && formPin && formPin.trim().length !== 4) {
      setFormError('New PIN must be exactly 4 numeric digits.');
      return;
    }

    const chosenAvatar = customAvatarUrl.trim() || formAvatar;
    updateProfile(editingProfile.id, {
      name: trimmed,
      avatar: chosenAvatar,
      theme: formTheme,
      fontFamily: formFont,
    });

    // Update PIN settings if modified
    if (!formEnablePin && editingProfile.isLocked) {
      await removeProfilePin(editingProfile.id);
    } else if (formEnablePin && formPin) {
      await setProfilePin(editingProfile.id, formPin.trim());
    }

    setViewMode('MANAGE');
    setEditingProfile(null);
  };

  // Delete profile
  const handleDeleteProfile = () => {
    if (!editingProfile) return;
    if (profiles.length <= 1) {
      setFormError('You must keep at least one profile.');
      return;
    }
    const res = deleteProfile(editingProfile.id);
    if (!res.success) {
      setFormError(res.message);
      return;
    }
    setViewMode('MANAGE');
    setEditingProfile(null);
  };

  // One-click Local Backup Export
  const handleExportBackup = () => {
    try {
      const data = exportLocalData();
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `omnidex-local-profiles-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setBackupNotice('Local backup exported to PC!');
      setTimeout(() => setBackupNotice(null), 3500);
    } catch (e) {
      console.error('Export error:', e);
      setBackupNotice('Export failed');
      setTimeout(() => setBackupNotice(null), 3000);
    }
  };

  // Local Backup Import
  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result;
        const res = importLocalData(content);
        if (res.success) {
          setBackupNotice(`Restored ${res.count} profiles locally!`);
          setProfiles(getProfiles());
          setActiveId(getActiveProfileId());
        } else {
          setBackupNotice(`Restore error: ${res.message}`);
        }
      } catch (err) {
        setBackupNotice('Corrupted backup file');
      }
      setTimeout(() => setBackupNotice(null), 4000);
    };
    reader.readAsText(file);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden transition-all duration-300 max-h-[92vh] flex flex-col ${themeStyles.card}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className={`px-6 py-5 border-b flex items-center justify-between ${themeStyles.header}`}>
          <div className="flex items-center gap-3">
            {(viewMode === 'CREATE' || viewMode === 'EDIT' || viewMode === 'PIN_LOGIN') && (
              <button
                onClick={() => {
                  setViewMode(viewMode === 'EDIT' ? 'MANAGE' : 'SELECT');
                  setEditingProfile(null);
                  setPinTarget(null);
                }}
                className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                title="Back to profiles"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                {viewMode === 'SELECT' && "Who's reading?"}
                {viewMode === 'MANAGE' && 'Edit profiles'}
                {viewMode === 'CREATE' && 'Create Profile'}
                {viewMode === 'EDIT' && `Edit Profile: ${editingProfile?.name || ''}`}
                {viewMode === 'PIN_LOGIN' && 'Profile Lock'}
              </h2>
              <p className="text-xs opacity-60">
                {viewMode === 'SELECT' && 'All profiles & reading progress are stored locally on this PC.'}
                {viewMode === 'MANAGE' && 'Select a profile to customize avatar, PIN lock, or theme.'}
                {viewMode === 'CREATE' && 'Add an independent reader with personal bookshelf & preferences.'}
                {viewMode === 'EDIT' && 'Personalize avatar, security PIN, and atmosphere.'}
                {viewMode === 'PIN_LOGIN' && `Enter 4-digit PIN for ${pinTarget?.name || 'Reader'}.`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors opacity-70 hover:opacity-100"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6">
          {/* Notification banner for backup/restore */}
          {backupNotice && (
            <div className="px-4 py-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center justify-between animate-fade-in font-mono">
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>{backupNotice}</span>
              </span>
            </div>
          )}

          {/* VIEW: SELECT or MANAGE Profiles Row (Matching Disney+/Netflix screenshot) */}
          {(viewMode === 'SELECT' || viewMode === 'MANAGE') && (
            <div className="py-4">
              <div className="flex flex-wrap justify-center items-start gap-6 sm:gap-10">
                {profiles.map((profile) => {
                  const isActive = profile.id === activeId;
                  const isEdit = viewMode === 'MANAGE';
                  const avatarSrc = resolveAvatarUrl(profile.avatar);

                  return (
                    <div
                      key={profile.id}
                      className="group flex flex-col items-center gap-3 cursor-pointer"
                      onClick={() => handleSelectProfile(profile)}
                    >
                      {/* Avatar Circle Frame */}
                      <div className="relative">
                        <div
                          className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden transition-all duration-300 transform group-hover:scale-105 active:scale-95 shadow-xl flex items-center justify-center bg-zinc-900 border-2 ${
                            isActive && !isEdit
                              ? 'border-emerald-500 ring-4 ring-emerald-500/30'
                              : isEdit
                              ? 'border-white/40 group-hover:border-white'
                              : 'border-white/10 group-hover:border-white/50'
                          }`}
                        >
                          <img
                            src={avatarSrc}
                            alt={profile.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            loading="lazy"
                          />
                        </div>

                        {/* Active Profile Checkmark in normal mode */}
                        {isActive && !isEdit && (
                          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg border-2 border-zinc-900">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}

                        {/* PIN Lock Badge if profile is password protected */}
                        {profile.isLocked && !isEdit && (
                          <div
                            className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-zinc-900/90 text-amber-400 flex items-center justify-center shadow-lg border border-amber-400/40"
                            title="Protected with 4-digit PIN lock"
                          >
                            <Lock className="w-3 h-3" />
                          </div>
                        )}

                        {/* White Circular Badge with Pencil Icon in Edit Mode (Matches reference screenshot!) */}
                        {isEdit && (
                          <div
                            className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white text-zinc-950 shadow-xl flex items-center justify-center border-2 border-zinc-900 transform transition-transform group-hover:scale-110"
                            title="Edit this profile"
                          >
                            <Pencil className="w-4 h-4 stroke-[2.5]" />
                          </div>
                        )}
                      </div>

                      {/* Profile Name & Tag */}
                      <div className="text-center space-y-0.5">
                        <p
                          className={`text-sm sm:text-base font-semibold transition-colors duration-200 flex items-center justify-center gap-1.5 ${
                            isActive && !isEdit
                              ? 'text-emerald-400'
                              : 'opacity-90 group-hover:opacity-100 group-hover:text-current'
                          }`}
                        >
                          <span>{profile.name}</span>
                          {profile.isLocked && (
                            <Lock className="w-3 h-3 opacity-60 shrink-0" />
                          )}
                        </p>
                        {isActive && !isEdit && (
                          <span className="inline-block text-[10px] font-mono tracking-widest uppercase opacity-60">
                            Active
                          </span>
                        )}
                        {isEdit && (
                          <span className="inline-block text-[10px] font-mono tracking-widest uppercase opacity-40 group-hover:opacity-80">
                            Tap to edit
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* + Add Profile Button (Circular) */}
                <div
                  className="group flex flex-col items-center gap-3 cursor-pointer"
                  onClick={handleStartCreate}
                >
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-dashed border-current border-opacity-30 group-hover:border-opacity-90 transition-all duration-300 transform group-hover:scale-105 active:scale-95 flex items-center justify-center bg-black/5 dark:bg-white/5 group-hover:bg-black/10 dark:group-hover:bg-white/10 shadow-sm">
                    <Plus className="w-9 h-9 opacity-50 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm sm:text-base font-medium opacity-70 group-hover:opacity-100">
                      Add profile
                    </p>
                    <span className="inline-block text-[10px] font-mono tracking-widest uppercase opacity-40">
                      New Reader
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: PIN LOGIN CHALLENGE */}
          {viewMode === 'PIN_LOGIN' && pinTarget && (
            <div className="py-6 max-w-sm mx-auto text-center space-y-6 animate-fade-in">
              {/* Target Profile Avatar */}
              <div className="flex flex-col items-center gap-3">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-amber-500 shadow-xl bg-zinc-900">
                  <img
                    src={resolveAvatarUrl(pinTarget.avatar)}
                    alt={pinTarget.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-bold">{pinTarget.name}</h3>
                  <p className="text-xs opacity-60 flex items-center justify-center gap-1 mt-0.5">
                    <Lock className="w-3 h-3 text-amber-500" />
                    <span>Enter 4-digit Profile PIN</span>
                  </p>
                </div>
              </div>

              {/* Error Notice */}
              {pinError && (
                <div className="px-3.5 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono">
                  {pinError}
                </div>
              )}

              {/* 4 Digit Dots Indicator */}
              <div className="flex justify-center gap-4 py-2">
                {[0, 1, 2, 3].map((index) => {
                  const isFilled = index < enteredPin.length;
                  return (
                    <div
                      key={index}
                      className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                        isFilled
                          ? 'bg-amber-400 border-amber-400 scale-125 shadow-md shadow-amber-500/40'
                          : 'border-current border-opacity-30 bg-transparent'
                      }`}
                    />
                  );
                })}
              </div>

              {/* Numeric Keypad */}
              <div className="grid grid-cols-3 gap-3 max-w-[240px] mx-auto pt-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleKeypadPress(num)}
                    disabled={isVerifyingPin}
                    className="h-12 rounded-2xl border border-current border-opacity-15 bg-black/5 dark:bg-white/5 hover:bg-black/15 dark:hover:bg-white/15 text-lg font-bold font-mono transition-all active:scale-90"
                  >
                    {num}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleKeypadClear}
                  className="h-12 rounded-2xl border border-current border-opacity-10 text-xs font-mono opacity-60 hover:opacity-100 transition-all active:scale-90"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => handleKeypadPress(0)}
                  disabled={isVerifyingPin}
                  className="h-12 rounded-2xl border border-current border-opacity-15 bg-black/5 dark:bg-white/5 hover:bg-black/15 dark:hover:bg-white/15 text-lg font-bold font-mono transition-all active:scale-90"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={handleKeypadBackspace}
                  className="h-12 rounded-2xl border border-current border-opacity-10 text-xs font-mono opacity-60 hover:opacity-100 transition-all active:scale-90"
                >
                  ⌫
                </button>
              </div>

              {/* Cancel Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('SELECT');
                    setPinTarget(null);
                  }}
                  className="text-xs opacity-60 hover:opacity-100 underline decoration-dotted transition-opacity"
                >
                  Cancel & Switch to another profile
                </button>
              </div>
            </div>
          )}

          {/* VIEW: CREATE or EDIT Profile Form */}
          {(viewMode === 'CREATE' || viewMode === 'EDIT') && (
            <form
              onSubmit={viewMode === 'CREATE' ? handleSaveCreate : handleSaveEdit}
              className="space-y-6"
            >
              {/* Error notice */}
              {formError && (
                <div className="px-4 py-2.5 rounded-xl text-xs bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Avatar Preview & Selection */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-mono uppercase tracking-wider opacity-60">
                    Select Reader Avatar
                  </label>
                  {customAvatarUrl && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
                      Custom Avatar Active
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                  {/* Current Selected Big Circle Preview with Click-to-Upload Overlay */}
                  <div
                    onClick={() => avatarFileInputRef.current?.click()}
                    className="relative group cursor-pointer w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-emerald-500/60 shadow-xl bg-zinc-900 shrink-0 transition-transform hover:scale-105 active:scale-95"
                    title="Click to upload custom photo from device"
                  >
                    <img
                      src={resolveAvatarUrl(customAvatarUrl.trim() || formAvatar)}
                      alt="Avatar preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-medium p-1 text-center">
                      <Camera className="w-5 h-5 mb-1" />
                      <span>Upload Photo</span>
                    </div>
                  </div>

                  {/* Device File Upload & Presets */}
                  <div className="flex-1 w-full space-y-3">
                    {/* Device Upload Button */}
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => avatarFileInputRef.current?.click()}
                        disabled={isUploadingAvatar}
                        className={`px-3.5 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-2 transition-all shadow-sm hover:scale-105 active:scale-95 ${
                          customAvatarUrl
                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 font-semibold'
                            : 'border-current border-opacity-25 hover:border-opacity-60 bg-black/5 dark:bg-white/5'
                        }`}
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>{isUploadingAvatar ? 'Processing image...' : 'Upload Photo from Device'}</span>
                      </button>

                      <input
                        type="file"
                        ref={avatarFileInputRef}
                        accept="image/png,image/jpeg,image/webp,image/gif"
                        onChange={handleAvatarFileUpload}
                        className="hidden"
                      />

                      {customAvatarUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            setCustomAvatarUrl('');
                            setFormAvatar(PRESET_AVATARS[0].id);
                          }}
                          className="px-2.5 py-1.5 rounded-xl border border-rose-500/30 text-rose-400 bg-rose-500/10 text-xs hover:bg-rose-500/20 transition-colors"
                        >
                          Use Preset
                        </button>
                      )}
                    </div>

                    {/* Presets Grid (24 Iconic Reader Archetypes) */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-[11px] opacity-60">
                          Or choose from 24 character archetypes:
                        </p>
                        <span className="text-[10px] font-mono opacity-50">
                          {PRESET_AVATARS.length} avatars
                        </span>
                      </div>
                      <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 p-2.5 rounded-2xl border border-current border-opacity-10 bg-black/5 dark:bg-white/5 max-h-48 overflow-y-auto no-scrollbar">
                        {PRESET_AVATARS.map((preset) => {
                          const isSelected = formAvatar === preset.id && !customAvatarUrl;
                          return (
                            <button
                              type="button"
                              key={preset.id}
                              onClick={() => {
                                setFormAvatar(preset.id);
                                setCustomAvatarUrl('');
                              }}
                              className={`w-9 h-9 sm:w-10 sm:h-10 mx-auto rounded-full overflow-hidden border-2 transition-all p-0.5 transform hover:scale-110 active:scale-95 ${
                                isSelected
                                  ? 'border-emerald-500 scale-110 shadow-md ring-2 ring-emerald-500/40'
                                  : 'border-white/10 hover:border-white/40 opacity-75 hover:opacity-100'
                              }`}
                              title={`${preset.name} (${preset.character})`}
                            >
                              <img
                                src={preset.svg}
                                alt={preset.name}
                                className="w-full h-full rounded-full object-cover"
                              />
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Optional URL input */}
                    <div className="pt-1">
                      <input
                        type="url"
                        value={customAvatarUrl.startsWith('data:') ? '' : customAvatarUrl}
                        onChange={(e) => {
                          setCustomAvatarUrl(e.target.value);
                          if (e.target.value) setFormAvatar(e.target.value);
                        }}
                        placeholder="Or paste an image web link (https://...)"
                        className="w-full px-3 py-1.5 rounded-xl border text-xs bg-black/10 dark:bg-white/5 border-current border-opacity-15 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Reader Name */}
              <div className="space-y-2">
                <label className="block text-xs font-mono uppercase tracking-wider opacity-60">
                  Reader Name
                </label>
                <input
                  type="text"
                  required
                  maxLength={30}
                  value={formName}
                  onChange={(e) => {
                    setFormName(e.target.value);
                    if (formError) setFormError('');
                  }}
                  placeholder="e.g. Maya, Chris, Dave"
                  className="w-full px-4 py-2.5 rounded-xl border text-sm bg-black/10 dark:bg-white/5 border-current border-opacity-20 focus:outline-none focus:border-emerald-500 transition-colors"
                  autoFocus
                />
              </div>

              {/* Local PIN Lock Setting */}
              <div className="p-4 rounded-2xl border border-current border-opacity-15 bg-black/5 dark:bg-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-amber-500" />
                    <div>
                      <p className="text-xs font-semibold">Local Profile PIN Lock</p>
                      <p className="text-[11px] opacity-50">
                        Require a 4-digit PIN to open this profile on this device
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    id="enablePin"
                    checked={formEnablePin}
                    onChange={(e) => {
                      setFormEnablePin(e.target.checked);
                      if (!e.target.checked) setFormPin('');
                    }}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 border-gray-300 cursor-pointer"
                  />
                </div>

                {formEnablePin && (
                  <div className="pt-2 animate-fade-in space-y-1.5">
                    <label className="block text-[11px] font-mono uppercase opacity-60">
                      {viewMode === 'EDIT' && editingProfile?.isLocked
                        ? 'New 4-Digit PIN (leave blank to keep current):'
                        : 'Set 4-Digit PIN:'}
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      pattern="[0-9]*"
                      inputMode="numeric"
                      value={formPin}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                        setFormPin(val);
                        if (formError) setFormError('');
                      }}
                      placeholder="••••"
                      className="w-32 px-3 py-1.5 text-center text-lg tracking-widest font-mono rounded-xl border bg-black/10 dark:bg-white/5 border-current border-opacity-20 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                )}
              </div>

              {/* Personal Atmosphere / Theme Preference */}
              <div className="space-y-2">
                <label className="block text-xs font-mono uppercase tracking-wider opacity-60 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5" />
                  <span>Favorite Reading Atmosphere</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-36 overflow-y-auto pr-1">
                  {THEME_LIST.slice(0, 16).map((thm) => {
                    const isSelected = formTheme === thm.id;
                    return (
                      <button
                        type="button"
                        key={thm.id}
                        onClick={() => setFormTheme(thm.id)}
                        className={`px-3 py-2 rounded-xl text-left text-xs border transition-all flex items-center justify-between ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-500/10 font-semibold'
                            : 'border-current border-opacity-15 hover:border-opacity-30 bg-black/5 dark:bg-white/5'
                        }`}
                      >
                        <span className="truncate">{thm.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Typography Preference */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-mono uppercase tracking-wider opacity-60 flex items-center gap-1.5">
                    <Type className="w-3.5 h-3.5" />
                    <span>Typography Style</span>
                  </label>
                  <span className="text-[10px] font-mono opacity-60">
                    {getFontById(formFont).typeface} ({getFontById(formFont).category})
                  </span>
                </div>

                {/* Font Category Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                  {FONT_CATEGORIES.map((cat) => (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => setFormFontCategory(cat)}
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full border transition-all shrink-0 ${
                        formFontCategory === cat
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 font-semibold'
                          : 'border-current border-opacity-15 opacity-60 hover:opacity-100'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Font Options Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                  {FONT_LIST.filter(
                    (f) => formFontCategory === 'All' || f.category === formFontCategory
                  ).map((f) => {
                    const isSelected = formFont === f.id;
                    return (
                      <button
                        type="button"
                        key={f.id}
                        onClick={() => setFormFont(f.id)}
                        className={`p-2.5 rounded-xl border text-left text-xs transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-500/10 font-bold ring-1 ring-emerald-500/40 shadow-xs'
                            : 'border-current border-opacity-15 hover:border-opacity-30 bg-black/5 dark:bg-white/5 opacity-80 hover:opacity-100'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="truncate text-xs font-semibold">{f.name}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                        </div>
                        <span className="text-[10px] font-mono opacity-50 block mb-1">
                          {f.typeface}
                        </span>
                        <div className={`p-1 rounded bg-black/5 dark:bg-white/5 border border-current border-opacity-5 ${f.className}`}>
                          <p className="text-[10px] leading-tight line-clamp-1 italic opacity-90">
                            "{f.previewQuote}"
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="pt-4 border-t border-current border-opacity-10 flex items-center justify-between gap-4">
                {viewMode === 'EDIT' && (
                  <div>
                    {confirmDelete ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleDeleteProfile}
                          className="px-3 py-1.5 rounded-xl text-xs bg-rose-600 text-white font-medium hover:bg-rose-700 transition-colors shadow-sm"
                        >
                          Confirm Delete
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(false)}
                          className="px-3 py-1.5 rounded-xl text-xs opacity-70 hover:opacity-100"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(true)}
                        disabled={profiles.length <= 1}
                        className={`text-xs flex items-center gap-1.5 text-rose-500 hover:text-rose-400 transition-colors ${
                          profiles.length <= 1 ? 'opacity-30 cursor-not-allowed' : ''
                        }`}
                        title={
                          profiles.length <= 1
                            ? 'Cannot delete the only profile'
                            : 'Delete this profile and its local reading data'
                        }
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete profile</span>
                      </button>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-2.5 ml-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode(viewMode === 'EDIT' ? 'MANAGE' : 'SELECT');
                      setEditingProfile(null);
                    }}
                    className="px-4 py-2 rounded-xl text-xs opacity-70 hover:opacity-100 transition-opacity"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`px-5 py-2 rounded-xl text-xs font-semibold shadow-md transition-all hover:scale-105 active:scale-95 ${themeStyles.buttonPrimary}`}
                  >
                    {viewMode === 'CREATE' ? 'Create & Switch' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Local Device Storage Guarantee & Backup Tools Footer */}
        <div className="px-6 py-3 border-t border-current border-opacity-10 bg-black/5 dark:bg-white/5 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Storage Guarantee Status */}
          <div className="flex items-center gap-2 opacity-70">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="font-mono text-[11px]">
              Saved Locally on this PC ({diagnostics.totalBooksStored} books • {diagnostics.profilesCount} profiles)
            </span>
          </div>

          {/* Backup / Export Buttons & Main Action */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportBackup}
              className="px-2.5 py-1 rounded-lg border border-current border-opacity-20 hover:border-opacity-60 text-[11px] font-mono flex items-center gap-1.5 transition-colors opacity-70 hover:opacity-100"
              title="Export all profiles, bookshelves, and history to a JSON file"
            >
              <Download className="w-3 h-3" />
              <span className="hidden sm:inline">Backup (.json)</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1 rounded-lg border border-current border-opacity-20 hover:border-opacity-60 text-[11px] font-mono flex items-center gap-1.5 transition-colors opacity-70 hover:opacity-100"
              title="Restore profiles and bookshelves from a backup JSON file"
            >
              <Upload className="w-3 h-3" />
              <span className="hidden sm:inline">Restore</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />

            {(viewMode === 'SELECT' || viewMode === 'MANAGE') && (
              <div className="pl-2 border-l border-current border-opacity-15">
                {viewMode === 'SELECT' ? (
                  <button
                    onClick={() => setViewMode('MANAGE')}
                    className="px-4 py-1.5 rounded-full border border-current border-opacity-30 hover:border-opacity-80 text-xs font-mono uppercase font-semibold transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5"
                  >
                    <Pencil className="w-3 h-3" />
                    <span>Manage</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setViewMode('SELECT')}
                    className={`px-5 py-1.5 rounded-full text-xs font-mono uppercase font-bold shadow-md transition-all hover:scale-105 active:scale-95 ${themeStyles.buttonPrimary}`}
                  >
                    Done
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
