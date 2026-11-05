import React from 'react';
import { Camera, LayoutDashboard, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { triggerHapticFeedback } from '../utils/biometrics';

interface BottomNavProps {
  currentView: 'attendance' | 'admin' | 'history';
  onViewChange: (view: 'attendance' | 'admin' | 'history') => void;
  isOnline: boolean;
  pendingSyncCount: number;
  onTriggerSync: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentView,
  onViewChange,
  isOnline,
  pendingSyncCount,
  onTriggerSync,
}) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 pb-safe">
      <div className="grid grid-cols-3 items-center h-16 px-2">
        {/* Tab 1: Presensi Biometrik */}
        <button
          type="button"
          onClick={() => {
            onViewChange('attendance');
            triggerHapticFeedback([20]);
          }}
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition ${
            currentView === 'attendance'
              ? 'text-sky-600 dark:text-sky-400 font-bold'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white font-medium'
          }`}
        >
          <Camera className={`w-5 h-5 ${currentView === 'attendance' ? 'scale-110' : ''}`} />
          <span className="text-[10px] mt-1 tracking-tight">Presensi</span>
        </button>

        {/* Tab 2: Dasbor Admin */}
        <button
          type="button"
          onClick={() => {
            onViewChange('admin');
            triggerHapticFeedback([20]);
          }}
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition ${
            currentView === 'admin'
              ? 'text-sky-600 dark:text-sky-400 font-bold'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white font-medium'
          }`}
        >
          <LayoutDashboard className={`w-5 h-5 ${currentView === 'admin' ? 'scale-110' : ''}`} />
          <span className="text-[10px] mt-1 tracking-tight">Dasbor Admin</span>
        </button>

        {/* Tab 3: Cloud Sync Status & Action */}
        <button
          type="button"
          onClick={() => {
            onTriggerSync();
            triggerHapticFeedback([30]);
          }}
          disabled={!isOnline && pendingSyncCount === 0}
          className="relative flex flex-col items-center justify-center min-h-[48px] py-1 text-slate-500 hover:text-sky-600 transition disabled:opacity-60"
        >
          {isOnline ? (
            <RefreshCw
              className={`w-5 h-5 text-emerald-600 ${
                pendingSyncCount > 0 ? 'animate-spin' : ''
              }`}
            />
          ) : (
            <WifiOff className="w-5 h-5 text-amber-500" />
          )}

          <span className="text-[10px] mt-1 font-medium tracking-tight">
            {pendingSyncCount > 0
              ? `${pendingSyncCount} Antre Sync`
              : isOnline
              ? 'Cloud Aktif'
              : 'Offline'}
          </span>

          {pendingSyncCount > 0 && (
            <span className="absolute top-2 right-6 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white dark:ring-slate-900 animate-ping" />
          )}
        </button>
      </div>
    </nav>
  );
};
