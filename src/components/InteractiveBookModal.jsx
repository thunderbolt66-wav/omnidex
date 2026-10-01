import React, { useState, useEffect, useRef, forwardRef } from 'react';
import HTMLFlipBook from 'react-pageflip';
import {
  X,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  CheckCircle2,
  FileText,
  Bookmark,
  Percent,
  Sparkles,
  Loader2,
  Pencil,
} from 'lucide-react';
import { useSettingsStore } from '../store/useSettingsStore';
import { fastUpdateBook } from '../lib/bookSyncService';
import { getThemeClasses } from '../lib/themeStyles';
import { isSafeImageUrl } from '../lib/securityUtils';

// ForwardRef page component required by react-pageflip
const BookPage = forwardRef(({ children, className = '' }, ref) => {
  return (
    <div
      ref={ref}
      className={`relative w-full h-full p-6 sm:p-8 flex flex-col justify-between select-none overflow-hidden ${className}`}
    >
      {children}
    </div>
  );
});
BookPage.displayName = 'BookPage';

export default function InteractiveBookModal({ book, onClose, onBookUpdated, onEditBook }) {
  if (!book) return null;

  const reduceMotion = useSettingsStore((state) => state.reduceMotion);
  const theme = useSettingsStore((state) => state.theme);
  const themeStyles = getThemeClasses(theme);

  const [pagesRead, setPagesRead] = useState(book.pages_read || 0);
  const [notes, setNotes] = useState(book.notes || '');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [, setCurrentPage] = useState(0);

  const flipBookRef = useRef(null);

  // Sync state if book changes
  useEffect(() => {
    setPagesRead(book.pages_read || 0);
    setNotes(book.notes || '');
    setSyncSuccess(false);
  }, [book]);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Dynamic percentage calculation
  const totalPages = Number(book.total_pages) || 1;
  const currentPagesRead = Number(pagesRead) || 0;
  const completionPercentage = Math.min(
    100,
    Math.max(0, Math.round((currentPagesRead / totalPages) * 100))
  );

  // Fast optimistic sync
  const handleSync = async () => {
    setIsSyncing(true);
    setSyncSuccess(false);

    const safePages = Math.max(0, Math.min(totalPages, Number(pagesRead) || 0));
    const updatedPayload = {
      pages_read: safePages,
      notes: notes,
    };

    const updatedRecord = await fastUpdateBook(book.id, updatedPayload);

    setIsSyncing(false);
    setSyncSuccess(true);
    setTimeout(() => setSyncSuccess(false), 2500);

    if (onBookUpdated) {
      onBookUpdated(updatedRecord);
    }
  };

  // Flip controls
  const handleNextPage = () => {
    if (flipBookRef.current) {
      flipBookRef.current.pageFlip().flipNext();
    }
  };

  const handlePrevPage = () => {
    if (flipBookRef.current) {
      flipBookRef.current.pageFlip().flipPrev();
    }
  };

  // Page 2: Metadata & completion percentage content
  const renderMetadataContent = () => (
    <div className="flex flex-col h-full justify-between">
      <div>
        <div className="flex items-center justify-between text-xs uppercase tracking-widest opacity-50 mb-2">
          <div className="flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Volume Dossier</span>
          </div>
          {onEditBook && (
            <button
              onClick={() => onEditBook(book)}
              className={`flex items-center gap-1 text-[11px] ${themeStyles.accentText} hover:brightness-125 capitalize font-medium transition-colors cursor-pointer`}
              title="Edit volume metadata"
            >
              <Pencil className="w-3 h-3" />
              <span>Edit Metadata</span>
            </button>
          )}
        </div>
        <h3 className="text-xl font-bold tracking-tight leading-tight mb-1">{book.title}</h3>
        <p className="text-sm opacity-70 mb-4">{book.author}</p>

        <div className="space-y-3 pt-3 border-t border-current border-opacity-10 text-xs">
          <div className="flex justify-between py-1 border-b border-current border-opacity-5">
            <span className="opacity-60">Genre</span>
            <span className={`font-medium font-mono ${themeStyles.accentText}`}>
              {book.genre || book.category || 'General Literature'}
            </span>
          </div>
          <div className="flex justify-between py-1 border-b border-current border-opacity-5">
            <span className="opacity-60">Total Length</span>
            <span className="font-mono font-medium">{book.total_pages} pages</span>
          </div>
          <div className="flex justify-between py-1 border-b border-current border-opacity-5">
            <span className="opacity-60">Current Bookmark</span>
            <span className="font-mono font-medium">{pagesRead} pages read</span>
          </div>
          <div className="flex justify-between py-1 border-b border-current border-opacity-5">
            <span className="opacity-60">Pace Status</span>
            <span className="font-medium">
              {completionPercentage >= 100
                ? 'Completed 🎉'
                : completionPercentage > 0
                ? 'Active Read'
                : 'Unstarted'}
            </span>
          </div>
        </div>
      </div>

      {/* Dynamic Completion Percentage Visualizer */}
      <div className="my-6 p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-current border-opacity-10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium tracking-wide flex items-center gap-1.5 opacity-80">
            <Percent className="w-3.5 h-3.5" /> Reading Progress
          </span>
          <span className="text-lg font-mono font-bold">{completionPercentage}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-current bg-opacity-10 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 rounded-full ${themeStyles.progressColor}`}
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
        <p className="text-[11px] opacity-50 mt-2 text-right">
          {totalPages - currentPagesRead > 0
            ? `${totalPages - currentPagesRead} pages remaining`
            : 'All pages covered'}
        </p>
      </div>

      <div className="text-[10px] opacity-40 font-mono text-center tracking-widest uppercase">
        Page II
      </div>
    </div>
  );

  // Page 3: Update pages_read & notes & Sync button content
  const renderSyncAndNotesContent = () => (
    <div className="flex flex-col h-full justify-between">
      <div>
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest opacity-50 mb-2">
          <Bookmark className="w-3.5 h-3.5" />
          <span>Reader Log & Sync</span>
        </div>

        {/* Input for pages_read */}
        <div className="mt-3">
          <label className="block text-xs font-semibold uppercase tracking-wider opacity-70 mb-1">
            Pages Read
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              max={totalPages}
              value={pagesRead}
              onChange={(e) => setPagesRead(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono outline-none transition-all ${themeStyles.input}`}
            />
            <span className="text-xs opacity-50 whitespace-nowrap">/ {totalPages}</span>
          </div>
        </div>

        {/* Textarea for notes */}
        <div className="mt-4">
          <label className="block text-xs font-semibold uppercase tracking-wider opacity-70 mb-1 flex items-center gap-1.5">
            <FileText className="w-3 h-3" /> Reader Notes & Thoughts
          </label>
          <textarea
            rows="6"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Record memorable passages, character insights, questions, or ideas..."
            className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm outline-none resize-none transition-all ${themeStyles.input}`}
          />
        </div>
      </div>

      {/* Fast Sync Button */}
      <div className="pt-4">
        <button
          onClick={handleSync}
          disabled={isSyncing}
          className={`w-full py-3 px-4 rounded-xl font-medium text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md ${
            syncSuccess
              ? 'bg-emerald-600 text-white'
              : themeStyles.buttonPrimary
          }`}
        >
          {isSyncing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : syncSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Cloud Record Updated</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Sync to Cloud</span>
            </>
          )}
        </button>
        <div className="text-[10px] opacity-40 font-mono text-center tracking-widest uppercase mt-3">
          Page III
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      {/* Top right action buttons (Pencil Edit & Close) */}
      <div className="fixed top-5 right-5 z-50 flex items-center gap-2">
        {onEditBook && (
          <button
            onClick={() => onEditBook(book)}
            className={`p-2.5 rounded-full bg-black/60 ${themeStyles.accentText} hover:bg-black/90 hover:scale-105 transition-all shadow-xl backdrop-blur-md`}
            title="Edit volume metadata"
          >
            <Pencil className="w-5 h-5" />
          </button>
        )}
        <button
          onClick={onClose}
          className="p-2.5 rounded-full bg-black/60 text-white hover:bg-black/90 hover:scale-105 transition-all shadow-xl backdrop-blur-md"
          title="Close book (Esc)"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {reduceMotion ? (
        /* ================= FLAT MODAL (reduceMotion = true) ================= */
        <div
          className={`relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8 shadow-2xl border ${themeStyles.modal}`}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Page 1: Cover Image */}
            <div className="flex flex-col items-center">
              <div className="w-full max-w-[240px] aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-black/10">
                <img
                  src={
                    isSafeImageUrl(book.thumbnail_url)
                      ? book.thumbnail_url
                      : `https://placehold.co/300x450/1e293b/fff?text=${encodeURIComponent(book.title || 'Volume')}`
                  }
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-[11px] font-mono opacity-50 uppercase tracking-widest mt-3">
                Cover Plate
              </span>
            </div>

            {/* Page 2: Metadata & Completion Percentage */}
            <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-current border-opacity-10">
              {renderMetadataContent()}
            </div>

            {/* Page 3: Reader Log, Input & Sync */}
            <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-current border-opacity-10">
              {renderSyncAndNotesContent()}
            </div>
          </div>
        </div>
      ) : (
        /* ================= 3D FLIPBOOK (reduceMotion = false) ================= */
        <div className="relative flex flex-col items-center max-w-full">
          {/* FlipBook Container */}
          <div className="shadow-2xl rounded-lg overflow-hidden border border-black/40">
            <HTMLFlipBook
              ref={flipBookRef}
              width={370}
              height={520}
              minWidth={300}
              maxWidth={450}
              minHeight={450}
              maxHeight={620}
              size="fixed"
              maxShadowOpacity={0.6}
              showCover={true}
              mobileScrollSupport={true}
              onFlip={(e) => setCurrentPage(e.data)}
              className="antigravity-flipbook"
            >
              {/* PAGE 1: COVER */}
              <BookPage className="bg-zinc-950 p-0 text-white flex items-center justify-center">
                <div className="relative w-full h-full">
                  <img
                    src={
                      isSafeImageUrl(book.thumbnail_url)
                        ? book.thumbnail_url
                        : `https://placehold.co/370x520/1e293b/fff?text=${encodeURIComponent(book.title || 'Volume')}`
                    }
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30 flex flex-col justify-end p-6">
                    <span className="text-xs uppercase tracking-widest opacity-75 font-mono">
                      Omnidex Tome
                    </span>
                    <h2 className="text-xl font-bold tracking-tight text-white drop-shadow-md">
                      {book.title}
                    </h2>
                    <p className="text-xs text-zinc-300 mt-1">{book.author}</p>
                    <p className={`text-[10px] mt-3 font-mono ${themeStyles.accentText}`}>
                      👉 Click or drag corner to open
                    </p>
                  </div>
                </div>
              </BookPage>

              {/* PAGE 2: METADATA & COMPLETION % */}
              <BookPage className={themeStyles.pageBg}>
                {renderMetadataContent()}
              </BookPage>

              {/* PAGE 3: PAGES READ & NOTES & SYNC */}
              <BookPage className={themeStyles.pageBg}>
                {renderSyncAndNotesContent()}
              </BookPage>

              {/* PAGE 4: BACK COVER */}
              <BookPage className="bg-zinc-950 text-white flex flex-col justify-between items-center text-center p-8">
                <div />
                <div className="max-w-xs">
                  <Sparkles className={`w-8 h-8 mx-auto mb-3 opacity-80 ${themeStyles.accentText}`} />
                  <p className="text-xs italic opacity-75 font-serif leading-relaxed">
                    “A reader lives a thousand lives before he dies. The man who never reads lives only one.”
                  </p>
                  <p className="text-[11px] opacity-40 mt-2 font-mono">— George R.R. Martin</p>
                </div>
                <div className="text-[10px] opacity-40 font-mono tracking-widest uppercase">
                  Project AntiGravity • Library Archive
                </div>
              </BookPage>
            </HTMLFlipBook>
          </div>

          {/* Navigation Controls under the book */}
          <div className="flex items-center gap-4 mt-5">
            <button
              onClick={handlePrevPage}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-black/60 text-white/90 hover:bg-black/90 text-xs backdrop-blur-md transition-all shadow-md"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Turn Left</span>
            </button>

            <span className="text-xs text-white/70 font-mono px-2">
              Flip through pages or drag corners
            </span>

            <button
              onClick={handleNextPage}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-black/60 text-white/90 hover:bg-black/90 text-xs backdrop-blur-md transition-all shadow-md"
            >
              <span>Turn Right</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
