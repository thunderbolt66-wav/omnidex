import React, { useState, useEffect, useMemo } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  KeyRound,
  Lock,
  Activity,
  Globe,
  Layers,
  Monitor,
  Search,
  RefreshCw,
  Download,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  ArrowLeft,
  Smartphone,
  Tablet,
  Laptop,
} from 'lucide-react';
import { fetchAdminTelemetry, wipeAdminTelemetry } from '../lib/telemetryService';

export default function AdminStandaloneApp() {
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
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Authenticate and load data
  const handleAuthenticate = async (e) => {
    if (e) e.preventDefault();
    if (!adminKey.trim()) {
      setErrorMsg('Please enter your Master Admin Secret Key.');
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
    if (adminKey && !isAuthenticated) {
      handleAuthenticate();
    }
  }, []);

  // Auto-refresh interval
  useEffect(() => {
    if (!autoRefresh || !isAuthenticated || !adminKey) return;
    const interval = setInterval(() => {
      handleRefresh(true);
    }, 10000);
    return () => clearInterval(interval);
  }, [autoRefresh, isAuthenticated, adminKey]);

  // Refresh telemetry
  const handleRefresh = async (silent = false) => {
    if (!adminKey) return;
    if (!silent) setLoading(true);
    try {
      const res = await fetchAdminTelemetry(adminKey.trim());
      setData(res);
      if (!silent) {
        setActionNotice('Telemetry feed updated.');
        setTimeout(() => setActionNotice(null), 3000);
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Clear logs
  const handleWipeLogs = async () => {
    if (!window.confirm('Are you sure you want to permanently wipe all recorded visitor logs?')) {
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

    const headers = ['Timestamp', 'IP Address', 'Country', 'City', 'Device', 'OS', 'Browser', 'Resolution', 'Referrer', 'Tab', 'Theme'];
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
      `"${v.activeTheme || ''}"`,
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
      v.referrer?.toLowerCase().includes(q) ||
      v.activeTheme?.toLowerCase().includes(q)
    );
  }, [data, searchFilter]);

  // Device icon helper
  const getDeviceIcon = (dev) => {
    const d = (dev || '').toLowerCase();
    if (d.includes('mobile') || d.includes('phone')) return <Smartphone className="w-4 h-4 text-emerald-400" />;
    if (d.includes('tablet') || d.includes('ipad')) return <Tablet className="w-4 h-4 text-amber-400" />;
    return <Laptop className="w-4 h-4 text-cyan-400" />;
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="border-b border-zinc-800 bg-zinc-900/60 backdrop-blur-xl sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 shadow-sm">
            <Shield className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
                <span>Omnidex Sentinel</span>
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 uppercase tracking-widest font-semibold">
                Standalone Owner Portal
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 hidden sm:block">
              Isolated Backend Command & Zero-Leak Telemetry Intelligence
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <button
              onClick={handleLock}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-300 transition-all border border-zinc-700"
              title="Lock Console"
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Lock Console</span>
            </button>
          )}

          <a
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 text-xs font-semibold transition-all border border-cyan-500/30"
            title="Return to Main Omnidex Library"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Go to App</span>
          </a>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 flex flex-col">
        {/* Notice alert */}
        {actionNotice && (
          <div className="mb-6 p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* 1. VAULT GATEKEEPER FORM (UNAUTHENTICATED) */}
        {!isAuthenticated ? (
          <div className="my-auto py-12 px-4 max-w-md mx-auto w-full text-center space-y-6">
            <div className="w-20 h-20 rounded-3xl bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 mx-auto flex items-center justify-center shadow-2xl">
              <KeyRound className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Owner Master Key Required</h2>
              <p className="text-xs text-zinc-400 leading-relaxed max-w-sm mx-auto">
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
                className="w-full px-4 py-3 rounded-2xl bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 text-sm font-mono outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all text-center"
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
                {loading ? 'Authenticating with Serverless Edge...' : 'Unlock Sentinel Command'}
              </button>
            </form>

            <div className="pt-2 text-[11px] text-zinc-500 font-mono">
              Never committed to GitHub • Protected by Timing-Safe Serverless Edge
            </div>
          </div>
        ) : (
          /* 2. AUTHENTICATED COMMAND CENTER */
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-zinc-900/70 border border-zinc-800 p-5 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold uppercase tracking-wider">
                  <span>Total Hits</span>
                  <Activity className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="mt-2 text-3xl font-extrabold text-white">
                  {data?.summary?.totalVisits || 0}
                </div>
                <div className="text-[11px] text-zinc-500 mt-1">Recorded sessions</div>
              </div>

              <div className="bg-zinc-900/70 border border-zinc-800 p-5 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold uppercase tracking-wider">
                  <span>Unique Visitors</span>
                  <Globe className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="mt-2 text-3xl font-extrabold text-emerald-400">
                  {data?.summary?.uniqueIps || 0}
                </div>
                <div className="text-[11px] text-zinc-500 mt-1">Distinct IP addresses</div>
              </div>

              <div className="bg-zinc-900/70 border border-zinc-800 p-5 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold uppercase tracking-wider">
                  <span>Locations</span>
                  <Layers className="w-4 h-4 text-amber-400" />
                </div>
                <div className="mt-2 text-3xl font-extrabold text-amber-400">
                  {data?.summary?.countriesCount || 0}
                </div>
                <div className="text-[11px] text-zinc-500 mt-1">Countries / Regions</div>
              </div>

              <div className="bg-zinc-900/70 border border-zinc-800 p-5 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold uppercase tracking-wider">
                  <span>Device Dominance</span>
                  <Monitor className="w-4 h-4 text-purple-400" />
                </div>
                <div className="mt-2 text-xl font-bold text-white truncate">
                  {Object.entries(data?.summary?.deviceBreakdown || {})[0]?.[0] || 'Desktop'}
                </div>
                <div className="text-[11px] text-zinc-500 mt-1">
                  {Object.entries(data?.summary?.deviceBreakdown || {})[0]?.[1] || 0} recorded hits
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-zinc-900/50 p-3 rounded-2xl border border-zinc-800">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Filter by IP, Country, OS, Browser, Theme..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-white placeholder-zinc-500 outline-none focus:border-cyan-400 transition-all"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap justify-end">
                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                    autoRefresh
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border-zinc-700'
                  }`}
                  title="Toggle 10-second automatic polling"
                >
                  <Activity className={`w-3.5 h-3.5 ${autoRefresh ? 'animate-pulse text-emerald-400' : ''}`} />
                  <span>Auto-Sync {autoRefresh ? 'ON' : 'OFF'}</span>
                </button>

                <button
                  onClick={() => handleRefresh(false)}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-medium text-zinc-200 border border-zinc-700 transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>

                <button
                  onClick={handleExportCSV}
                  disabled={!data?.visitors || data.visitors.length === 0}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition-all disabled:opacity-40"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>

                <button
                  onClick={handleWipeLogs}
                  disabled={loading || !data?.visitors || data.visitors.length === 0}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-all disabled:opacity-40"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Wipe Logs</span>
                </button>
              </div>
            </div>

            {/* Visitor Dossier Table */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-zinc-900/90 text-zinc-400 font-semibold uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-4">Visitor / IP</th>
                      <th className="py-3 px-4">Location</th>
                      <th className="py-3 px-4">Device & OS</th>
                      <th className="py-3 px-4">Browser</th>
                      <th className="py-3 px-4">Screen / Lang</th>
                      <th className="py-3 px-4">Referrer</th>
                      <th className="py-3 px-4 text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {filteredVisitors.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-zinc-500">
                          {searchFilter ? 'No telemetry logs matching your search filter.' : 'No visitor hits logged yet.'}
                        </td>
                      </tr>
                    ) : (
                      filteredVisitors.map((visit) => (
                        <tr key={visit.id} className="hover:bg-zinc-800/40 transition-colors">
                          {/* IP Address */}
                          <td className="py-3 px-4 font-mono font-medium text-white">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-200">
                                {visit.ip}
                              </span>
                              <button
                                onClick={() => handleCopyIp(visit.ip)}
                                className="p-1 rounded hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all"
                                title="Copy IP"
                              >
                                {copiedIp === visit.ip ? (
                                  <Check className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                              <a
                                href={`https://whatismyipaddress.com/ip/${encodeURIComponent(visit.ip)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1 rounded hover:bg-zinc-700 text-zinc-400 hover:text-cyan-400 transition-all"
                                title="Lookup IP Information"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </td>

                          {/* Location */}
                          <td className="py-3 px-4">
                            <div className="font-medium text-zinc-200">
                              {visit.country || 'Unknown'}
                            </div>
                            <div className="text-[10px] text-zinc-500 truncate max-w-[140px]">
                              {visit.city || 'Unknown'}
                            </div>
                          </td>

                          {/* Device & OS */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5 font-medium text-zinc-200">
                              {getDeviceIcon(visit.device)}
                              <span>{visit.device || 'Desktop'}</span>
                            </div>
                            <div className="text-[10px] text-zinc-500">
                              {visit.os || 'Unknown OS'}
                            </div>
                          </td>

                          {/* Browser */}
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-[11px] text-zinc-300 font-medium">
                              {visit.browser || 'Unknown'}
                            </span>
                          </td>

                          {/* Screen & Language */}
                          <td className="py-3 px-4 font-mono text-[11px] text-zinc-400">
                            <div>{visit.screenResolution || 'Unknown'}</div>
                            <div className="text-[10px] text-zinc-500">{visit.language || 'en'}</div>
                          </td>

                          {/* Referrer */}
                          <td className="py-3 px-4 text-zinc-400 truncate max-w-[120px]">
                            {visit.referrer || 'Direct'}
                          </td>

                          {/* Timestamp */}
                          <td className="py-3 px-4 text-right font-mono text-[11px] text-zinc-400 whitespace-nowrap">
                            {visit.timestamp ? new Date(visit.timestamp).toLocaleTimeString() : 'N/A'}
                            <div className="text-[10px] text-zinc-500">
                              {visit.timestamp ? new Date(visit.timestamp).toLocaleDateString() : ''}
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
      </main>
    </div>
  );
}
