/**
 * Security & Input Validation Utilities for Omnidex
 * Guards against XSS, Prototype Pollution, Malformed URLs, Buffer Overflows & Quota Exhaustion
 */

const ALLOWED_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
]);

const MAX_IMAGE_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 Megabytes

/**
 * Validates that an image URL strictly conforms to secure HTTP(S) or valid data-URI image formats.
 * Blocks dangerous schemes (javascript:, vbscript:, data:text/html, file:) and control chars.
 */
export function isSafeImageUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();

  // Strip/check control characters
  if (/[\x00-\x1F\x7F]/.test(trimmed)) return false;

  // Allow safe base64 image data-uris (excluding SVG)
  if (trimmed.startsWith('data:image/')) {
    const isSafeImageMime =
      trimmed.startsWith('data:image/jpeg;base64,') ||
      trimmed.startsWith('data:image/png;base64,') ||
      trimmed.startsWith('data:image/webp;base64,') ||
      trimmed.startsWith('data:image/gif;base64,') ||
      trimmed.startsWith('data:image/avif;base64,');
    return isSafeImageMime;
  }

  // Enforce HTTP / HTTPS scheme
  try {
    const parsed = new URL(trimmed, window.location.origin);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }
    // Block protocol-relative URLs that don't have host
    if (!parsed.hostname) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Cleans string input, removes control characters, and enforces length bounds.
 */
export function sanitizeString(input, maxLength = 255) {
  if (input === null || input === undefined) return '';
  const str = String(input);
  // Strip control characters (except common whitespace: newline, tab, cr)
  const cleaned = str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim();
  return cleaned.slice(0, maxLength);
}

/**
 * Validates and clamps numerical inputs to safe finite ranges.
 */
export function sanitizeNumber(input, min = 0, max = 100000, fallback = 0) {
  const num = Number(input);
  if (!Number.isFinite(num) || Number.isNaN(num)) return fallback;
  return Math.min(Math.max(Math.floor(num), min), max);
}

/**
 * Strict file validation for user cover uploads.
 */
export function validateImageFile(file) {
  if (!file) {
    return { valid: false, error: 'No file selected.' };
  }

  if (!(file instanceof File || file instanceof Blob)) {
    return { valid: false, error: 'Invalid file object.' };
  }

  if (file.size > MAX_IMAGE_FILE_SIZE_BYTES) {
    return { valid: false, error: 'Image exceeds maximum size of 10MB.' };
  }

  const mime = (file.type || '').toLowerCase();
  if (!ALLOWED_IMAGE_MIME_TYPES.has(mime)) {
    return {
      valid: false,
      error: 'Unsupported image format. Allowed formats: JPEG, PNG, WebP, GIF, AVIF (SVG disallowed for security).',
    };
  }

  return { valid: true };
}

/**
 * Standardized Book Sanitizer ensuring integrity across storage and cloud sync.
 */
export function sanitizeBookPayload(bookData) {
  if (!bookData || typeof bookData !== 'object') {
    throw new Error('Invalid book payload');
  }

  const title = sanitizeString(bookData.title || 'Untitled', 200);
  const author = sanitizeString(bookData.author || 'Unknown Author', 150);
  const genre = sanitizeString(bookData.genre || bookData.category || 'General', 60);
  const total_pages = sanitizeNumber(bookData.total_pages, 1, 50000, 250);
  const pages_read = sanitizeNumber(bookData.pages_read, 0, total_pages, 0);
  const notes = sanitizeString(bookData.notes, 5000);

  // Validate thumbnail_url
  let thumbnail_url = '';
  if (isSafeImageUrl(bookData.thumbnail_url)) {
    thumbnail_url = bookData.thumbnail_url.trim();
  }

  return {
    title: title || 'Untitled',
    author: author || 'Unknown Author',
    genre: genre || 'General',
    category: genre || 'General',
    total_pages,
    pages_read,
    thumbnail_url,
    notes,
  };
}

/**
 * Safe LocalStorage setter with QuotaExceededError protection and fallback cleanup.
 */
export function safeLocalStorageSet(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (err) {
    console.warn(`LocalStorage write failure on key "${key}":`, err);
    // If quota exceeded, attempt safe prune of non-essential temporary caches
    if (err && (err.name === 'QuotaExceededError' || err.code === 22)) {
      try {
        // Prune old search history items if storage is cramped
        const historyRaw = localStorage.getItem('antigravity_search_history');
        if (historyRaw) {
          const parsed = JSON.parse(historyRaw);
          if (Array.isArray(parsed) && parsed.length > 50) {
            localStorage.setItem('antigravity_search_history', JSON.stringify(parsed.slice(0, 30)));
            // Retry target save
            localStorage.setItem(key, value);
            return true;
          }
        }
      } catch (pruneErr) {
        console.error('Failed to prune storage after quota exceeded:', pruneErr);
      }
    }
    return false;
  }
}
