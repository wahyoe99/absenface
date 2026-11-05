/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  AttendanceRecord,
  AttendanceType,
  Employee,
  OfficeLocation,
  VerificationMethod,
  WorkShiftSettings,
} from './types/attendance';
import { syncStorage } from './utils/syncStorage';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { EmployeeAttendanceView } from './components/EmployeeAttendanceView';
import { AdminDashboard } from './components/AdminDashboard';
import { AttendanceSuccessModal } from './components/AttendanceSuccessModal';
import { triggerHapticFeedback } from './utils/biometrics';
import { WifiOff, CloudCheck, CheckCircle2 } from 'lucide-react';

export default function App() {
  // Navigation view: 'attendance' or 'admin'
  const [currentView, setCurrentView] = useState<'attendance' | 'admin' | 'history'>('attendance');

  // Application state loaded from SyncStorage
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [office, setOffice] = useState<OfficeLocation>(syncStorage.getOfficeLocation());
  const [settings, setSettings] = useState<WorkShiftSettings>(syncStorage.getSettings());
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(false);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);

  // Success modal receipt
  const [latestSuccessRecord, setLatestSuccessRecord] = useState<AttendanceRecord | null>(null);

  // Toast banner notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Synchronize state with storage
  const reloadStateFromStorage = useCallback(() => {
    setEmployees(syncStorage.getEmployees());
    setAttendanceRecords(syncStorage.getAttendanceRecords());
    setOffice(syncStorage.getOfficeLocation());
    setSettings(syncStorage.getSettings());
    setIsOnline(syncStorage.isOnline());
    setIsSimulatedOffline(syncStorage.isSimulatedOffline());
    setPendingSyncCount(syncStorage.getPendingSyncCount());
  }, []);

  useEffect(() => {
    reloadStateFromStorage();
    const unsubscribe = syncStorage.subscribe(() => {
      reloadStateFromStorage();
    });

    const handleWindowOnline = () => {
      syncStorage.triggerAutoSync().then((res) => {
        if (res.syncedCount > 0) {
          showToast(`Koneksi internet pulih. ${res.syncedCount} data otomatis tersinkronisasi ke cloud!`);
        }
      });
      reloadStateFromStorage();
    };

    const handleWindowOffline = () => {
      reloadStateFromStorage();
    };

    window.addEventListener('online', handleWindowOnline);
    window.addEventListener('offline', handleWindowOffline);

    return () => {
      unsubscribe();
      window.removeEventListener('online', handleWindowOnline);
      window.removeEventListener('offline', handleWindowOffline);
    };
  }, [reloadStateFromStorage]);

  // Handle Recording Attendance
  const handleRecordAttendance = (data: {
    employee: Employee;
    type: AttendanceType;
    method: VerificationMethod;
    photoSnapshot?: string;
    confidenceScore?: number;
    coords: { latitude: number; longitude: number; accuracy: number };
    distanceMeters: number;
    isWithinGeofence: boolean;
  }) => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString('id-ID', { hour12: false });

    // Determine status (on_time vs late)
    let status: 'on_time' | 'late' = 'on_time';
    if (data.type === 'check_in') {
      const [endHour, endMin] = settings.checkInEnd.split(':').map(Number);
      const limitMinutes = endHour * 60 + endMin + settings.lateToleranceMinutes;
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      if (currentMinutes > limitMinutes) {
        status = 'late';
      }
    }

    const newRecord = syncStorage.recordAttendance({
      id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      employeeId: data.employee.id,
      employeeName: data.employee.name,
      nip: data.employee.nip,
      department: data.employee.department,
      timestamp: now.toISOString(),
      date: dateStr,
      time: timeStr,
      type: data.type,
      method: data.method,
      photoSnapshot: data.photoSnapshot,
      confidenceScore: data.confidenceScore,
      status,
      notes:
        status === 'late'
          ? `Terlambat tercatat setelah toleransi ${settings.lateToleranceMinutes} mnt`
          : 'Presensi Sesuai Jadwal',
      location: {
        latitude: data.coords.latitude,
        longitude: data.coords.longitude,
        accuracy: data.coords.accuracy,
        distanceFromOfficeMeters: data.distanceMeters,
        isWithinGeofence: data.isWithinGeofence,
      },
    });

    triggerHapticFeedback([40, 60, 40]);
    setLatestSuccessRecord(newRecord);

    if (!syncStorage.isOnline()) {
      showToast('Presensi tersimpan di perangkat (Mode Offline) & akan disinkronkan saat online.');
    }
  };

  // Manual trigger cloud sync
  const handleTriggerSync = async () => {
    triggerHapticFeedback([30]);
    const res = await syncStorage.triggerAutoSync();
    if (res.syncedCount > 0) {
      showToast(`Berhasil! ${res.syncedCount} data presensi telah disinkronkan ke cloud real-time.`);
    } else {
      showToast('Semua data presensi sudah tersinkronisasi dengan database cloud.');
    }
  };

  // Toggle simulated offline mode
  const handleToggleSimulatedOffline = () => {
    const nextState = !isSimulatedOffline;
    syncStorage.setSimulatedOffline(nextState);
    triggerHapticFeedback([30]);
    if (nextState) {
      showToast('Mode Simulasi Offline Diaktifkan. Presensi akan disimpan di antrean lokal.');
    } else {
      showToast('Kembali ke Mode Online. Menyinkronkan antrean data...');
    }
  };

  // Calibrate office location to user's current GPS
  const handleCalibrateOfficeToCoords = (coords: {
    latitude: number;
    longitude: number;
    accuracy: number;
  }) => {
    const updated: OfficeLocation = {
      ...office,
      latitude: coords.latitude,
      longitude: coords.longitude,
    };
    syncStorage.saveOfficeLocation(updated);
    showToast('Titik koordinat kantor berhasil dikalibrasikan ke posisi GPS perangkat ini!');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col selection:bg-sky-500 selection:text-white pb-20 md:pb-8">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onViewChange={setCurrentView}
        isOnline={isOnline}
        isSimulatedOffline={isSimulatedOffline}
        onToggleSimulatedOffline={handleToggleSimulatedOffline}
        pendingSyncCount={pendingSyncCount}
        onTriggerSync={handleTriggerSync}
      />

      {/* Offline Alert Strip */}
      {!isOnline && (
        <div className="bg-amber-600 text-white text-xs font-semibold py-2 px-4 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full justify-between">
            <span className="flex items-center gap-1.5">
              <WifiOff className="w-4 h-4" />
              Perangkat Sedang Offline — Presensi tetap aktif dan tersimpan lokal di Android Anda.
            </span>
            {pendingSyncCount > 0 && (
              <span className="bg-amber-800/80 px-2 py-0.5 rounded-full text-[11px] tabular-nums">
                {pendingSyncCount} data menunggu sinkronisasi
              </span>
            )}
          </div>
        </div>
      )}

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 max-w-sm bg-slate-900 text-white p-3.5 rounded-2xl shadow-2xl border border-slate-700 text-xs font-medium flex items-center gap-2.5 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {currentView === 'attendance' ? (
          <EmployeeAttendanceView
            employees={employees}
            office={office}
            settings={settings}
            recentRecords={attendanceRecords}
            onRecordAttendance={handleRecordAttendance}
            onCalibrateOfficeToCoords={handleCalibrateOfficeToCoords}
          />
        ) : (
          <AdminDashboard
            employees={employees}
            attendanceRecords={attendanceRecords}
            office={office}
            settings={settings}
            isOnline={isOnline}
            pendingSyncCount={pendingSyncCount}
            onSaveEmployee={(emp) => {
              syncStorage.saveEmployee(emp);
              showToast(`Data karyawan ${emp.name} berhasil disimpan!`);
            }}
            onDeleteEmployee={(id) => {
              syncStorage.deleteEmployee(id);
              showToast('Data karyawan berhasil dihapus.');
            }}
            onSaveOffice={(newOffice) => {
              syncStorage.saveOfficeLocation(newOffice);
            }}
            onSaveSettings={(newSettings) => {
              syncStorage.saveSettings(newSettings);
            }}
            onTriggerSync={handleTriggerSync}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar (Thumb ergonomic anchor) */}
      <BottomNav
        currentView={currentView}
        onViewChange={setCurrentView}
        isOnline={isOnline}
        pendingSyncCount={pendingSyncCount}
        onTriggerSync={handleTriggerSync}
      />

      {/* Success Receipt Modal */}
      <AttendanceSuccessModal
        record={latestSuccessRecord}
        onClose={() => setLatestSuccessRecord(null)}
      />
    </div>
  );
}
