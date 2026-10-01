import { supabase } from './supabase.js';
import { addSearchQuery } from './searchHistoryService.js';
import { sanitizeBookPayload, safeLocalStorageSet, sanitizeString, sanitizeNumber, isSafeImageUrl } from './securityUtils.js';
import { getProfileBooksKey, getActiveProfileId } from './profileService.js';
const INITIAL_STARTER_BOOKS = [
  {
    id: 'starter-1',
    title: 'Dune',
    author: 'Frank Herbert',
    genre: 'Science Fiction',
    category: 'Science Fiction',
    total_pages: 688,
    pages_read: 275,
    thumbnail_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600',
    notes: 'A masterpiece of speculative sci-fi worldbuilding. The spice must flow.',
  },
  {
    id: 'starter-2',
    title: 'Atomic Habits',
    author: 'James Clear',
    genre: 'Self-Improvement',
    category: 'Self-Improvement',
    total_pages: 320,
    pages_read: 190,
    thumbnail_url: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777f?auto=format&fit=crop&q=80&w=600',
    notes: 'Tiny changes, remarkable results. 1% better every day compounding effect.',
  },
  {
    id: 'starter-3',
    title: 'The Pragmatic Programmer',
    author: 'David Thomas, Andrew Hunt',
    genre: 'Technology',
    category: 'Technology',
    total_pages: 352,
    pages_read: 352,
    thumbnail_url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=600',
    notes: 'Essential reading for any software engineer. Care about your craft.',
  },
  {
    id: 'starter-4',
    title: 'Neuromancer',
    author: 'William Gibson',
    genre: 'Cyberpunk',
    category: 'Cyberpunk',
    total_pages: 271,
    pages_read: 85,
    thumbnail_url: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=600',
    notes: 'The sky above the port was the color of television, tuned to a dead channel.',
  },
];

// Check if user has provided genuine, reachable Supabase credentials
export function isSupabaseConnected() {
  const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {};
  const url = env.VITE_SUPABASE_URL;
  const key = env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return false;
  if (url.includes('your-project-id') || url.includes('placeholder')) return false;
  if (key.includes('your-anon-key') || key.includes('placeholder')) return false;
  return url.startsWith('https://');
}

// Read current cache from localStorage instantly (strictly isolated per profile)
export function getLocalCache(targetProfileId) {
  try {
    const activeId = targetProfileId || getActiveProfileId();
    const key = `antigravity_books_${activeId}`;
    const raw = localStorage.getItem(key);
    
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    }

    // Only the default guest profile is seeded or legacy-migrated
    if (activeId === 'profile-guest') {
      const legacy = localStorage.getItem('antigravity_books');
      if (legacy) {
        try {
          const parsed = JSON.parse(legacy);
          if (Array.isArray(parsed) && parsed.length > 0) {
            safeLocalStorageSet(key, legacy);
            return parsed;
          }
        } catch {}
      }
      safeLocalStorageSet(key, JSON.stringify(INITIAL_STARTER_BOOKS));
      return INITIAL_STARTER_BOOKS;
    }

    // Any other profile starts with an isolated empty bookshelf ([]), never copying from others
    safeLocalStorageSet(key, JSON.stringify([]));
    return [];
  } catch (e) {
    console.error('Error reading local cache:', e);
    return [];
  }
}

// Save to local cache with safe storage wrapper (strictly isolated per profile)
export function setLocalCache(books, targetProfileId) {
  try {
    const activeId = targetProfileId || getActiveProfileId();
    const key = `antigravity_books_${activeId}`;
    safeLocalStorageSet(key, JSON.stringify(books));
  } catch (e) {
    console.error('Error writing local cache:', e);
  }
}

// Fast timeout wrapper to prevent slow network hanging UI
function withTimeout(promise, ms = 2500) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Network timeout')), ms)),
  ]);
}

/**
 * Optimistic Fast Add Book
 * Sanitizes all input fields against XSS, payload stuffing and malformed protocols
 */
export async function fastAddBook(bookData) {
  const sanitized = sanitizeBookPayload(bookData);
  const localId = 'book-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
  const newBook = {
    id: localId,
    ...sanitized,
    created_at: new Date().toISOString(),
  };

  // 1. Optimistic instant commit (< 1ms)
  const current = getLocalCache();
  const updated = [newBook, ...current.filter((b) => b.id !== localId)];
  setLocalCache(updated);

  // Trigger UI event immediately
  window.dispatchEvent(new CustomEvent('antigravity:books-updated', { detail: { type: 'add', book: newBook } }));

  // Automatically save added book's name in search history
  if (newBook.title) {
    addSearchQuery(newBook.title);
  }

  // 2. Background cloud synchronization (non-blocking)
  if (isSupabaseConnected()) {
    withTimeout(
      supabase
        .from('books')
        .insert([{
          title: newBook.title,
          author: newBook.author,
          total_pages: newBook.total_pages,
          pages_read: newBook.pages_read,
          thumbnail_url: newBook.thumbnail_url,
          notes: newBook.notes,
        }])
        .select()
    )
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          // Replace temporary local ID with Supabase ID
          const cloudBook = data[0];
          const syncCurrent = getLocalCache();
          const reconciled = syncCurrent.map((b) => (b.id === localId ? cloudBook : b));
          setLocalCache(reconciled);
          window.dispatchEvent(new CustomEvent('antigravity:books-updated', { detail: { type: 'reconciled', book: cloudBook } }));
        }
      })
      .catch((err) => {
        console.warn('Background Supabase insert skipped/deferred:', err.message);
      });
  }

  return newBook;
}

/**
 * Optimistic Fast Update Book (e.g. pages_read & notes)
 * Validates and sanitizes update inputs
 */
export async function fastUpdateBook(bookId, updates) {
  if (!bookId || !updates || typeof updates !== 'object') return null;

  // Sanitize updates
  const safeUpdates = {};
  if (updates.title !== undefined) safeUpdates.title = sanitizeString(updates.title, 200);
  if (updates.author !== undefined) safeUpdates.author = sanitizeString(updates.author, 150);
  if (updates.genre !== undefined) safeUpdates.genre = sanitizeString(updates.genre, 60);
  if (updates.category !== undefined) safeUpdates.category = sanitizeString(updates.category, 60);
  if (updates.total_pages !== undefined) safeUpdates.total_pages = sanitizeNumber(updates.total_pages, 1, 50000, 250);
  if (updates.pages_read !== undefined) {
    const maxPages = safeUpdates.total_pages || 50000;
    safeUpdates.pages_read = sanitizeNumber(updates.pages_read, 0, maxPages, 0);
  }
  if (updates.thumbnail_url !== undefined) {
    safeUpdates.thumbnail_url = isSafeImageUrl(updates.thumbnail_url) ? updates.thumbnail_url.trim() : '';
  }
  if (updates.notes !== undefined) safeUpdates.notes = sanitizeString(updates.notes, 5000);

  // 1. Optimistic instant update (< 1ms)
  const current = getLocalCache();
  let updatedBook = null;
  const updated = current.map((b) => {
    if (b.id === bookId) {
      updatedBook = { ...b, ...safeUpdates };
      return updatedBook;
    }
    return b;
  });

  if (updatedBook) {
    setLocalCache(updated);
    window.dispatchEvent(
      new CustomEvent('antigravity:books-updated', { detail: { type: 'update', book: updatedBook } })
    );
  }

  // 2. Background sync
  if (isSupabaseConnected() && !String(bookId).startsWith('book-') && !String(bookId).startsWith('starter-')) {
    const cloudUpdates = {};
    if (safeUpdates.title !== undefined) cloudUpdates.title = safeUpdates.title;
    if (safeUpdates.author !== undefined) cloudUpdates.author = safeUpdates.author;
    if (safeUpdates.total_pages !== undefined) cloudUpdates.total_pages = safeUpdates.total_pages;
    if (safeUpdates.pages_read !== undefined) cloudUpdates.pages_read = safeUpdates.pages_read;
    if (safeUpdates.thumbnail_url !== undefined) cloudUpdates.thumbnail_url = safeUpdates.thumbnail_url;
    if (safeUpdates.notes !== undefined) cloudUpdates.notes = safeUpdates.notes;

    if (Object.keys(cloudUpdates).length > 0) {
      withTimeout(
        supabase
          .from('books')
          .update(cloudUpdates)
          .eq('id', bookId)
      ).catch((err) => {
        console.warn('Background Supabase update skipped/deferred:', err.message);
      });
    }
  }

  return updatedBook;
}

/**
 * Optimistic Fast Delete Book
 */
export async function fastDeleteBook(bookId) {
  // 1. Instant local removal (< 1ms)
  const current = getLocalCache();
  const filtered = current.filter((b) => b.id !== bookId);
  setLocalCache(filtered);
  window.dispatchEvent(
    new CustomEvent('antigravity:books-updated', { detail: { type: 'delete', bookId } })
  );

  // 2. Background cloud deletion
  if (isSupabaseConnected() && !String(bookId).startsWith('book-') && !String(bookId).startsWith('starter-')) {
    withTimeout(
      supabase
        .from('books')
        .delete()
        .eq('id', bookId)
    ).catch((err) => {
      console.warn('Background Supabase delete skipped/deferred:', err.message);
    });
  }

  return true;
}

/**
 * Synchronize Library State (Called on load and by Top-Right Refresh Button)
 */
export async function syncLibraryState(targetProfileId) {
  const activeId = targetProfileId || getActiveProfileId();
  const local = getLocalCache(activeId);

  if (!isSupabaseConnected()) {
    return { books: local, source: 'local', syncedAt: new Date() };
  }

  try {
    const { data, error } = await withTimeout(
      supabase.from('books').select('*').eq('profile_id', activeId).order('id', { ascending: false }),
      3000
    );

    if (error || !data) {
      throw error || new Error('No data received');
    }

    if (data.length > 0) {
      setLocalCache(data, activeId);
      window.dispatchEvent(new CustomEvent('antigravity:books-updated', { detail: { type: 'sync', books: data, profileId: activeId } }));
      return { books: data, source: 'supabase', syncedAt: new Date() };
    }

    return { books: local, source: 'supabase-empty', syncedAt: new Date() };
  } catch (err) {
    console.warn('Cloud sync error/timeout, using local cache:', err.message);
    return { books: local, source: 'local-fallback', syncedAt: new Date() };
  }
}
