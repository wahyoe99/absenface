import React from 'react';
import { OfficeLocation } from '../types/attendance';
import { MapPin, Navigation, ShieldCheck, AlertTriangle } from 'lucide-react';

interface GeofenceRadarProps {
  office: OfficeLocation;
  currentCoords: { latitude: number; longitude: number; accuracy: number } | null;
  distanceMeters: number;
  isWithinGeofence: boolean;
  onCalibrateToHere?: () => void;
  onSimulateInOffice?: () => void;
}

export const GeofenceRadar: React.FC<GeofenceRadarProps> = ({
  office,
  currentCoords,
  distanceMeters,
  isWithinGeofence,
  onCalibrateToHere,
  onSimulateInOffice,
}) => {
  // Normalize distance for radar visualization: 0m = center, office.radiusMeters = radius border
  const maxDisplayRadius = office.radiusMeters * 1.8;
  const ratio = Math.min(1.4, distanceMeters / (maxDisplayRadius || 1));
  // User point offset on 200x200 canvas (center is 100, 100)
  const angle = 45 * (Math.PI / 180);
  const userPointDistPx = Math.min(88, ratio * 70);
  const userX = 100 + Math.cos(angle) * userPointDistPx;
  const userY = 100 + Math.sin(angle) * userPointDistPx;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-sky-600" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
            Geofencing Lokasi Presensi
          </h4>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          {isWithinGeofence ? (
            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              <ShieldCheck className="w-3.5 h-3.5" />
              Dalam Radius ({distanceMeters}m)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 font-semibold bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-800">
              <AlertTriangle className="w-3.5 h-3.5" />
              Luar Radius ({distanceMeters}m)
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
        {/* Radar Graphic */}
        <div className="relative flex items-center justify-center p-2 bg-slate-950 rounded-xl overflow-hidden aspect-video sm:aspect-square">
          <svg viewBox="0 0 200 200" className="w-full h-full max-w-[200px]">
            {/* Background Grid Rings */}
            <circle cx="100" cy="100" r="90" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx="100" cy="100" r="65" fill="none" stroke="#1e293b" strokeWidth="1" />
            <circle cx="100" cy="100" r="40" fill="none" stroke="#1e293b" strokeWidth="1" />
            <line x1="100" y1="10" x2="100" y2="190" stroke="#1e293b" strokeWidth="1" />
            <line x1="10" y1="100" x2="190" y2="100" stroke="#1e293b" strokeWidth="1" />

            {/* Allowed Geofence Radius Perimeter */}
            <circle
              cx="100"
              cy="100"
              r="55"
              fill={isWithinGeofence ? 'rgba(16, 185, 129, 0.18)' : 'rgba(239, 68, 68, 0.12)'}
              stroke={isWithinGeofence ? '#10b981' : '#f87171'}
              strokeWidth="2"
            />

            {/* Office Center Marker */}
            <circle cx="100" cy="100" r="5" fill="#0284c7" />
            <circle cx="100" cy="100" r="10" fill="none" stroke="#0284c7" strokeWidth="1" opacity="0.6" />
            <text x="100" y="118" fill="#94a3b8" fontSize="8" textAnchor="middle" fontWeight="bold">
              KANTOR (HQ)
            </text>

            {/* User GPS Pin */}
            <g transform={`translate(${userX}, ${userY})`}>
              <circle cx="0" cy="0" r="12" fill={isWithinGeofence ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'} className="animate-ping" />
              <circle cx="0" cy="0" r="6" fill={isWithinGeofence ? '#10b981' : '#ef4444'} stroke="#ffffff" strokeWidth="2" />
              <text x="0" y="-10" fill="#ffffff" fontSize="8" textAnchor="middle" fontWeight="bold">
                ANDA
              </text>
            </g>
          </svg>

          {/* Radar scan beam effect */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <span className="text-[10px] text-slate-400 absolute bottom-2 left-2 font-mono">
              Maks: {office.radiusMeters} meter
            </span>
          </div>
        </div>

        {/* Location Info & Quick actions */}
        <div className="space-y-3">
          <div>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Titik Kantor:</span>
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
              {office.name}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
              {office.address}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-500">Jarak Terhitung</span>
              <p className="text-sm font-bold tabular-nums text-slate-900 dark:text-white">
                {distanceMeters} m
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-500">Akurasi GPS</span>
              <p className="text-sm font-bold tabular-nums text-slate-900 dark:text-white">
                ±{currentCoords?.accuracy || 10} m
              </p>
            </div>
          </div>

          {/* Convenient calibration helpers for testing */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {onSimulateInOffice && (
              <button
                type="button"
                onClick={onSimulateInOffice}
                className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-sky-50 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 hover:bg-sky-100 transition active:scale-95"
              >
                ⚡ Simulasi Di Dalam Kantor (20m)
              </button>
            )}
            {onCalibrateToHere && currentCoords && (
              <button
                type="button"
                onClick={onCalibrateToHere}
                className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition active:scale-95 flex items-center gap-1"
                title="Pindahkan titik koordinat kantor ke posisi GPS perangkat Anda saat ini"
              >
                <Navigation className="w-3 h-3" />
                Set Kantor ke Lokasi Ini
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
