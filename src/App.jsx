import React, { useState, useEffect } from 'react';
import { useSettingsStore } from './store/useSettingsStore';
import OmniSearch from './components/OmniSearch';
import LibraryGrid from './components/LibraryGrid';
import InteractiveBookModal from './components/InteractiveBookModal';
import ManualBookModal from './components/ManualBookModal';
import SettingsPanel from './components/SettingsPanel';
import ProfileModal from './components/ProfileModal';
import { BookOpen, Sparkles, Compass, RefreshCw, CheckCircle2, BookPlus, User } from 'lucide-react';
import { getThemeClasses } from './lib/themeStyles';
import { syncLibraryState } from './lib/bookSyncService';
import { getActiveProfile } from './lib/profileService';
import { APP_VERSION } from './lib/appConfig.js';

export default function App() {
  const [selectedBook, setSelectedBook] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshNotice, setRefreshNotice] = useState(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualInitialTitle, setManualInitialTitle] = useState('');
  const [editingBook, setEditingBook] = useState(null);
  const [activeProfile, setActiveProfile] = useState(() => getActiveProfile());
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Sync active profile changes
  useEffect(() => {
    const handleProfileSwitch = () => {
      setActiveProfile(getActiveProfile());
      // Explicitly close any open book reader or editor from previous profile
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
      className={`min-h-screen w-full transition-colors duration-300 ${fontFamily} ${themeStyles.root}`}
    >
      {/* Top Header / Branding with Refresh & Add Volume Options at Top Right */}
      <header
        className={`border-b sticky top-0 z-30 transition-all backdrop-blur-md ${themeStyles.header}`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-2xl shadow-sm ${themeStyles.buttonPrimary}`}
            >
              <Compass className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold tracking-tight uppercase flex items-center gap-2">
                <span>Omnidex</span>
                <span className="text-[10px] font-mono font-medium opacity-70 px-1.5 py-0.5 rounded border border-current border-opacity-25 uppercase tracking-wide">
                  {APP_VERSION}
                </span>
              </h1>
              <p className="text-[11px] opacity-50 tracking-wider hidden sm:block">
                Autonomous Reading Sanctum & Cloud Archive
              </p>
            </div>
          </div>

          {/* Top Right Action Controls: Refresh / Sync Button & Manual Book Addition & Profile */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {refreshNotice && (
              <span className="flex items-center gap-1.5 text-xs text-emerald-500 font-medium animate-fade-in">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{refreshNotice}</span>
              </span>
            )}

            {/* Active Reader Profile Trigger */}
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className={`flex items-center gap-2 pl-1 pr-2.5 py-1 sm:pl-1.5 sm:pr-3.5 sm:py-1 rounded-full border text-xs font-medium transition-all shadow-sm hover:scale-105 active:scale-95 border-current border-opacity-20 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10`}
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

            <button
              onClick={() => handleOpenManualModal('')}
              className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full border text-xs font-mono font-medium transition-all shadow-sm hover:scale-105 active:scale-95 ${themeStyles.badge} hover:brightness-110`}
              title="Add custom book with metadata and resized cover"
            >
              <BookPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">+ Add Book</span>
              <span className="sm:hidden">Add</span>
            </button>

            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className={`flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full border text-xs font-mono font-medium transition-all shadow-sm ${
                isRefreshing
                  ? 'opacity-70 pointer-events-none'
                  : 'hover:scale-105 active:scale-95'
              } border-current border-opacity-20 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10`}
              title="Sync & refresh library data from cloud and local storage"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isRefreshing ? `animate-spin ${themeStyles.accentText}` : 'opacity-70'}`}
              />
              <span className="hidden sm:inline">
                {isRefreshing ? 'Syncing...' : 'Sync & Refresh'}
              </span>
              <span className="sm:hidden">{isRefreshing ? '...' : 'Sync'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Centered Content Layout */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
        {/* Hero & OmniSearch Section */}
        <section className="text-center space-y-5">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Curate your intellectual universe.
            </h2>
            <p className="text-xs sm:text-sm opacity-60 max-w-lg mx-auto">
              Search the global catalog, catalog volumes autonomously, and flip through your physical
              reading log.
            </p>
          </div>

          {/* OmniSearch with debounced hybrid search and instant suggestions */}
          <div className="pt-2">
            <OmniSearch
              onOpenManualModal={handleOpenManualModal}
              onBookAdded={(newBook) => {
                // Book is immediately rendered via optimistic sync
              }}
            />
          </div>
        </section>

        {/* Library Grid Section */}
        <section className="pt-4">
          <LibraryGrid
            onSelectBook={(book) => setSelectedBook(book)}
            selectedBookId={selectedBook?.id}
            onOpenManualModal={() => handleOpenManualModal('')}
            onEditBook={handleEditBook}
          />
        </section>
      </main>

      {/* Interactive FlipBook Modal */}
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
        onBookAdded={(newBook) => {
          // Window event is triggered by fastAddBook to update all components immediately
        }}
        onBookUpdated={(updated) => {
          if (selectedBook && selectedBook.id === updated.id) {
            setSelectedBook(updated);
          }
        }}
      />

      {/* Floating Settings FAB & Flyout */}
      <SettingsPanel />

      {/* Reader Profile Switcher & Manager Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-current border-opacity-10 py-8 mt-20 text-center text-xs opacity-40 font-mono">
        Omnidex • 7 Atmospheres • Instant Optimistic Sync • Supabase • Zustand • PageFlip
      </footer>
    </div>
  );
}
