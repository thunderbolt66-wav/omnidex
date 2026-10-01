import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Upload,
  Link,
  BookPlus,
  Sparkles,
  Check,
  AlertCircle,
  Image as ImageIcon,
  Palette,
  Loader2,
  Pencil,
} from 'lucide-react';
import { useSettingsStore } from '../store/useSettingsStore';
import { fastAddBook, fastUpdateBook } from '../lib/bookSyncService';
import { getThemeClasses } from '../lib/themeStyles';
import {
  validateImageFile,
  isSafeImageUrl,
  sanitizeString,
  sanitizeNumber,
} from '../lib/securityUtils';

const GENRE_SUGGESTIONS = [
  'Science Fiction',
  'Classic Literature',
  'Philosophy',
  'Cyberpunk',
  'Fantasy',
  'Dystopian',
  'Technology',
  'Self-Improvement',
  'History',
  'Mystery',
];

const PRESET_COVER_PALETTES = [
  { name: 'Amber Dusk', bg: 'linear-gradient(135deg, #1e1b4b 0%, #431407 100%)', text: '#fde68a' },
  { name: 'Emerald Pine', bg: 'linear-gradient(135deg, #022c22 0%, #064e3b 100%)', text: '#6ee7b7' },
  { name: 'Onyx Gold', bg: 'linear-gradient(135deg, #09090b 0%, #27272a 100%)', text: '#fbbf24' },
  { name: 'Nordic Frost', bg: 'linear-gradient(135deg, #082f49 0%, #0c4a6e 100%)', text: '#38bdf8' },
  { name: 'Rose Velvet', bg: 'linear-gradient(135deg, #4c0519 0%, #1e1b4b 100%)', text: '#fda4af' },
  { name: 'Vintage Parchment', bg: 'linear-gradient(135deg, #eae0c8 0%, #d4c5a9 100%)', text: '#433422' },
];

/**
 * Resizes any image (File or URL) to exact 2:3 aspect ratio (400x600) using HTML5 Canvas
 */
export async function resizeImageToBookCover(fileOrUrl, targetWidth = 400, targetHeight = 600) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');

        // Dark neutral background
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, targetWidth, targetHeight);

        // Calculate aspect-fill scale
        const scale = Math.max(targetWidth / img.width, targetHeight / img.height);
        const x = (targetWidth - img.width * scale) / 2;
        const y = (targetHeight - img.height * scale) / 2;

        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

        // Subtle vignette shadow for realistic book spine depth
        const gradient = ctx.createLinearGradient(0, 0, 30, 0);
        gradient.addColorStop(0, 'rgba(0,0,0,0.4)');
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 30, targetHeight);

        resolve(canvas.toDataURL('image/jpeg', 0.88));
      } catch (e) {
        // In case of CORS canvas taint on foreign URLs, fallback to original URL
        if (typeof fileOrUrl === 'string') resolve(fileOrUrl);
        else reject(e);
      }
    };

    img.onerror = () => {
      if (typeof fileOrUrl === 'string') resolve(fileOrUrl);
      else reject(new Error('Failed to load image'));
    };

    if (typeof fileOrUrl === 'string') {
      if (!isSafeImageUrl(fileOrUrl)) {
        reject(new Error('Insecure or invalid image URL scheme.'));
        return;
      }
      img.src = fileOrUrl;
    } else if (fileOrUrl instanceof File || fileOrUrl instanceof Blob) {
      const validation = validateImageFile(fileOrUrl);
      if (!validation.valid) {
        reject(new Error(validation.error));
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => (img.src = e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(fileOrUrl);
    } else {
      reject(new Error('Invalid image source'));
    }
  });
}

/**
 * Generates an ambient minimalist book cover on canvas
 */
export function generateTypographicCover(title, author, palette) {
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 600;
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = palette.text === '#433422' ? '#eae0c8' : '#0c121e';
  ctx.fillRect(0, 0, 400, 600);

  // Border frame
  ctx.strokeStyle = palette.text;
  ctx.lineWidth = 2;
  ctx.strokeRect(20, 20, 360, 560);
  ctx.strokeRect(26, 26, 348, 548);

  // Title
  ctx.fillStyle = palette.text;
  ctx.font = 'bold 28px serif';
  ctx.textAlign = 'center';

  const words = (title || 'Untitled Volume').split(' ');
  let line = '';
  let y = 220;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > 300 && n > 0) {
      ctx.fillText(line.trim(), 200, y);
      line = words[n] + ' ';
      y += 36;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), 200, y);

  // Divider
  ctx.fillStyle = palette.text;
  ctx.fillRect(150, y + 25, 100, 2);

  // Author
  ctx.font = 'italic 18px sans-serif';
  ctx.fillText(author || 'Unknown Author', 200, y + 60);

  // Spine shadow
  const spine = ctx.createLinearGradient(0, 0, 25, 0);
  spine.addColorStop(0, 'rgba(0,0,0,0.4)');
  spine.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = spine;
  ctx.fillRect(0, 0, 25, 600);

  return canvas.toDataURL('image/jpeg', 0.9);
}

export default function ManualBookModal({
  isOpen,
  onClose,
  onBookAdded,
  onBookUpdated,
  initialTitle = '',
  bookToEdit = null,
}) {
  const theme = useSettingsStore((state) => state.theme);
  const themeStyles = getThemeClasses(theme);

  const isEditMode = Boolean(bookToEdit);

  const [title, setTitle] = useState(initialTitle || '');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState('Science Fiction');
  const [totalPages, setTotalPages] = useState('320');
  const [pagesRead, setPagesRead] = useState('0');
  const [publishedDate, setPublishedDate] = useState(String(new Date().getFullYear()));
  const [notes, setNotes] = useState('');

  // Image source state
  const [imageTab, setImageTab] = useState('file'); // 'file' | 'url' | 'palette'
  const [imageUrl, setImageUrl] = useState('');
  const [coverPreview, setCoverPreview] = useState('');
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [selectedPalette, setSelectedPalette] = useState(PRESET_COVER_PALETTES[0]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  // Sync state when modal is opened or bookToEdit changes
  useEffect(() => {
    if (isOpen) {
      if (bookToEdit) {
        setTitle(bookToEdit.title || '');
        setAuthor(bookToEdit.author || '');
        setGenre(bookToEdit.genre || bookToEdit.category || 'General');
        setTotalPages(String(bookToEdit.total_pages || 250));
        setPagesRead(String(bookToEdit.pages_read || 0));
        setPublishedDate(String(bookToEdit.publishedDate || ''));
        setCoverPreview(bookToEdit.thumbnail_url || '');
        setNotes(bookToEdit.notes || '');
        setImageUrl('');
      } else {
        setTitle(initialTitle || '');
        setAuthor('');
        setGenre('Science Fiction');
        setTotalPages('320');
        setPagesRead('0');
        setPublishedDate(String(new Date().getFullYear()));
        setCoverPreview('');
        setNotes('');
        setImageUrl('');
      }
      setErrorMsg('');
    }
  }, [isOpen, bookToEdit, initialTitle]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Generate initial typographic preview if no cover is selected
  useEffect(() => {
    if (!coverPreview && (title || author)) {
      const generated = generateTypographicCover(title, author, selectedPalette);
      setCoverPreview(generated);
    }
  }, [title, author, selectedPalette, coverPreview]);

  if (!isOpen) return null;

  // Handle local file upload with automated 2:3 canvas resizing
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setErrorMsg(validation.error);
      e.target.value = '';
      return;
    }

    setIsProcessingImage(true);
    setErrorMsg('');
    try {
      const resizedDataUrl = await resizeImageToBookCover(file, 400, 600);
      setCoverPreview(resizedDataUrl);
    } catch (err) {
      console.error('Image resize error:', err);
      setErrorMsg(err.message || 'Failed to process image. Please try another file.');
    } finally {
      setIsProcessingImage(false);
    }
  };

  // Handle URL cover input with automated 2:3 resizing
  const handleApplyUrl = async () => {
    const trimmed = imageUrl.trim();
    if (!trimmed) return;

    if (!isSafeImageUrl(trimmed)) {
      setErrorMsg('Invalid or insecure image URL. Only valid http(s) image links are permitted.');
      return;
    }

    setIsProcessingImage(true);
    setErrorMsg('');
    try {
      const resized = await resizeImageToBookCover(trimmed, 400, 600);
      setCoverPreview(resized);
    } catch (err) {
      console.warn('URL cover processing fallback:', err);
      setCoverPreview(trimmed);
    } finally {
      setIsProcessingImage(false);
    }
  };

  // Apply minimalist preset cover
  const handleApplyPalette = (palette) => {
    setSelectedPalette(palette);
    const generated = generateTypographicCover(title, author, palette);
    setCoverPreview(generated);
  };

  // Submit book
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanTitle = sanitizeString(title, 200);
    const cleanAuthor = sanitizeString(author, 150);
    const cleanGenre = sanitizeString(genre, 60) || 'General';
    const cleanNotes = sanitizeString(notes, 5000);

    if (!cleanTitle) {
      setErrorMsg('Book title is required.');
      return;
    }

    if (!cleanAuthor) {
      setErrorMsg('Author name is required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const finalCover =
        coverPreview || generateTypographicCover(cleanTitle, cleanAuthor, selectedPalette);

      const parsedTotal = sanitizeNumber(totalPages, 1, 50000, 250);
      const parsedRead = sanitizeNumber(pagesRead, 0, parsedTotal, 0);

      const payload = {
        title: cleanTitle,
        author: cleanAuthor,
        genre: cleanGenre,
        category: cleanGenre,
        total_pages: parsedTotal,
        pages_read: parsedRead,
        thumbnail_url: isSafeImageUrl(finalCover) ? finalCover : '',
        notes: cleanNotes,
        publishedDate: sanitizeString(publishedDate, 20),
      };

      if (isEditMode && bookToEdit) {
        const updated = await fastUpdateBook(bookToEdit.id, payload);
        if (onBookUpdated) {
          onBookUpdated(updated);
        }
      } else {
        const added = await fastAddBook({
          ...payload,
          source: 'Manual Volume Entry',
        });
        if (onBookAdded) {
          onBookAdded(added);
        }
      }

      onClose();
    } catch (err) {
      console.error('Error saving book:', err);
      setErrorMsg(
        isEditMode
          ? 'Failed to update book. Please check fields.'
          : 'Failed to create book. Please check fields.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      {/* Container Card */}
      <div
        className={`relative w-full max-w-3xl rounded-3xl p-6 sm:p-8 shadow-2xl border transition-all ${themeStyles.modal} max-h-[92vh] overflow-y-auto`}
      >
        {/* Top Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full opacity-60 hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className={`p-2.5 rounded-2xl border ${themeStyles.badge}`}>
            {isEditMode ? <Pencil className="w-5 h-5" /> : <BookPlus className="w-5 h-5" />}
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">
              {isEditMode ? 'Edit Volume Metadata' : 'Add Volume Manually'}
            </h2>
            <p className="text-xs opacity-50">
              {isEditMode
                ? 'Update title, author, genre, pages, logs, or customize the 2:3 cover'
                : 'Customize title, author, genre, reader logs, and auto-resized 2:3 cover'}
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-500 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left: 2:3 Cover Preview with Auto-Resize Badge */}
          <div className="md:col-span-4 flex flex-col items-center">
            <div className="relative w-full max-w-[200px] aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-current border-opacity-15 bg-black/30 group">
              {coverPreview ? (
                <img
                  src={coverPreview}
                  alt="Cover preview"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center opacity-40">
                  <ImageIcon className="w-8 h-8 mb-2" />
                  <span className="text-[11px] font-mono">2:3 Aspect Cover</span>
                </div>
              )}

              {isProcessingImage && (
                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-2 text-white">
                  <Loader2 className={`w-6 h-6 animate-spin ${themeStyles.accentText}`} />
                  <span className="text-[10px] font-mono">Fitting 2:3 Aspect...</span>
                </div>
              )}

              <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/70 text-white text-[9px] font-mono backdrop-blur-md opacity-80">
                2:3 Ratio
              </div>
            </div>

            <span className="text-[11px] opacity-50 mt-3 font-mono text-center">
              Auto-fitted for library shelves
            </span>

            {/* Quick Palette Swatches for Instant Covers */}
            <div className="mt-4 w-full">
              <span className="text-[10px] font-mono opacity-50 uppercase tracking-wider block mb-1.5 text-center">
                Ambient Minimalist Themes:
              </span>
              <div className="flex items-center justify-center gap-1.5 flex-wrap">
                {PRESET_COVER_PALETTES.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPalette(p)}
                    title={p.name}
                    className={`w-6 h-6 rounded-full border transition-all ${
                      selectedPalette.name === p.name ? 'ring-2 ring-current scale-110' : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{ background: p.bg }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right: Metadata Inputs */}
          <div className="md:col-span-8 space-y-4 text-xs">
            {/* Title & Author */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold uppercase tracking-wider opacity-70 mb-1">
                  Volume Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. The Left Hand of Darkness"
                  className={`w-full px-3.5 py-2.5 rounded-xl border outline-none text-xs sm:text-sm ${themeStyles.input}`}
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider opacity-70 mb-1">
                  Author *
                </label>
                <input
                  type="text"
                  required
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="e.g. Ursula K. Le Guin"
                  className={`w-full px-3.5 py-2.5 rounded-xl border outline-none text-xs sm:text-sm ${themeStyles.input}`}
                />
              </div>
            </div>

            {/* Genre & Publication Year */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold uppercase tracking-wider opacity-70 mb-1">
                  Genre / Subject
                </label>
                <input
                  type="text"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  placeholder="e.g. Science Fiction, Classics"
                  className={`w-full px-3.5 py-2.5 rounded-xl border outline-none text-xs sm:text-sm ${themeStyles.input}`}
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider opacity-70 mb-1">
                  Published Year
                </label>
                <input
                  type="text"
                  value={publishedDate}
                  onChange={(e) => setPublishedDate(e.target.value)}
                  placeholder="e.g. 1969"
                  className={`w-full px-3.5 py-2.5 rounded-xl border outline-none text-xs sm:text-sm font-mono ${themeStyles.input}`}
                />
              </div>
            </div>

            {/* Genre quick selector chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              {GENRE_SUGGESTIONS.slice(0, 5).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGenre(g)}
                  className={`px-2 py-0.5 rounded-full border text-[10px] whitespace-nowrap transition-all ${
                    genre === g
                      ? `${themeStyles.badge} font-semibold ring-1 ring-current`
                      : 'border-current border-opacity-10 bg-black/5 dark:bg-white/5 opacity-60 hover:opacity-100'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>

            {/* Total Pages & Pages Read */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold uppercase tracking-wider opacity-70 mb-1">
                  Total Pages
                </label>
                <input
                  type="number"
                  min="1"
                  value={totalPages}
                  onChange={(e) => setTotalPages(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border outline-none text-xs sm:text-sm font-mono ${themeStyles.input}`}
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider opacity-70 mb-1">
                  Pages Read
                </label>
                <input
                  type="number"
                  min="0"
                  max={totalPages}
                  value={pagesRead}
                  onChange={(e) => setPagesRead(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border outline-none text-xs sm:text-sm font-mono ${themeStyles.input}`}
                />
              </div>
            </div>

            {/* Cover Upload / URL Options */}
            <div className="pt-2 border-t border-current border-opacity-10">
              <label className="block font-semibold uppercase tracking-wider opacity-70 mb-1.5">
                Cover Image (Auto-Resized to 2:3)
              </label>

              <div className="flex items-center gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setImageTab('file')}
                  className={`px-3 py-1 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all ${
                    imageTab === 'file'
                      ? `${themeStyles.buttonPrimary} font-semibold shadow-sm`
                      : 'opacity-60 hover:opacity-100 bg-black/5 dark:bg-white/5'
                  }`}
                >
                  <Upload className="w-3 h-3" /> Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setImageTab('url')}
                  className={`px-3 py-1 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all ${
                    imageTab === 'url'
                      ? `${themeStyles.buttonPrimary} font-semibold shadow-sm`
                      : 'opacity-60 hover:opacity-100 bg-black/5 dark:bg-white/5'
                  }`}
                >
                  <Link className="w-3 h-3" /> Image Web URL
                </button>
              </div>

              {imageTab === 'file' ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3.5 rounded-xl border border-dashed border-current border-opacity-20 hover:border-opacity-40 bg-black/5 dark:bg-white/5 cursor-pointer flex items-center justify-center gap-2 text-xs opacity-70 hover:opacity-100 transition-all"
                >
                  <Upload className={`w-4 h-4 ${themeStyles.accentText}`} />
                  <span>Choose file from device (JPEG, PNG, WebP)</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Paste image web link (e.g. https://...)..."
                    className={`flex-1 px-3 py-2 rounded-xl border outline-none text-xs ${themeStyles.input}`}
                  />
                  <button
                    type="button"
                    onClick={handleApplyUrl}
                    disabled={isProcessingImage || !imageUrl.trim()}
                    className={`px-3.5 py-2 rounded-xl font-semibold text-xs transition-all shadow-sm ${themeStyles.buttonPrimary}`}
                  >
                    Fit Cover
                  </button>
                </div>
              )}
            </div>

            {/* Notes / Synopsis */}
            <div>
              <label className="block font-semibold uppercase tracking-wider opacity-70 mb-1">
                Reader Synopsis & Initial Notes
              </label>
              <textarea
                rows="3"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Personal thoughts, quotes, or plot summary..."
                className={`w-full px-3.5 py-2 rounded-xl border outline-none text-xs resize-none ${themeStyles.input}`}
              />
            </div>

            {/* Submit / Cancel Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-current border-opacity-15 opacity-70 hover:opacity-100 text-xs transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2 transition-all shadow-md ${themeStyles.buttonPrimary}`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{isEditMode ? 'Updating Volume...' : 'Adding to Sanctum...'}</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>{isEditMode ? 'Save Metadata Changes' : 'Add Volume to Library'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
