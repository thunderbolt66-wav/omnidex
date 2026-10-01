import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  History,
  Trash2,
  Calendar,
  Clock,
  Search,
  Check,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { useSettingsStore } from '../store/useSettingsStore';
import {
  getFullSearchHistory,
  removeSearchQuery,
  deleteSearchHistoryByTimeframe,
} from '../lib/searchHistoryService';
import { getThemeClasses } from '../lib/themeStyles';

export default function SearchHistoryModal({ isOpen, onClose }) {
  const theme = useSettingsStore((state) => state.theme);
  const themeStyles = getThemeClasses(theme);

  const [historyItems, setHistoryItems] = useState(() => getFullSearchHistory());
  const [filterText, setFilterText] = useState('');
  const [actionFeedback, setActionFeedback] = useState(null);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);

  // Sync when search history updates or profile switches
  useEffect(() => {
    const handleUpdate = () => {
      setHistoryItems(getFullSearchHistory());
    };
    window.addEventListener('antigravity:search-history-updated', handleUpdate);
    window.addEventListener('antigravity:profile-switched', handleUpdate);
    return () => {
      window.removeEventListener('antigravity:search-history-updated', handleUpdate);
      window.removeEventListener('antigravity:profile-switched', handleUpdate);
    };
  }, []);

  // Sync on modal open
  useEffect(() => {
    if (isOpen) {
      setHistoryItems(getFullSearchHistory());
      setFilterText('');
      setActionFeedback(null);
      setConfirmDeleteAll(false);
    }
  }, [isOpen]);

  // Escape key closes modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Filter items by local search query
  const filteredItems = historyItems.filter((item) =>
    item.query.toLowerCase().includes(filterText.toLowerCase().trim())
  );

  // Helper to format timestamps cleanly
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Earlier';
    const date = new Date(timestamp);
    const now = new Date();

    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday =
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear();

    const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (isToday) {
      return `Today at ${timeString}`;
    }
    if (isYesterday) {
      return `Yesterday at ${timeString}`;
    }
    return `${date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} • ${timeString}`;
  };

  // Timeframe deletion handler
  const handleDeleteTimeframe = (timeframe, label) => {
    const { removedCount } = deleteSearchHistoryByTimeframe(timeframe);
    setConfirmDeleteAll(false);
    if (removedCount > 0) {
      setActionFeedback(`Removed ${removedCount} ${removedCount === 1 ? 'search' : 'searches'} from ${label}`);
    } else {
      setActionFeedback(`No searches found for ${label}`);
    }
    setTimeout(() => setActionFeedback(null), 3500);
  };

  // Remove single item
  const handleRemoveSingle = (item) => {
    removeSearchQuery(item.id || item.query);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      {/* Modal Container */}
      <div
        className={`relative w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl border transition-all ${themeStyles.modal} max-h-[90vh] flex flex-col`}
      >
        {/* Top Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full opacity-60 hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6 pr-8">
          <div className={`p-2.5 rounded-2xl border ${themeStyles.badge}`}>
            <History className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Search History Vault</h2>
            <p className="text-xs opacity-50">
              {historyItems.length} total recorded {historyItems.length === 1 ? 'search' : 'searches'}
            </p>
          </div>
        </div>

        {/* Action feedback toast */}
        {actionFeedback && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 text-xs flex items-center gap-2 animate-fade-in">
            <Check className="w-4 h-4 flex-shrink-0" />
            <span>{actionFeedback}</span>
          </div>
        )}

        {/* Timeframe Delete Buttons Panel */}
        <div className="mb-5 p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-current border-opacity-10 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider opacity-60 flex items-center gap-1.5">
              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
              <span>Clear History by Timeframe:</span>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {/* Delete Today */}
            <button
              onClick={() => handleDeleteTimeframe('today', 'today')}
              disabled={historyItems.length === 0}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-current border-opacity-10 bg-black/5 dark:bg-white/5 hover:bg-rose-500/15 hover:text-rose-500 hover:border-rose-500/30 transition-all font-medium disabled:opacity-30 disabled:pointer-events-none"
              title="Delete searches recorded today"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Today</span>
            </button>

            {/* Delete 1 Month */}
            <button
              onClick={() => handleDeleteTimeframe('1month', 'the past 1 month')}
              disabled={historyItems.length === 0}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-current border-opacity-10 bg-black/5 dark:bg-white/5 hover:bg-rose-500/15 hover:text-rose-500 hover:border-rose-500/30 transition-all font-medium disabled:opacity-30 disabled:pointer-events-none"
              title="Delete searches recorded in the past 30 days"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>1 Month</span>
            </button>

            {/* Delete 3 Months */}
            <button
              onClick={() => handleDeleteTimeframe('3months', 'the past 3 months')}
              disabled={historyItems.length === 0}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-current border-opacity-10 bg-black/5 dark:bg-white/5 hover:bg-rose-500/15 hover:text-rose-500 hover:border-rose-500/30 transition-all font-medium disabled:opacity-30 disabled:pointer-events-none"
              title="Delete searches recorded in the past 90 days"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>3 Months</span>
            </button>

            {/* Delete All History */}
            {confirmDeleteAll ? (
              <button
                onClick={() => handleDeleteTimeframe('all', 'all time')}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-rose-600 text-white font-semibold transition-all shadow-md animate-pulse"
                title="Confirm wiping all search history"
              >
                <span>Confirm All?</span>
              </button>
            ) : (
              <button
                onClick={() => setConfirmDeleteAll(true)}
                disabled={historyItems.length === 0}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-500 hover:bg-rose-600 hover:text-white transition-all font-medium disabled:opacity-30 disabled:pointer-events-none"
                title="Wipe entire search archive"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete All</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Input */}
        {historyItems.length > 0 && (
          <div className="relative mb-3 flex-shrink-0">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 opacity-40 pointer-events-none" />
            <input
              type="text"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Search across history entries..."
              className={`w-full pl-9 pr-8 py-2 rounded-xl border outline-none text-xs ${themeStyles.input}`}
            />
            {filterText && (
              <button
                onClick={() => setFilterText('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full opacity-40 hover:opacity-100 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        )}

        {/* Search Items Scrollable List */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 divide-y divide-current divide-opacity-5">
          {filteredItems.length === 0 ? (
            <div className="py-16 text-center opacity-40">
              <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs font-medium">
                {historyItems.length === 0
                  ? 'Your search history is currently empty'
                  : 'No matching searches found'}
              </p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0 pr-3">
                  <div className={`p-1.5 rounded-lg bg-black/5 dark:bg-white/5 ${themeStyles.accentText} opacity-70 group-hover:opacity-100 flex-shrink-0`}>
                    <Search className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-semibold block truncate leading-tight">
                      {item.query}
                    </span>
                    <span className="text-[10px] opacity-40 font-mono block mt-0.5">
                      {formatTimestamp(item.timestamp)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleRemoveSingle(item)}
                  className="p-1.5 rounded-lg opacity-40 hover:opacity-100 hover:bg-rose-500/20 hover:text-rose-500 transition-all flex-shrink-0"
                  title="Remove this query"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="mt-4 pt-3 border-t border-current border-opacity-10 flex items-center justify-between text-[11px] opacity-50 font-mono">
          <span>{filteredItems.length} of {historyItems.length} shown</span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl border border-current border-opacity-20 hover:opacity-100 transition-opacity"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
