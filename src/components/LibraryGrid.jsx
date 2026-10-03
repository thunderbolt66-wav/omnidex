import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Trash2,
  BookOpen,
  Sparkles,
  Loader2,
  BookPlus,
  Pencil,
  Search,
  SlidersHorizontal,
  Bookmark,
  CheckCircle2,
  Clock,
  Layers,
} from 'lucide-react';
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
  onOpenAddTab,
}) {
  const [books, setBooks] = useState(() => getLocalCache());
  const [deletingId, setDeletingId] = useState(null);
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  const [shelfFilter, setShelfFilter] = useState('all'); // 'all' | 'reading' | 'completed' | 'unread'
  const [localSearch, setLocalSearch] = useState('');
  const [sortBy, setSortBy] = useState('recent'); // 'recent' | 'title' | 'progress' | 'pages'

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
    refreshBooks();

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

  // Filter and sort books
  const filteredBooks = useMemo(() => {
    let result = [...books];

    // Filter by shelf
    if (shelfFilter === 'reading') {
      result = result.filter(
        (b) => (Number(b.pages_read) || 0) > 0 && (Number(b.pages_read) || 0) < (Number(b.total_pages) || 1)
      );
    } else if (shelfFilter === 'completed') {
      result = result.filter(
        (b) => (Number(b.pages_read) || 0) >= (Number(b.total_pages) || 1) && (Number(b.total_pages) || 0) > 0
      );
    } else if (shelfFilter === 'unread') {
      result = result.filter((b) => (Number(b.pages_read) || 0) === 0);
    }

    // Filter by search query
    if (localSearch.trim()) {
      const q = localSearch.toLowerCase();
      result = result.filter(
        (b) =>
          (b.title && b.title.toLowerCase().includes(q)) ||
          (b.author && b.author.toLowerCase().includes(q)) ||
          (b.genre && b.genre.toLowerCase().includes(q))
      );
    }

    // Sort
    if (sortBy === 'title') {
      result.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    } else if (sortBy === 'progress') {
      result.sort((a, b) => {
        const progA = (Number(a.pages_read) || 0) / (Number(a.total_pages) || 1);
        const progB = (Number(b.pages_read) || 0) / (Number(b.total_pages) || 1);
        return progB - progA;
      });
    } else if (sortBy === 'pages') {
      result.sort((a, b) => (Number(b.total_pages) || 0) - (Number(a.total_pages) || 0));
    }

    return result;
  }, [books, shelfFilter, localSearch, sortBy]);

  // Counts for tabs
  const readingCount = books.filter(
    (b) => (Number(b.pages_read) || 0) > 0 && (Number(b.pages_read) || 0) < (Number(b.total_pages) || 1)
  ).length;
  const completedCount = books.filter(
    (b) => (Number(b.pages_read) || 0) >= (Number(b.total_pages) || 1) && (Number(b.total_pages) || 0) > 0
  ).length;
  const unreadCount = books.filter((b) => (Number(b.pages_read) || 0) === 0).length;

  return (
    <div className="w-full space-y-6">
      {/* Sanctum Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-white/10 text-white">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">Your Sanctum Library</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 font-mono font-medium">
                {books.length} {books.length === 1 ? 'volume' : 'volumes'}
              </span>
              {isCloudSyncing && (
                <span className="flex items-center gap-1 text-[11px] opacity-50 font-mono animate-pulse">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>syncing</span>
                </span>
              )}
            </div>
            <p className="text-xs opacity-50">
              Browse, filter, and flip through your physical and digital volumes.
            </p>
          </div>
        </div>

        {/* Search within library & Sort */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <div className="relative flex-1 md:w-60">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Filter library books..."
              className="w-full glass-input text-xs rounded-full pl-9 pr-3 py-1.5 focus:outline-none"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="glass-input text-xs rounded-full px-3 py-1.5 focus:outline-none cursor-pointer"
          >
            <option value="recent">Recently Added</option>
            <option value="title">Title (A-Z)</option>
            <option value="progress">Reading Progress</option>
            <option value="pages">Page Count</option>
          </select>
        </div>
      </div>

      {/* Shelf Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
        <button
          onClick={() => setShelfFilter('all')}
          className={`px-3.5 py-1.5 rounded-full transition-all whitespace-nowrap flex items-center gap-1.5 font-medium ${
            shelfFilter === 'all'
              ? 'font-bold shadow-xs bg-current/15 text-current border border-current/30'
              : 'opacity-60 hover:opacity-100 hover:bg-current/10'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>All Volumes</span>
          <span className="text-[10px] font-mono opacity-60">({books.length})</span>
        </button>

        <button
          onClick={() => setShelfFilter('reading')}
          className={`px-3.5 py-1.5 rounded-full transition-all whitespace-nowrap flex items-center gap-1.5 font-medium ${
            shelfFilter === 'reading'
              ? 'font-bold shadow-xs bg-current/15 text-current border border-current/30'
              : 'opacity-60 hover:opacity-100 hover:bg-current/10'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />
          <span>Currently Reading</span>
          <span className="text-[10px] font-mono opacity-60">({readingCount})</span>
        </button>

        <button
          onClick={() => setShelfFilter('completed')}
          className={`px-3.5 py-1.5 rounded-full transition-all whitespace-nowrap flex items-center gap-1.5 font-medium ${
            shelfFilter === 'completed'
              ? 'font-bold shadow-xs bg-current/15 text-current border border-current/30'
              : 'opacity-60 hover:opacity-100 hover:bg-current/10'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
          <span>Finished</span>
          <span className="text-[10px] font-mono opacity-60">({completedCount})</span>
        </button>

        <button
          onClick={() => setShelfFilter('unread')}
          className={`px-3.5 py-1.5 rounded-full transition-all whitespace-nowrap flex items-center gap-1.5 font-medium ${
            shelfFilter === 'unread'
              ? 'font-bold shadow-xs bg-current/15 text-current border border-current/30'
              : 'opacity-60 hover:opacity-100 hover:bg-current/10'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
          <span>Want to Read</span>
          <span className="text-[10px] font-mono opacity-60">({unreadCount})</span>
        </button>
      </div>

      {/* Book Grid */}
      {filteredBooks.length === 0 ? (
        <div className="text-center py-20 rounded-3xl glass-card border-dashed border-current/25 px-6 space-y-4">
          <Sparkles className="w-10 h-10 mx-auto opacity-40 animate-pulse text-amber-500 dark:text-amber-400" />
          <div className="space-y-1">
            <h3 className="text-base font-bold">
              {books.length === 0 ? 'Your Sanctuary is Empty' : 'No volumes match your filter'}
            </h3>
            <p className="text-xs opacity-50 max-w-sm mx-auto">
              {books.length === 0
                ? 'Begin your intellectual journey by querying global repositories or adding your physical books.'
                : 'Try adjusting your shelf filter or clearing your search term.'}
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            {onOpenAddTab && (
              <button
                onClick={onOpenAddTab}
                className={`px-4 py-2 rounded-full font-semibold text-xs transition-all shadow-md active:scale-95 ${themeStyles.buttonPrimary}`}
              >
                + Search & Add Books
              </button>
            )}
            {onOpenManualModal && (
              <button
                onClick={() => onOpenManualModal('')}
                className="px-4 py-2 rounded-full glass-card hover:bg-black/5 dark:hover:bg-white/10 text-xs font-semibold border border-current/10"
              >
                + Manual Entry
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {filteredBooks.map((book) => {
            const pagesRead = Number(book.pages_read) || 0;
            const totalPages = Number(book.total_pages) || 1;
            const progressPercent = Math.min(100, Math.round((pagesRead / totalPages) * 100));
            const isSelected = selectedBookId === book.id;
            const isDeleting = deletingId === book.id;

            return (
              <div
                key={book.id}
                onClick={() => onSelectBook && onSelectBook(book)}
                className={`group relative flex flex-col rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 transform hover:-translate-y-1.5 glass-card ${
                  isSelected ? 'ring-2 ring-white/60 shadow-2xl' : ''
                }`}
              >
                {/* Book Cover Container with 2/3 ratio */}
                <div className="relative w-full aspect-[2/3] overflow-hidden bg-black/40">
                  <img
                    src={
                      isSafeImageUrl(book.thumbnail_url)
                        ? book.thumbnail_url
                        : `https://placehold.co/300x450/1e293b/fff?text=${encodeURIComponent(
                            book.title || 'Volume'
                          )}`
                    }
                    alt={book.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://placehold.co/300x450/1e293b/fff?text=${encodeURIComponent(
                        book.title ? book.title.slice(0, 8) : 'Book'
                      )}`;
                    }}
                  />

                  {/* Gradient shadow for depth */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

                  {/* Action Cluster: Pencil (Edit) & Trash (Delete) on hover */}
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 transform scale-90 group-hover:scale-100 z-10">
                    {onEditBook && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditBook(book);
                        }}
                        title="Edit book metadata"
                        className="p-1.5 sm:p-2 rounded-xl bg-black/70 text-white/90 backdrop-blur-md hover:bg-white hover:text-black transition-all duration-200 shadow-md active:scale-95"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      onClick={(e) => handleDeleteBook(e, book)}
                      disabled={isDeleting}
                      title="Remove from library"
                      className="p-1.5 sm:p-2 rounded-xl bg-black/70 text-white/90 backdrop-blur-md hover:bg-rose-600 hover:text-white transition-all duration-200 shadow-md active:scale-95"
                    >
                      {isDeleting ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Completion badge on hover */}
                  <div className="absolute bottom-2.5 left-2.5 text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-black/70 text-white/90 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">
                    {progressPercent}%
                  </div>
                </div>

                {/* Card Bottom Meta */}
                <div className="p-3 flex flex-col flex-1 justify-between gap-2">
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
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/10 opacity-70 truncate max-w-[70px] shrink-0">
                          {book.genre || book.category}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] opacity-40 font-mono">
                    <span>
                      {pagesRead} / {totalPages} p.
                    </span>
                    <span>{progressPercent}%</span>
                  </div>
                </div>

                {/* Progress bar at bottom */}
                <div className="w-full h-1 bg-white/5 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      progressPercent >= 100 ? 'bg-emerald-400' : 'bg-cyan-400'
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
