import React from 'react';
import { PWAInstallButton } from './PWAInstallButton';
import { ShieldCheck, Wifi, WifiOff, Cloud, RefreshCw } from 'lucide-react';

interface NavbarProps {
  currentView: 'attendance' | 'admin' | 'history';
  onViewChange: (view: 'attendance' | 'admin' | 'history') => void;
  isOnline: boolean;
  isSimulatedOffline: boolean;
  onToggleSimulatedOffline: () => void;
  pendingSyncCount: number;
  onTriggerSync: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onViewChange,
  isOnline,
  isSimulatedOffline,
  onToggleSimulatedOffline,
  pendingSyncCount,
  onTriggerSync,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onViewChange('attendance')}
            className="flex items-center gap-2.5 text-left focus:outline-hidden"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-500 flex items-center justify-center text-white shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white block leading-none">
                PresensiKita
              </span>
              <span className="text-[10px] text-slate-500 font-medium tracking-wide">
                Face &amp; Biometric Android
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-1">
          <button
            onClick={() => onViewChange('attendance')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition ${
              currentView === 'attendance'
                ? 'bg-slate-100 dark:bg-slate-800 text-sky-600 dark:text-sky-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Presensi Biometrik
          </button>

          <button
            onClick={() => onViewChange('admin')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition ${
              currentView === 'admin'
                ? 'bg-slate-100 dark:bg-slate-800 text-sky-600 dark:text-sky-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Dasbor Admin &amp; Laporan
          </button>
        </nav>

        {/* Zone 3: Primary Actions (Network Sync & Install PWA) */}
        <div className="flex items-center gap-2">
          {/* Offline / Online Cloud Indicator Toggle */}
          <button
            type="button"
            onClick={onToggleSimulatedOffline}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
              isOnline
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 hover:bg-amber-100'
            }`}
            title="Klik untuk beralih Simulasi Mode Online / Offline"
          >
            {isOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">Online (Cloud)</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden sm:inline">Offline (Lokal)</span>
              </>
            )}
          </button>

          {/* Pending Sync Badge button if offline items exist */}
          {pendingSyncCount > 0 && (
            <button
              type="button"
              onClick={onTriggerSync}
              disabled={!isOnline}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 text-xs font-bold border border-sky-200 dark:border-sky-800 active:scale-95 disabled:opacity-50"
              title="Kirim antrean data presensi ke server cloud sekarang"
            >
              <RefreshCw className="w-3 h-3 text-sky-600 animate-spin" />
              <span>{pendingSyncCount} Antre</span>
            </button>
          )}

          {/* In-app PWA Install Button */}
          <PWAInstallButton />
        </div>
      </div>
    </header>
  );
};
