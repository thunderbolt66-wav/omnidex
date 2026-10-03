import React, { useState, useEffect } from 'react';
import { useSettingsStore } from './store/useSettingsStore';
import LibraryGrid from './components/LibraryGrid';
import InsightsView from './components/InsightsView';
import AddSearchView from './components/AddSearchView';
import SettingsView from './components/SettingsView';
import AccountView from './components/AccountView';
import BottomNavBar from './components/BottomNavBar';
import InteractiveBookModal from './components/InteractiveBookModal';
import ManualBookModal from './components/ManualBookModal';
import ProfileModal from './components/ProfileModal';
import AdminSentinelModal from './components/AdminSentinelModal';
import { Compass, RefreshCw, CheckCircle2, BookPlus } from 'lucide-react';
import { getThemeClasses } from './lib/themeStyles';
import { syncLibraryState } from './lib/bookSyncService';
import { getActiveProfile } from './lib/profileService';
import { trackPageView } from './lib/telemetryService';
import { APP_VERSION } from './lib/appConfig.js';

export default function App() {
  const [activeTab, setActiveTab] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (['home', 'insights', 'add', 'settings', 'account'].includes(tabParam)) {
        return tabParam;
      }
    } catch {}
    return 'home';
  });

  const [selectedBook, setSelectedBook] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshNotice, setRefreshNotice] = useState(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualInitialTitle, setManualInitialTitle] = useState('');
  const [editingBook, setEditingBook] = useState(null);
  const [activeProfile, setActiveProfile] = useState(() => getActiveProfile());
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAdminSentinelOpen, setIsAdminSentinelOpen] = useState(() => {
    try {
      return window.location.search.includes('admin=true') || window.location.hash === '#admin';
    } catch {
      return false;
    }
  });
  const [versionTapCount, setVersionTapCount] = useState(0);

  // Sync active profile changes
  useEffect(() => {
    const handleProfileSwitch = () => {
      setActiveProfile(getActiveProfile());
      setSelectedBook(null);
      setEditingBook(null);
      setIsManualModalOpen(false);
    };

    const handleProfileUpdate = () => {
      setActiveProfile(getActiveProfile());
    };

    const handleOpenModal = () => {
      setIsProfileModalOpen(true);
    };

    window.addEventListener('antigravity:profile-switched', handleProfileSwitch);
    window.addEventListener('antigravity:profiles-updated', handleProfileUpdate);
    window.addEventListener('antigravity:open-profile-modal', handleOpenModal);

    return () => {
      window.removeEventListener('antigravity:profile-switched', handleProfileSwitch);
      window.removeEventListener('antigravity:profiles-updated', handleProfileUpdate);
      window.removeEventListener('antigravity:open-profile-modal', handleOpenModal);
    };
  }, []);

  const theme = useSettingsStore((state) => state.theme);
  const fontFamily = useSettingsStore((state) => state.fontFamily);
  const themeStyles = getThemeClasses(theme);

  // Synchronize <html> dark class with active theme
  useEffect(() => {
    if (themeStyles.root.includes('dark')) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [themeStyles.root]);

  // Silent visitor intelligence telemetry ping
  useEffect(() => {
    trackPageView({ tab: activeTab, theme: theme });
  }, [activeTab, theme]);

  // 5-tap version badge secret trigger
  const handleVersionTap = (e) => {
    e.stopPropagation();
    setVersionTapCount((prev) => {
      const next = prev + 1;
      if (next >= 5) {
        setIsAdminSentinelOpen(true);
        return 0;
      }
      return next;
    });
  };

  useEffect(() => {
    if (versionTapCount > 0) {
      const timer = setTimeout(() => setVersionTapCount(0), 2500);
      return () => clearTimeout(timer);
    }
  }, [versionTapCount]);

  // Keyboard shortcut listener (1: Home, 2: Insights, 3: Add, 4: Settings, 5: Account, Ctrl+Shift+A: Sentinel)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setIsAdminSentinelOpen((prev) => !prev);
        return;
      }

      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
      if (e.key === '1') setActiveTab('home');
      else if (e.key === '2') setActiveTab('insights');
      else if (e.key === '3') setActiveTab('add');
      else if (e.key === '4') setActiveTab('settings');
      else if (e.key === '5') setActiveTab('account');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Open manual creation modal optionally with a prefilled query title
  const handleOpenManualModal = (title = '') => {
    setEditingBook(null);
    setManualInitialTitle(title);
    setIsManualModalOpen(true);
  };

  // Open edit modal for an existing volume's metadata
  const handleEditBook = (book) => {
    setEditingBook(book);
    setManualInitialTitle('');
    setIsManualModalOpen(true);
  };

  // Manual library refresh handler
  const handleManualRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    setRefreshNotice(null);

    try {
      const result = await syncLibraryState();
      setIsRefreshing(false);
      setRefreshNotice(
        result.source === 'supabase'
          ? 'Cloud Library Synced'
          : 'Local Library Refreshed'
      );
      setTimeout(() => setRefreshNotice(null), 3000);
    } catch (err) {
      console.warn('Manual refresh failed:', err);
      setIsRefreshing(false);
      setRefreshNotice('Refreshed from Cache');
      setTimeout(() => setRefreshNotice(null), 3000);
    }
  };

  return (
    <div
      className={`min-h-screen w-full relative transition-colors duration-300 ${fontFamily} ${themeStyles.root}`}
    >
      {/* Ambient Background Refraction Mesh */}
      <div className="glass-ambient-glow">
        <div className="glass-orb-1" />
        <div className="glass-orb-2" />
        <div className="glass-orb-3" />
      </div>

      {/* Top Header / Branding with Profile & Action Buttons */}
      <header
        className={`border-b sticky top-0 z-30 transition-all backdrop-blur-xl ${themeStyles.header}`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          {/* Logo & Brand */}
          <div
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div
              className={`p-2 rounded-2xl shadow-sm transition-transform group-hover:scale-105 ${themeStyles.buttonPrimary}`}
            >
              <Compass className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold tracking-tight uppercase flex items-center gap-2">
                <span>Omnidex</span>
                <span
                  onClick={handleVersionTap}
                  title="Omnidex System Version"
                  className="text-[10px] font-mono font-medium opacity-70 px-1.5 py-0.5 rounded border border-current border-opacity-25 uppercase tracking-wide cursor-pointer hover:opacity-100 transition-opacity select-none"
                >
                  {APP_VERSION}
                </span>
              </h1>
              <p className="text-[11px] opacity-50 tracking-wider hidden sm:block">
                Autonomous Reading Sanctum & Cloud Archive
              </p>
            </div>
          </div>

          {/* Top Right Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {refreshNotice && (
              <span className="flex items-center gap-1.5 text-xs text-emerald-500 font-medium animate-fade-in">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{refreshNotice}</span>
              </span>
            )}

            {/* Reader Profile Trigger (Switches to Account tab) */}
            <button
              onClick={() => setActiveTab('account')}
              className={`flex items-center gap-2 pl-1 pr-2.5 py-1 sm:pl-1.5 sm:pr-3.5 sm:py-1 rounded-full border text-xs font-medium transition-all shadow-sm hover:scale-105 active:scale-95 border-current border-opacity-20 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 ${
                activeTab === 'account' ? 'ring-2 ring-emerald-500/70' : ''
              }`}
              title={`Switch reader profile (Active: ${activeProfile?.name || 'Reader'})`}
            >
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full overflow-hidden border border-emerald-500/80 shadow-xs shrink-0 bg-zinc-900">
                <img
                  src={activeProfile?.avatarUrl}
                  alt={activeProfile?.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-semibold text-xs max-w-[65px] sm:max-w-[100px] truncate">
                {activeProfile?.name || 'Profile'}
              </span>
            </button>

            {/* Quick Add Custom Book Button */}
            <button
              onClick={() => handleOpenManualModal('')}
              className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full border text-xs font-mono font-medium transition-all shadow-sm hover:scale-105 active:scale-95 ${themeStyles.badge} hover:brightness-110`}
              title="Add custom volume manually"
            >
              <BookPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">+ Add Book</span>
              <span className="sm:hidden">Add</span>
            </button>

            {/* Refresh Sync Button */}
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className={`flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full border text-xs font-mono font-medium transition-all shadow-sm ${
                isRefreshing
                  ? 'opacity-70 pointer-events-none'
                  : 'hover:scale-105 active:scale-95'
              } border-current border-opacity-20 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10`}
              title="Sync & refresh library data"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isRefreshing ? `animate-spin ${themeStyles.accentText}` : 'opacity-70'}`}
              />
              <span className="hidden sm:inline">
                {isRefreshing ? 'Syncing...' : 'Sync'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area (With generous bottom padding for the floating dock) */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 pb-28 sm:pb-36 relative z-10 min-h-[calc(100vh-140px)]">
        {/* Tab 1: Home (All books in library with shelf filtering & search) */}
        {activeTab === 'home' && (
          <section className="animate-fade-in">
            <LibraryGrid
              onSelectBook={(book) => setSelectedBook(book)}
              selectedBookId={selectedBook?.id}
              onOpenManualModal={() => handleOpenManualModal('')}
              onEditBook={handleEditBook}
              onOpenAddTab={() => setActiveTab('add')}
            />
          </section>
        )}

        {/* Tab 2: Insights & Reading Activity */}
        {activeTab === 'insights' && (
          <section className="animate-fade-in">
            <InsightsView
              onSelectBook={(book) => setSelectedBook(book)}
              onOpenAddTab={() => setActiveTab('add')}
            />
          </section>
        )}

        {/* Tab 3: Search & Add Books (+) in the Center */}
        {activeTab === 'add' && (
          <section className="animate-fade-in">
            <AddSearchView
              onOpenManualModal={handleOpenManualModal}
              onBookAdded={() => {
                // Optimistic sync updates all components automatically
              }}
              onGoHome={() => setActiveTab('home')}
            />
          </section>
        )}

        {/* Tab 4: Settings (Integrated directly into the dock) */}
        {activeTab === 'settings' && (
          <section className="animate-fade-in">
            <SettingsView />
          </section>
        )}

        {/* Tab 5: Account & Profile Switching */}
        {activeTab === 'account' && (
          <section className="animate-fade-in">
            <AccountView
              onOpenFullProfileModal={() => setIsProfileModalOpen(true)}
            />
          </section>
        )}
      </main>

      {/* Floating Dynamic Bottom Navigation Dock with 5 options */}
      <BottomNavBar
        activeTab={activeTab}
        onTabChange={(tabId) => {
          setActiveTab(tabId);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          try {
            const url = new URL(window.location.href);
            url.searchParams.set('tab', tabId);
            window.history.replaceState({}, '', url.toString());
          } catch {}
        }}
      />

      {/* Interactive 3D FlipBook Modal */}
      {selectedBook && (
        <InteractiveBookModal
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
          onBookUpdated={(updated) => setSelectedBook(updated)}
          onEditBook={handleEditBook}
        />
      )}

      {/* Manual Book Creation & Metadata Edit Modal */}
      <ManualBookModal
        isOpen={isManualModalOpen}
        onClose={() => {
          setIsManualModalOpen(false);
          setEditingBook(null);
          setManualInitialTitle('');
        }}
        initialTitle={manualInitialTitle}
        bookToEdit={editingBook}
        onBookAdded={() => {
          // Handled via window event
        }}
        onBookUpdated={(updated) => {
          if (selectedBook && selectedBook.id === updated.id) {
            setSelectedBook(updated);
          }
        }}
      />

      {/* Reader Profile Switcher & Manager Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      {/* Owner-Only Sentinel Admin Telemetry & IP Command */}
      <AdminSentinelModal
        isOpen={isAdminSentinelOpen}
        onClose={() => setIsAdminSentinelOpen(false)}
      />
    </div>
  );
}
