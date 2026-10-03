import React, { useState } from 'react';
import {
  Search,
  BookPlus,
  Sparkles,
  Globe,
  CheckCircle2,
  Bookmark,
  ArrowRight,
  Library,
  Feather,
} from 'lucide-react';
import OmniSearch from './OmniSearch';
import { useSettingsStore } from '../store/useSettingsStore';
import { getThemeClasses } from '../lib/themeStyles';

export default function AddSearchView({ onOpenManualModal, onBookAdded, onGoHome }) {
  const [lastAddedBook, setLastAddedBook] = useState(null);
  const theme = useSettingsStore((state) => state.theme);
  const themeStyles = getThemeClasses(theme);

  const handleBookAdded = (book) => {
    setLastAddedBook(book);
    if (onBookAdded) onBookAdded(book);
    setTimeout(() => setLastAddedBook(null), 5000);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Top Banner & Title */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-card text-xs font-mono opacity-80 mb-1">
          <Globe className="w-3.5 h-3.5 text-cyan-400" />
          <span>Global Book Discovery & Cataloging</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
          Expand Your Reading Sanctum
        </h2>
        <p className="text-xs sm:text-sm opacity-60">
          Query over 40 million volumes across Google Books, Open Library, and Project Gutenberg,
          or forge a personalized custom entry with bespoke cover art.
        </p>
      </div>

      {/* Instant Success Notification Toast */}
      {lastAddedBook && (
        <div className="max-w-xl mx-auto glass-card p-4 rounded-2xl border-emerald-500/40 bg-emerald-950/20 text-emerald-200 flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div className="text-xs">
              <span className="font-bold">{lastAddedBook.title}</span> was added to your library!
            </div>
          </div>
          <button
            onClick={onGoHome}
            className="flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 underline underline-offset-2 shrink-0"
          >
            <span>View Shelf</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Manual Entry Action Card (Quick + Add Book) */}
      <div className="max-w-2xl mx-auto glass-card p-5 sm:p-6 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 border-dashed border-white/20">
        <div className="flex items-center gap-3.5 text-left">
          <div className="p-3 rounded-2xl bg-white/10 text-white shrink-0">
            <BookPlus className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold">Have a physical volume or offline PDF?</h3>
            <p className="text-xs opacity-60 mt-0.5">
              Input custom titles, authors, page counts, personal summaries, and custom covers.
            </p>
          </div>
        </div>

        <button
          onClick={() => onOpenManualModal('')}
          className="w-full sm:w-auto px-5 py-2.5 rounded-full font-semibold text-xs transition-all shadow-md active:scale-95 glass-add-button text-white whitespace-nowrap"
        >
          + Add Custom Book
        </button>
      </div>

      {/* OmniSearch Global Search Engine */}
      <div className="max-w-3xl mx-auto pt-2">
        <OmniSearch
          onBookAdded={handleBookAdded}
          onOpenManualModal={onOpenManualModal}
        />
      </div>

      {/* Catalog Sources Footnote */}
      <div className="max-w-xl mx-auto pt-6 text-center">
        <p className="text-[11px] font-mono opacity-40">
          Integrated with Google Books API • Open Library Registry • Project Gutenberg Public Domain
        </p>
      </div>
    </div>
  );
}
