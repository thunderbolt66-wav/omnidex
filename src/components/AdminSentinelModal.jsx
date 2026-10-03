import React, { useState, useEffect, useMemo } from 'react';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  X,
  RefreshCw,
  Download,
  Trash2,
  Lock,
  Unlock,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  ExternalLink,
  Copy,
  Check,
  Search,
  Filter,
  Activity,
  Layers,
  Terminal,
} from 'lucide-react';
import { fetchAdminTelemetry, wipeAdminTelemetry } from '../lib/telemetryService';
import { useSettingsStore } from '../store/useSettingsStore';
import { getThemeClasses } from '../lib/themeStyles';

export default function AdminSentinelModal({ isOpen, onClose }) {
  const [adminKey, setAdminKey] = useState(() => {
    try {
      const urlKey = new URLSearchParams(window.location.search).get('key');
      if (urlKey) {
        const cleanUrl = new URL(window.location.href);
        cleanUrl.searchParams.delete('key');
        window.history.replaceState({}, document.title, cleanUrl.toString());
        return urlKey;
      }
    } catch {}
    return localStorage.getItem('omnidex_sentinel_token') || '';
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [data, setData] = useState(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [copiedIp, setCopiedIp] = useState(null);
  const [actionNotice, setActionNotice] = useState(null);

  const theme = useSettingsStore((state) => state.theme);
  const themeStyles = getThemeClasses(theme);

  // Authenticate and load data
  const handleAuthenticate = async (e) => {
    if (e) e.preventDefault();
    if (!adminKey.trim()) {
      setErrorMsg('Please enter your Master Admin Key.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetchAdminTelemetry(adminKey.trim());
      setData(res);
      setIsAuthenticated(true);
      localStorage.setItem('omnidex_sentinel_token', adminKey.trim());
    } catch (err) {
      setErrorMsg(err.message || 'Access Denied: Invalid Master Admin Key.');
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  // Try auto-authenticating if key is already cached
  useEffect(() => {
    if (isOpen && adminKey && !isAuthenticated) {
      handleAuthenticate();
    }
  }, [isOpen]);

  // Refresh telemetry
  const handleRefresh = async () => {
    if (!adminKey) return;
    setLoading(true);
    try {
      const res = await fetchAdminTelemetry(adminKey.trim());
      setData(res);
      setActionNotice('Telemetry feed updated.');
      setTimeout(() => setActionNotice(null), 3000);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Clear logs
  const handleWipeLogs = async () => {
    if (!window.confirm('Are you sure you want to wipe all recorded visitor logs? This cannot be undone.')) {
      return;
    }
    setLoading(true);
    try {
      await wipeAdminTelemetry(adminKey.trim());
      await handleRefresh();
      setActionNotice('Visitor logs wiped.');
      setTimeout(() => setActionNotice(null), 3000);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Lock and log out
  const handleLock = () => {
    setIsAuthenticated(false);
    setAdminKey('');
    localStorage.removeItem('omnidex_sentinel_token');
    setData(null);
  };

  // Export CSV
  const handleExportCSV = () => {
    if (!data?.visitors || data.visitors.length === 0) return;

    const headers = ['Timestamp', 'IP Address', 'Country', 'City', 'Device', 'OS', 'Browser', 'Resolution', 'Referrer', 'Tab'];
    const rows = data.visitors.map((v) => [
      `"${v.timestamp || ''}"`,
      `"${v.ip || ''}"`,
      `"${v.country || ''}"`,
      `"${v.city || ''}"`,
      `"${v.device || ''}"`,
      `"${v.os || ''}"`,
      `"${v.browser || ''}"`,
      `"${v.screenResolution || ''}"`,
      `"${v.referrer || ''}"`,
      `"${v.currentTab || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `omnidex_visitors_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy IP helper
  const handleCopyIp = (ip) => {
    navigator.clipboard.writeText(ip);
    setCopiedIp(ip);
    setTimeout(() => setCopiedIp(null), 2000);
  };

  // Filter visitors
  const filteredVisitors = useMemo(() => {
    if (!data?.visitors) return [];
    if (!searchFilter.trim()) return data.visitors;
    const q = searchFilter.toLowerCase();
    return data.visitors.filter((v) =>
      v.ip?.toLowerCase().includes(q) ||
      v.country?.toLowerCase().includes(q) ||
      v.city?.toLowerCase().includes(q) ||
      v.device?.toLowerCase().includes(q) ||
      v.os?.toLowerCase().includes(q) ||
      v.browser?.toLowerCase().includes(q) ||
      v.referrer?.toLowerCase().includes(q)
    );
  }, [data, searchFilter]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-5xl rounded-3xl glass-panel border border-white/15 shadow-2xl p-6 sm:p-8 max-h-[92vh] flex flex-col my-auto text-zinc-100">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-5 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
              <Shield className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                  Omnidex Sentinel
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 uppercase tracking-widest font-semibold">
                  Owner Gate
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Zero-leak visitor intelligence, IP logging, and device analytics.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                onClick={handleLock}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-xs text-zinc-300 font-medium transition-all"
                title="Lock Sentinel"
              >
                <Lock className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Lock</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-all"
              title="Close Sentinel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Notice */}
        {actionNotice && (
          <div className="mt-4 p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* 1. GATEKEEPER AUTHENTICATION FORM */}
        {!isAuthenticated ? (
          <div className="py-12 px-4 max-w-md mx-auto w-full text-center space-y-6 my-auto">
            <div className="w-16 h-16 rounded-3xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mx-auto flex items-center justify-center shadow-lg">
              <KeyRound className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-bold text-white">Owner Master Key Required</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                This dashboard communicates directly with your isolated serverless backend.
                Visitors cannot access this gate or view telemetry without your private key.
              </p>
            </div>

            <form onSubmit={handleAuthenticate} className="space-y-4">
              <input
                type="password"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                placeholder="Enter ADMIN_SECRET_KEY..."
                autoFocus
                className="w-full px-4 py-3 rounded-2xl bg-black/50 border border-white/20 text-white placeholder-zinc-500 text-sm font-mono outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all text-center"
              />

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-medium flex items-center justify-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-zinc-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg active:scale-98 disabled:opacity-50"
              >
                {loading ? 'Authenticating with Backend...' : 'Unlock Sentinel Command'}
              </button>
            </form>

            <div className="pt-2 text-[11px] text-zinc-500 font-mono">
              Never committed to GitHub • Protected by Timing-Safe Serverless Edge
            </div>
          </div>
        ) : (
          /* 2. AUTHENTICATED SENTINEL DASHBOARD */
          <div className="flex-1 overflow-y-auto pt-6 space-y-6">
            {/* KPI Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="glass-card p-4 rounded-2xl border border-white/10">
                <div className="flex items-center justify-between opacity-60 text-xs font-semibold uppercase tracking-wider">
                  <span>Total Hits</span>
                  <Activity className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="mt-2 text-2xl font-extrabold text-white">
                  {data?.summary?.totalVisits || 0}
                </div>
                <div className="text-[11px] text-zinc-400 mt-0.5">Recorded requests</div>
              </div>

              <div className="glass-card p-4 rounded-2xl border border-white/10">
                <div className="flex items-center justify-between opacity-60 text-xs font-semibold uppercase tracking-wider">
                  <span>Unique IPs</span>
                  <Globe className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="mt-2 text-2xl font-extrabold text-emerald-400">
                  {data?.summary?.uniqueIps || 0}
                </div>
                <div className="text-[11px] text-zinc-400 mt-0.5">Distinct devices</div>
              </div>

              <div className="glass-card p-4 rounded-2xl border border-white/10">
                <div className="flex items-center justify-between opacity-60 text-xs font-semibold uppercase tracking-wider">
                  <span>Countries</span>
                  <Layers className="w-4 h-4 text-amber-400" />
                </div>
                <div className="mt-2 text-2xl font-extrabold text-amber-400">
                  {data?.summary?.countriesCount || 0}
                </div>
                <div className="text-[11px] text-zinc-400 mt-0.5">Global locations</div>
              </div>

              <div className="glass-card p-4 rounded-2xl border border-white/10">
                <div className="flex items-center justify-between opacity-60 text-xs font-semibold uppercase tracking-wider">
                  <span>Device Dominance</span>
                  <Monitor className="w-4 h-4 text-purple-400" />
                </div>
                <div className="mt-2 text-lg font-bold text-white truncate">
                  {Object.entries(data?.summary?.deviceBreakdown || {})[0]?.[0] || 'Desktop'}
                </div>
                <div className="text-[11px] text-zinc-400 mt-0.5">
                  {Object.entries(data?.summary?.deviceBreakdown || {})[0]?.[1] || 0} sessions
                </div>
              </div>
            </div>

            {/* Controls Bar: Search & Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:max-w-xs">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Filter by IP, Country, OS, Browser..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white placeholder-zinc-500 outline-none focus:border-cyan-400 transition-all"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-medium text-white transition-all active:scale-95"
                  title="Refresh visitor logs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>

                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-medium text-white transition-all active:scale-95"
                  title="Export to CSV"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Export CSV</span>
                </button>

                <button
                  onClick={handleWipeLogs}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-medium transition-all active:scale-95"
                  title="Wipe recorded logs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Wipe Logs</span>
                </button>
              </div>
            </div>

            {/* Visitor Dossier Table */}
            <div className="rounded-2xl border border-white/10 overflow-hidden bg-black/40">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5 text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                      <th className="py-3 px-4">Visitor / IP</th>
                      <th className="py-3 px-4">Location</th>
                      <th className="py-3 px-4">Device & OS</th>
                      <th className="py-3 px-4">Browser</th>
                      <th className="py-3 px-4">Screen / Language</th>
                      <th className="py-3 px-4">Referrer</th>
                      <th className="py-3 px-4">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-sans">
                    {filteredVisitors.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="py-12 text-center text-zinc-500 text-xs">
                          {data?.visitors?.length === 0
                            ? 'No visitor records captured yet. Open the site in a new browser to test.'
                            : 'No visitors match your filter criteria.'}
                        </td>
                      </tr>
                    ) : (
                      filteredVisitors.map((v) => (
                        <tr key={v.id} className="hover:bg-white/5 transition-colors">
                          {/* IP Address */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-white text-xs bg-white/10 px-2 py-0.5 rounded-md">
                                {v.ip}
                              </span>
                              <button
                                onClick={() => handleCopyIp(v.ip)}
                                className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                                title="Copy IP"
                              >
                                {copiedIp === v.ip ? (
                                  <Check className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                              <a
                                href={`https://whois.domaintools.com/${v.ip}`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-cyan-400 transition-colors"
                                title="Lookup IP Details"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </td>

                          {/* Location */}
                          <td className="py-3 px-4">
                            <div className="font-semibold text-zinc-200">
                              {v.country || 'Unknown Country'}
                            </div>
                            <div className="text-[10px] text-zinc-400">
                              {v.city ? `${v.city}${v.region ? ', ' + v.region : ''}` : 'Location unknown'}
                            </div>
                          </td>

                          {/* Device & OS */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5 font-medium text-zinc-200">
                              {v.device === 'Mobile' ? (
                                <Smartphone className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                              ) : v.device === 'Tablet' ? (
                                <Tablet className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              ) : (
                                <Monitor className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                              )}
                              <span>{v.device || 'Desktop'}</span>
                            </div>
                            <div className="text-[10px] text-zinc-400 mt-0.5">{v.os || 'Unknown OS'}</div>
                          </td>

                          {/* Browser */}
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[11px] font-medium text-zinc-300">
                              {v.browser || 'Browser'}
                            </span>
                          </td>

                          {/* Screen & Language */}
                          <td className="py-3 px-4 font-mono text-[11px] text-zinc-400">
                            <div>{v.screenResolution || '—'}</div>
                            <div className="text-[10px] opacity-70">{v.language || '—'}</div>
                          </td>

                          {/* Referrer */}
                          <td className="py-3 px-4">
                            <span
                              className="text-xs text-zinc-300 truncate max-w-[120px] block"
                              title={v.referrer}
                            >
                              {v.referrer || 'Direct'}
                            </span>
                          </td>

                          {/* Timestamp */}
                          <td className="py-3 px-4 font-mono text-[11px] text-zinc-400 whitespace-nowrap">
                            <div>{new Date(v.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
                            <div className="text-[10px] opacity-60">
                              {new Date(v.timestamp).toLocaleDateString()}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
