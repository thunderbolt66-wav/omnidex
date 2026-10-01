import React, { useEffect, useState, useCallback } from 'react';
import { Trash2, BookOpen, Sparkles, Loader2, BookPlus, Pencil } from 'lucide-react';
import { useSettingsStore } from '../store/useSettingsStore';
import {
  getLocalCache,
  syncLibraryState,
  fastDeleteBook,
  isSupabaseConnected,
} from '../lib/bookSyncService';
import { getThemeClasses } from '../lib/themeStyles';
import { isSafeImageUrl } from '../lib/securityUtils';

export default function LibraryGrid({
  onSelectBook,
  selectedBookId,
  onOpenManualModal,
  onEditBook,
}) {
  // Load local cache immediately to prevent blank screen lag
  const [books, setBooks] = useState(() => getLocalCache());
  const [deletingId, setDeletingId] = useState(null);
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  const theme = useSettingsStore((state) => state.theme);
  const themeStyles = getThemeClasses(theme);

  const refreshBooks = useCallback(async () => {
    setIsCloudSyncing(true);
    try {
      const { books: synced } = await syncLibraryState();
      setBooks(synced);
    } finally {
      setIsCloudSyncing(false);
    }
  }, []);

  useEffect(() => {
    // Initial quick sync
    refreshBooks();

    // Event listener for optimistic updates from any component
    const handleUpdate = (e) => {
      const detail = e.detail;
      if (!detail) {
        setBooks(getLocalCache());
        return;
      }

      if (detail.type === 'add' && detail.book) {
        setBooks((prev) => [detail.book, ...prev.filter((b) => b.id !== detail.book.id)]);
      } else if (detail.type === 'update' && detail.book) {
        setBooks((prev) => prev.map((b) => (b.id === detail.book.id ? detail.book : b)));
      } else if (detail.type === 'delete' && detail.bookId) {
        setBooks((prev) => prev.filter((b) => b.id !== detail.bookId));
      } else if (detail.type === 'sync' && detail.books) {
        setBooks(detail.books);
      } else {
        setBooks(getLocalCache());
      }
    };

    const handleProfileSwitch = () => {
      setBooks(getLocalCache());
      refreshBooks();
    };

    window.addEventListener('antigravity:books-updated', handleUpdate);
    window.addEventListener('antigravity:profile-switched', handleProfileSwitch);
    return () => {
      window.removeEventListener('antigravity:books-updated', handleUpdate);
      window.removeEventListener('antigravity:profile-switched', handleProfileSwitch);
    };
  }, [refreshBooks]);

  const handleDeleteBook = async (e, book) => {
    e.stopPropagation();
    if (deletingId) return;

    setDeletingId(book.id);
    await fastDeleteBook(book.id);
    setDeletingId(null);
  };

  return (
    <div className="w-full">
      {/* Grid Header Info */}
      <div className="flex items-center justify-between mb-6 px-1 flex-wrap gap-3">
        <div className="flex items-center gap-2.5">
          <BookOpen className="w-5 h-5 opacity-70" />
          <h2 className="text-lg font-medium tracking-tight">Your Reading Sanctuary</h2>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-black/5 dark:bg-white/5 opacity-70 font-mono">
            {books.length} {books.length === 1 ? 'volume' : 'volumes'}
          </span>
          {isCloudSyncing && (
            <span className="flex items-center gap-1 text-[11px] opacity-40 font-mono animate-pulse">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>syncing...</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          {!isSupabaseConnected() ? (
            <span className={`text-[11px] px-2.5 py-1 rounded-full border font-mono ${themeStyles.badge}`}>
              Offline Cache Active
            </span>
          ) : (
            <span className="text-[11px] px-2.5 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-mono">
              Cloud Connected
            </span>
          )}

          {onOpenManualModal && (
            <button
              onClick={onOpenManualModal}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium border active:scale-95 transition-all shadow-sm ${themeStyles.badge} hover:brightness-110`}
              title="Add custom book with metadata and resized cover"
            >
              <BookPlus className="w-3.5 h-3.5" />
              <span>+ Add Volume</span>
            </button>
          )}
        </div>
      </div>

      {books.length === 0 ? (
        <div className="text-center py-20 rounded-3xl border border-dashed border-current border-opacity-20 px-6">
          <Sparkles className="w-10 h-10 mx-auto opacity-30 mb-3" />
          <h3 className="text-base font-medium opacity-80">Your shelves are waiting</h3>
          <p className="text-xs opacity-50 mt-1 max-w-sm mx-auto mb-4">
            Use the OmniSearch bar above to search any book in the world, or add a custom volume manually.
          </p>
          {onOpenManualModal && (
            <button
              onClick={onOpenManualModal}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold shadow-md transition-all active:scale-95 ${themeStyles.buttonPrimary}`}
            >
              <BookPlus className="w-4 h-4" />
              <span>+ Add Custom Book Manually</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5 sm:gap-6">
          {books.map((book) => {
            const pagesRead = Number(book.pages_read) || 0;
            const totalPages = Number(book.total_pages) || 1;
            const progressPercent = Math.min(100, Math.round((pagesRead / totalPages) * 100));
            const isSelected = selectedBookId === book.id;
            const isDeleting = deletingId === book.id;

            return (
              <div
                key={book.id}
                onClick={() => onSelectBook && onSelectBook(book)}
                className={`group relative flex flex-col rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 transform hover:-translate-y-1.5 ${themeStyles.card(isSelected)}`}
              >
                {/* Book Cover Container with 2/3 ratio */}
                <div className="relative w-full aspect-[2/3] overflow-hidden bg-black/20">
                  <img
                    src={
                      isSafeImageUrl(book.thumbnail_url)
                        ? book.thumbnail_url
                        : `https://placehold.co/300x450/1e293b/fff?text=${encodeURIComponent(book.title || 'Volume')}`
                    }
                    alt={book.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://placehold.co/300x450/1e293b/fff?text=${encodeURIComponent(
                        book.title.slice(0, 8)
                      )}`;
                    }}
                  />

                  {/* Gradient shadow for depth */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

                  {/* Action Cluster: Pencil (Edit) & Trash (Delete) on hover */}
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 transform scale-90 group-hover:scale-100 z-10">
                    {/* Pencil-designed Edit button */}
                    {onEditBook && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditBook(book);
                        }}
                        title="Edit book metadata"
                        className="p-2 rounded-xl bg-black/70 text-white/90 backdrop-blur-md hover:bg-white hover:text-black transition-all duration-200 shadow-md active:scale-95"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Trash Delete button */}
                    <button
                      onClick={(e) => handleDeleteBook(e, book)}
                      disabled={isDeleting}
                      title="Remove from library"
                      className="p-2 rounded-xl bg-black/70 text-white/90 backdrop-blur-md hover:bg-rose-600 hover:text-white transition-all duration-200 shadow-md active:scale-95"
                    >
                      {isDeleting ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Completion badge on hover */}
                  <div className="absolute bottom-3 left-3 text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-black/70 text-white/90 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">
                    {progressPercent}%
                  </div>
                </div>

                {/* Card Bottom Meta */}
                <div className="p-3 flex flex-col flex-1 justify-between">
                  <div>
                    <h3
                      className="text-xs sm:text-sm font-semibold truncate leading-tight tracking-tight"
                      title={book.title}
                    >
                      {book.title}
                    </h3>
                    <div className="flex items-center justify-between gap-1 mt-0.5">
                      <p className="text-[11px] opacity-60 truncate flex-1" title={book.author}>
                        {book.author}
                      </p>
                      {(book.genre || book.category) && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 opacity-70 truncate max-w-[75px] flex-shrink-0">
                          {book.genre || book.category}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[10px] opacity-40 font-mono">
                    <span>
                      {pagesRead} / {totalPages} p.
                    </span>
                    <span>{progressPercent}%</span>
                  </div>
                </div>

                {/* Thin Progress Bar at bottom representing (pages_read / total_pages) * 100 */}
                <div className="w-full h-1 bg-black/10 dark:bg-white/10 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      progressPercent >= 100 ? 'bg-emerald-500' : themeStyles.progressColor
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
