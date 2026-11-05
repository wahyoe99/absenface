import React from 'react';
import { AttendanceRecord } from '../types/attendance';
import { CheckCircle2, MapPin, Clock, Calendar, ShieldCheck, CloudCheck, X } from 'lucide-react';

interface AttendanceSuccessModalProps {
  record: AttendanceRecord | null;
  onClose: () => void;
}

export const AttendanceSuccessModal: React.FC<AttendanceSuccessModalProps> = ({
  record,
  onClose,
}) => {
  if (!record) return null;

  const isMasuk = record.type === 'check_in';
  const isTepatWaktu = record.status === 'on_time';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-900 dark:text-white">
        {/* Top Header Banner */}
        <div
          className={`p-6 text-center text-white relative ${
            isTepatWaktu
              ? 'bg-gradient-to-br from-emerald-600 to-teal-700'
              : 'bg-gradient-to-br from-amber-600 to-orange-700'
          }`}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/30 text-white transition"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-16 h-16 mx-auto rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-3 ring-4 ring-white/30">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>

          <h3 className="text-lg font-extrabold tracking-tight">
            Presensi {isMasuk ? 'Masuk' : 'Pulang'} Berhasil!
          </h3>
          <p className="text-xs text-white/90 mt-0.5 font-medium">
            {isTepatWaktu ? 'Kehadiran Tepat Waktu' : 'Tercatat Terlambat'}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          {/* Employee Info Card with snapshot photo */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700 shrink-0">
              {record.photoSnapshot ? (
                <img
                  src={record.photoSnapshot}
                  alt={record.employeeName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-slate-500">
                  {record.employeeName.charAt(0)}
                </div>
              )}
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
            </div>

            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-bold truncate text-slate-900 dark:text-white">
                {record.employeeName}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                NIP: {record.nip}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {record.department}
              </p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-sky-500" /> Waktu Presensi
              </span>
              <p className="text-xs font-bold tabular-nums mt-0.5 text-slate-800 dark:text-slate-100">
                {record.time} WIB
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-sky-500" /> Tanggal
              </span>
              <p className="text-xs font-bold tabular-nums mt-0.5 text-slate-800 dark:text-slate-100">
                {record.date}
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-sky-500" /> Metode Autentikasi
              </span>
              <p className="text-xs font-bold mt-0.5 text-slate-800 dark:text-slate-100 capitalize">
                {record.method === 'face' ? 'Wajah (Face ID)' : 'Fingerprint'}
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-sky-500" /> Jarak Geofence
              </span>
              <p className="text-xs font-bold tabular-nums mt-0.5 text-slate-800 dark:text-slate-100">
                {record.location.distanceFromOfficeMeters} meter
              </p>
            </div>
          </div>

          {/* Sync Status Badge */}
          <div className="flex items-center justify-between p-2.5 bg-sky-50 dark:bg-sky-950/60 rounded-xl border border-sky-100 dark:border-sky-900 text-xs">
            <span className="flex items-center gap-1.5 text-sky-700 dark:text-sky-300 font-medium">
              <CloudCheck className="w-4 h-4 text-sky-600" />
              Status Sinkronisasi
            </span>
            <span className="font-semibold text-sky-800 dark:text-sky-200">
              {record.syncStatus === 'synced' ? 'Tersimpan ke Cloud' : 'Antrean Offline'}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs tracking-wide transition active:scale-98 shadow-md"
          >
            Tutup &amp; Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
