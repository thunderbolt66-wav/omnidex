import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Flame,
  Target,
  BookOpen,
  CheckCircle2,
  Clock,
  Bookmark,
  TrendingUp,
  Award,
  BarChart3,
  Calendar,
} from 'lucide-react';
import { getLocalCache } from '../lib/bookSyncService';
import { getActiveProfile } from '../lib/profileService';
import { useSettingsStore } from '../store/useSettingsStore';
import { getThemeClasses } from '../lib/themeStyles';

export default function InsightsView({ onSelectBook, onOpenAddTab }) {
  const [books, setBooks] = useState(() => getLocalCache());
  const activeProfile = getActiveProfile();
  const theme = useSettingsStore((state) => state.theme);
  const themeStyles = getThemeClasses(theme);

  // Sync books on update
  useEffect(() => {
    const handleUpdate = () => setBooks(getLocalCache());
    window.addEventListener('antigravity:books-updated', handleUpdate);
    window.addEventListener('antigravity:profile-switched', handleUpdate);
    return () => {
      window.removeEventListener('antigravity:books-updated', handleUpdate);
      window.removeEventListener('antigravity:profile-switched', handleUpdate);
    };
  }, []);

  // Compute live reading metrics
  const totalBooks = books.length;
  const completedBooks = books.filter(
    (b) => (Number(b.pages_read) || 0) >= (Number(b.total_pages) || 1) && (Number(b.total_pages) || 0) > 0
  );
  const readingBooks = books.filter(
    (b) => (Number(b.pages_read) || 0) > 0 && (Number(b.pages_read) || 0) < (Number(b.total_pages) || 1)
  );
  const unreadBooks = books.filter((b) => (Number(b.pages_read) || 0) === 0);

  const totalPagesRead = books.reduce((acc, b) => acc + (Number(b.pages_read) || 0), 0);
  const totalLibraryPages = books.reduce((acc, b) => acc + (Number(b.total_pages) || 0), 0);

  // Profile reading goal
  const [readingGoal, setReadingGoal] = useState(() => {
    const saved = localStorage.getItem(`omnidex_goal_${activeProfile?.id || 'default'}`);
    return saved ? Number(saved) : 25;
  });

  const handleUpdateGoal = (delta) => {
    const next = Math.max(1, Math.min(200, readingGoal + delta));
    setReadingGoal(next);
    localStorage.setItem(`omnidex_goal_${activeProfile?.id || 'default'}`, String(next));
  };

  const goalProgress = Math.min(100, Math.round((completedBooks.length / readingGoal) * 100));

  // Extract top genres / subjects
  const genreCounts = {};
  books.forEach((b) => {
    const genre = b.genre || b.subject || (b.categories && b.categories[0]);
    if (genre) {
      genreCounts[genre] = (genreCounts[genre] || 0) + 1;
    }
  });

  const sortedGenres = Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-7 h-7 opacity-80" />
            <span>Reading Sanctum Insights</span>
          </h2>
          <p className="text-xs sm:text-sm opacity-60 mt-1">
            Activity telemetry, reading velocity, and milestone targets for{' '}
            <span className="font-semibold opacity-90">{activeProfile?.name || 'Reader'}</span>.
          </p>
        </div>

        {/* Reading Streak Badge */}
        <div className="glass-card px-4 py-2.5 rounded-2xl flex items-center gap-3 w-fit">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5 fill-amber-400 animate-pulse" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider opacity-60">Reading Streak</div>
            <div className="text-sm sm:text-base font-bold text-amber-400">
              {Math.max(1, Math.min(30, completedBooks.length * 2 + readingBooks.length))} Days Active
            </div>
          </div>
        </div>
      </div>

      {/* Top 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Total Volumes */}
        <div className="glass-card p-4 sm:p-5 rounded-3xl flex flex-col justify-between">
          <div className="flex items-center justify-between opacity-70">
            <span className="text-xs font-semibold uppercase tracking-wider">Sanctum Volumes</span>
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-extrabold">{totalBooks}</div>
            <p className="text-[11px] opacity-50 mt-1">Volumes archived</p>
          </div>
        </div>

        {/* Completed Books */}
        <div className="glass-card p-4 sm:p-5 rounded-3xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-xs font-semibold uppercase tracking-wider opacity-90">Finished</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">{completedBooks.length}</div>
            <p className="text-[11px] opacity-50 mt-1">Read cover-to-cover</p>
          </div>
        </div>

        {/* In Progress */}
        <div className="glass-card p-4 sm:p-5 rounded-3xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-cyan-400">
            <span className="text-xs font-semibold uppercase tracking-wider opacity-90">Currently Reading</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-extrabold text-cyan-400">{readingBooks.length}</div>
            <p className="text-[11px] opacity-50 mt-1">Active reading sessions</p>
          </div>
        </div>

        {/* Pages Read */}
        <div className="glass-card p-4 sm:p-5 rounded-3xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-xs font-semibold uppercase tracking-wider opacity-90">Pages Consumed</span>
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-400">
              {totalPagesRead.toLocaleString()}
            </div>
            <p className="text-[11px] opacity-50 mt-1">Of {totalLibraryPages.toLocaleString()} total</p>
          </div>
        </div>
      </div>

      {/* Annual Reading Goal Card */}
      <div className="glass-card p-5 sm:p-6 rounded-3xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/10 text-white">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">Annual Reading Target</h3>
              <p className="text-xs opacity-60">Pace yourself to conquer your personal reading list.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs opacity-60 font-mono">Goal:</span>
            <button
              onClick={() => handleUpdateGoal(-5)}
              className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-sm font-bold flex items-center justify-center transition-all active:scale-95"
            >
              -
            </button>
            <span className="text-sm font-bold font-mono px-2">{readingGoal} books</span>
            <button
              onClick={() => handleUpdateGoal(5)}
              className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-sm font-bold flex items-center justify-center transition-all active:scale-95"
            >
              +
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2 mt-4">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="opacity-70">
              {completedBooks.length} of {readingGoal} books completed
            </span>
            <span className="font-bold text-emerald-400">{goalProgress}%</span>
          </div>
          <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/10">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700 shadow-sm"
              style={{ width: `${goalProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Shelf Distribution & Top Genres Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        {/* Shelf Breakdown */}
        <div className="glass-card p-5 sm:p-6 rounded-3xl space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider opacity-70 flex items-center gap-2">
            <Bookmark className="w-4 h-4" />
            <span>Shelving Distribution</span>
          </h3>

          <div className="space-y-3 pt-2">
            {/* Reading */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="opacity-80">Currently Reading</span>
                <span className="font-mono font-medium">{readingBooks.length} volumes</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-400 rounded-full transition-all duration-500"
                  style={{ width: `${totalBooks ? (readingBooks.length / totalBooks) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Finished */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="opacity-80">Completed</span>
                <span className="font-mono font-medium">{completedBooks.length} volumes</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${totalBooks ? (completedBooks.length / totalBooks) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Unread */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="opacity-80">Want to Read</span>
                <span className="font-mono font-medium">{unreadBooks.length} volumes</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${totalBooks ? (unreadBooks.length / totalBooks) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Favorite Genres or Topics */}
        <div className="glass-card p-5 sm:p-6 rounded-3xl space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider opacity-70 flex items-center gap-2">
            <Award className="w-4 h-4" />
            <span>Top Intellectual Domains</span>
          </h3>

          {sortedGenres.length > 0 ? (
            <div className="space-y-2.5 pt-2">
              {sortedGenres.map(([genre, count]) => (
                <div
                  key={genre}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <span className="text-xs font-medium truncate max-w-[200px]">{genre}</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-white/10 opacity-70">
                    {count} {count === 1 ? 'book' : 'books'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs opacity-50 space-y-2">
              <p>No genre telemetry yet.</p>
              <button
                onClick={onOpenAddTab}
                className="text-amber-400 hover:underline font-medium"
              >
                Search & add books to populate insights &rarr;
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
