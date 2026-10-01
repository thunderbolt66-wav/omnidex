import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDebounce } from 'use-debounce';
import {
  Search,
  Loader2,
  BookPlus,
  Check,
  Sparkles,
  Globe,
  Filter,
  ArrowUpDown,
  Library,
  BookOpen,
  Layers,
  History,
  Trash2,
  Clock,
  X,
} from 'lucide-react';
import { useSettingsStore } from '../store/useSettingsStore';
import {
  searchBooksAlgorithm,
  applySortToResults,
  SEARCH_PROVIDERS,
  SEARCH_FILTERS,
  SEARCH_SORTS,
} from '../lib/bookSearchAlgorithm';
import { fastAddBook } from '../lib/bookSyncService';
import {
  getSearchHistory,
  addSearchQuery,
  removeSearchQuery,
  clearSearchHistory,
} from '../lib/searchHistoryService';
import { getThemeClasses } from '../lib/themeStyles';

const QUICK_TAGS = ['Dune', 'Frankenstein', '1984', 'Atomic Habits', 'Cyberpunk', 'Philosophy'];

export default function OmniSearch({ onBookAdded, onOpenManualModal }) {
  const [query, setQuery] = useState('');
  const [provider, setProvider] = useState('all'); // 'all' | 'openlibrary' | 'gutenberg' | 'googlebooks' | 'archive' | 'curated'
  const [filterBy, setFilterBy] = useState('all'); // 'all' | 'title' | 'author' | 'subject'
  const [sortBy, setSortBy] = useState('relevance'); // 'relevance' | 'year_desc' | 'year_asc' | 'title_asc' | 'pages_desc' | 'pages_asc'

  // Fast 250ms debounce
  const [debouncedQuery] = useDebounce(query, 250);
  const [results, setResults] = useState([]);
  const [searchHistory, setSearchHistory] = useState(() => getSearchHistory());
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeSource, setActiveSource] = useState('All Sources');
  const [isCuratedMode, setIsCuratedMode] = useState(true);
  const [statusMessage, setStatusMessage] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const searchContainerRef = useRef(null);
  const abortControllerRef = useRef(null);
  const theme = useSettingsStore((state) => state.theme);
  const themeStyles = getThemeClasses(theme);

  // Sync search history changes from localStorage or Settings or Profile switch
  useEffect(() => {
    const updateHistory = () => setSearchHistory(getSearchHistory());
    const handleProfileSwitch = () => {
      setSearchHistory(getSearchHistory());
      setQuery('');
      setResults([]);
      setIsOpen(false);
    };

    window.addEventListener('antigravity:search-history-updated', updateHistory);
    window.addEventListener('antigravity:profile-switched', handleProfileSwitch);
    return () => {
      window.removeEventListener('antigravity:search-history-updated', updateHistory);
      window.removeEventListener('antigravity:profile-switched', handleProfileSwitch);
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Main search algorithm execution
  const executeSearch = useCallback(
    async (
      searchQuery,
      currentFilter = filterBy,
      currentSort = sortBy,
      currentProvider = provider
    ) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      setLoading(true);
      try {
        const response = await searchBooksAlgorithm(
          searchQuery,
          currentFilter,
          currentSort,
          currentProvider,
          abortController.signal
        );
        setResults(response.results);
        setActiveSource(response.source);
        setIsCuratedMode(response.isCurated);
        setSelectedIndex(-1);
        setIsOpen(true);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Search algorithm error:', err);
        }
      } finally {
        setLoading(false);
      }
    },
    [filterBy, sortBy, provider]
  );

  // Trigger search when debounced query, filter, or provider changes
  // NOTE: Does NOT record search history on every keystroke or word
  useEffect(() => {
    executeSearch(debouncedQuery, filterBy, sortBy, provider);
  }, [debouncedQuery, filterBy, provider, executeSearch]);

  // Instant in-memory re-sort
  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    setResults((prev) => applySortToResults(prev, newSort));
  };

  // Filter change handler
  const handleFilterChange = (newFilter) => {
    setFilterBy(newFilter);
    executeSearch(query, newFilter, sortBy, provider);
  };

  // Provider change handler
  const handleProviderChange = (newProvider) => {
    setProvider(newProvider);
    executeSearch(query, filterBy, sortBy, newProvider);
  };

  // Instant book addition (< 1ms optimistic commit)
  const handleSelectBook = async (book) => {
    setSavingId(book.id);

    // Save the added book's name in search history when book is added
    if (book.title) {
      addSearchQuery(book.title.trim());
      setSearchHistory(getSearchHistory());
    }

    const newBookPayload = {
      title: book.title,
      author: book.author,
      genre: book.genre || book.category || 'General',
      category: book.genre || book.category || 'General',
      total_pages: Number(book.total_pages) > 0 ? Number(book.total_pages) : 250,
      thumbnail_url: book.thumbnail_url,
      pages_read: 0,
      notes: book.description ? book.description.slice(0, 300) : '',
    };

    const insertedBook = await fastAddBook(newBookPayload);

    // Clear search autonomously per requirement
    setQuery('');
    setResults([]);
    setIsOpen(false);
    setSavingId(null);

    setStatusMessage(`Added "${book.title.slice(0, 24)}${book.title.length > 24 ? '...' : ''}" to library!`);
    setTimeout(() => setStatusMessage(null), 3000);

    if (onBookAdded) {
      onBookAdded(insertedBook);
    }
  };

  // Keyboard navigation & Enter execution
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmed = query.trim();
      // Record search history ONLY when Enter is pressed
      if (trimmed.length >= 2) {
        addSearchQuery(trimmed);
        setSearchHistory(getSearchHistory());
      }
      if (isOpen && selectedIndex >= 0 && selectedIndex < results.length) {
        handleSelectBook(results[selectedIndex]);
      } else {
        executeSearch(trimmed, filterBy, sortBy, provider);
      }
      return;
    }

    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const getSourceBadgeStyle = (source) => {
    if (source === 'Project Gutenberg') {
      return 'bg-amber-500/15 text-amber-500 border-amber-500/30';
    }
    if (source === 'Internet Archive') {
      return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
    }
    if (source === 'Google Books') {
      return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
    }
    if (source === 'Curated Vault') {
      return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
    }
    return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto z-40" ref={searchContainerRef}>
      {/* Search Input Bar with embedded controls */}
      <div className="relative flex items-center">
        {/* Left Filter Selector Dropdown - Words visible, outline/padding invisible until pointer hovers */}
        <div className="absolute left-2.5 z-10 flex items-center">
          <div
            className="group/filter relative flex items-center rounded-lg border border-transparent hover:border-current/15 hover:bg-black/5 dark:hover:bg-white/10 transition-all duration-150"
          >
            <Filter className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 opacity-70 group-hover/filter:opacity-100 pointer-events-none transition-opacity" />
            <select
              value={filterBy}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="appearance-none bg-transparent text-current text-xs font-medium pl-6.5 pr-2.5 py-1 rounded-lg cursor-pointer outline-none opacity-80 hover:opacity-100 transition-opacity"
              title="Filter search field"
            >
              {SEARCH_FILTERS.map((f) => (
                <option key={f.id} value={f.id} className="bg-zinc-900 text-zinc-100">
                  {f.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            setSearchHistory(getSearchHistory());
            if (results.length === 0) {
              executeSearch(query, filterBy, sortBy, provider);
            } else {
              setIsOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder=""
          className={`w-full pl-24 pr-24 py-3.5 rounded-2xl border text-xs sm:text-sm outline-none transition-all shadow-sm ${themeStyles.input}`}
        />

        {/* Right side controls: Loading indicator + Clear + Sort Selector */}
        <div className="absolute right-2.5 flex items-center gap-1.5">
          {loading ? (
            <Loader2 className={`w-4 h-4 animate-spin ${themeStyles.accentText} mr-1`} />
          ) : query ? (
            <button
              onClick={() => {
                setQuery('');
                executeSearch('', filterBy, sortBy, provider);
              }}
              className="p-1 rounded-full opacity-50 hover:opacity-100 text-xs transition-opacity mr-1"
              title="Clear search"
            >
              ✕
            </button>
          ) : null}

          {/* Sort Selector Dropdown - Words visible, outline/padding invisible until pointer hovers */}
          <div
            className="group/sort relative flex items-center rounded-lg border border-transparent hover:border-current/15 hover:bg-black/5 dark:hover:bg-white/10 transition-all duration-150"
          >
            <ArrowUpDown className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 opacity-70 group-hover/sort:opacity-100 pointer-events-none transition-opacity" />
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="appearance-none bg-transparent text-current text-[11px] font-medium pl-5.5 pr-2 py-1 rounded-lg cursor-pointer outline-none opacity-80 hover:opacity-100 transition-opacity"
              title="Sort search results"
            >
              {SEARCH_SORTS.map((s) => (
                <option key={s.id} value={s.id} className="bg-zinc-900 text-zinc-100">
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Engine / Data Provider Pills Selector */}
      <div className="flex items-center gap-1.5 mt-2.5 px-1 overflow-x-auto no-scrollbar text-xs">
        <span className="opacity-50 text-[11px] font-mono mr-0.5 flex items-center gap-1 whitespace-nowrap">
          <Library className="w-3 h-3 text-cyan-400" /> Source:
        </span>
        {SEARCH_PROVIDERS.map((p) => {
          const isActive = provider === p.id;
          return (
            <button
              key={p.id}
              onClick={() => handleProviderChange(p.id)}
              className={`px-2.5 py-1 rounded-full border text-[11px] transition-all whitespace-nowrap font-medium ${
                isActive
                  ? 'border-current bg-black/15 dark:bg-white/15 shadow-sm font-semibold'
                  : 'border-current border-opacity-10 bg-black/5 dark:bg-white/5 opacity-60 hover:opacity-100'
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Quick Suggestion Pills */}
      <div className="flex items-center gap-1.5 mt-2 px-1 overflow-x-auto no-scrollbar text-xs">
        <span className="opacity-50 text-[11px] font-mono mr-0.5 flex items-center gap-1 whitespace-nowrap">
          <Sparkles className={`w-3 h-3 ${themeStyles.accentText}`} /> Ideas:
        </span>
        {QUICK_TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => {
              setQuery(tag);
              executeSearch(tag, filterBy, sortBy, provider);
            }}
            className="px-2 py-0.5 rounded-full border border-current border-opacity-10 bg-black/5 dark:bg-white/5 opacity-60 hover:opacity-100 hover:scale-105 transition-all whitespace-nowrap text-[10px]"
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Feedback status banner */}
      {statusMessage && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-medium tracking-wide bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 animate-fade-in shadow-sm">
          <Check className="w-3.5 h-3.5" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Search & Suggestion Dropdown */}
      {isOpen &&
        (results.length > 0 ||
          searchHistory.length > 0 ||
          (!loading && debouncedQuery.trim() !== '')) && (
          <div
            className={`absolute left-0 right-0 mt-2 max-h-96 overflow-y-auto rounded-2xl border divide-y divide-inherit ${themeStyles.dropdown}`}
          >
          {/* ================= PAST 5-7 SEARCHES SECTION ================= */}
          {searchHistory.length > 0 && query.trim() === '' && (
            <div className="p-3 bg-black/5 dark:bg-white/5">
              <div className="flex items-center justify-between px-2 mb-2">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider opacity-70">
                  <History className={`w-3.5 h-3.5 ${themeStyles.accentText}`} />
                  <span>Recent Searches ({searchHistory.length})</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    clearSearchHistory();
                  }}
                  className="flex items-center gap-1 text-[11px] text-rose-500 hover:text-rose-600 font-medium transition-colors p-1"
                  title="Clear all recent searches"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear Searches</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-1">
                {searchHistory.map((item) => (
                  <div
                    key={item}
                    onClick={() => {
                      setQuery(item);
                      executeSearch(item, filterBy, sortBy, provider);
                    }}
                    className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer text-xs group transition-colors"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Clock className="w-3.5 h-3.5 opacity-40 group-hover:opacity-80 flex-shrink-0" />
                      <span className="truncate font-medium">{item}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSearchQuery(item);
                      }}
                      className="p-1 rounded-full opacity-40 hover:opacity-100 hover:text-rose-500 transition-opacity"
                      title="Remove this search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= RESULTS / SUGGESTIONS HEADER ================= */}
          {results.length > 0 && (
            <div className="p-2.5 px-4 flex items-center justify-between text-xs opacity-60">
              <div className="flex items-center gap-1.5 uppercase tracking-wider font-semibold text-[10px]">
                {isCuratedMode ? (
                  <>
                    <Sparkles className={`w-3 h-3 ${themeStyles.accentText}`} />
                    <span>Curated Masterpiece Recommendations</span>
                  </>
                ) : (
                  <>
                    <Globe className="w-3 h-3 text-emerald-400" />
                    <span>
                      {activeSource} • Sorted by{' '}
                      {SEARCH_SORTS.find((s) => s.id === sortBy)?.label}
                    </span>
                  </>
                )}
              </div>
              <span className="text-[10px] font-mono opacity-50">
                {results.length} matches
              </span>
            </div>
          )}

          {/* ================= EMPTY RESULTS STATE ================= */}
          {results.length === 0 && !loading && debouncedQuery.trim() !== '' && (
            <div className="p-6 text-center">
              <p className="text-xs opacity-60 mb-3">
                No matching volumes found in online catalogs for "{debouncedQuery}".
              </p>
              {onOpenManualModal && (
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onOpenManualModal(debouncedQuery);
                  }}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold shadow-md transition-all active:scale-95 ${themeStyles.buttonPrimary}`}
                >
                  <BookPlus className="w-3.5 h-3.5" />
                  <span>Add "{debouncedQuery.slice(0, 20)}" Manually</span>
                </button>
              )}
            </div>
          )}

          {/* ================= RESULTS LIST ================= */}
          {results.map((book, idx) => {
            const isSaving = savingId === book.id;
            const isKeyboardSelected = selectedIndex === idx;

            return (
              <div
                key={book.id || idx}
                onClick={() => !isSaving && handleSelectBook(book)}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`flex items-center gap-3.5 p-3 cursor-pointer transition-colors ${
                  isKeyboardSelected ? 'bg-black/10 dark:bg-white/10' : themeStyles.dropdownHover
                } ${isSaving ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <img
                  src={book.thumbnail_url}
                  alt={book.title}
                  className="w-11 h-16 object-cover rounded-md shadow-sm flex-shrink-0 bg-zinc-800"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://placehold.co/100x150/222/fff?text=${encodeURIComponent(
                      book.title.slice(0, 5)
                    )}`;
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold truncate leading-snug">{book.title}</h4>
                    {book.source && (
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded-full border font-mono whitespace-nowrap ${getSourceBadgeStyle(
                          book.source
                        )}`}
                      >
                        {book.source}
                      </span>
                    )}
                  </div>
                  <p className="text-xs opacity-70 truncate mt-0.5">{book.author}</p>
                  <div className="flex items-center gap-2 mt-1.5 text-[11px] opacity-60">
                    {(book.genre || book.category) && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium whitespace-nowrap border ${themeStyles.badge}`}>
                        {book.genre || book.category}
                      </span>
                    )}
                    <span>{book.total_pages} pages</span>
                    {book.publishedDate && <span>• {book.publishedDate.slice(0, 4)}</span>}
                  </div>
                </div>

                <div className="flex-shrink-0 pr-2">
                  {isSaving ? (
                    <Loader2 className={`w-4 h-4 animate-spin ${themeStyles.accentText}`} />
                  ) : (
                    <div className="p-1.5 rounded-lg opacity-40 hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10 transition-all">
                      <BookPlus className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* ================= OPTIONAL BOTTOM PROMPT TO ADD CUSTOM VOLUME ================= */}
          {results.length > 0 && !isCuratedMode && onOpenManualModal && (
            <div className="p-2.5 text-center border-t border-current border-opacity-10 bg-black/5 dark:bg-white/5">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onOpenManualModal(debouncedQuery);
                }}
                className={`inline-flex items-center gap-1.5 text-xs font-medium transition-colors p-1 ${themeStyles.accentText} hover:underline`}
              >
                <BookPlus className="w-3.5 h-3.5" />
                <span>Can't find your edition? Add custom book manually</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
