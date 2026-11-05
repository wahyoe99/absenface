import React, { useState, useEffect } from 'react';
import {
  AttendanceRecord,
  AttendanceType,
  Employee,
  OfficeLocation,
  VerificationMethod,
  WorkShiftSettings,
} from '../types/attendance';
import { FaceScanner } from './FaceScanner';
import { FingerprintScanner } from './FingerprintScanner';
import { GeofenceRadar } from './GeofenceRadar';
import { calculateDistanceMeters, getCurrentCoordinates } from '../utils/geofencing';
import { triggerHapticFeedback } from '../utils/biometrics';
import {
  Camera,
  Fingerprint,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  User,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  History,
  Calendar,
} from 'lucide-react';

interface EmployeeAttendanceViewProps {
  employees: Employee[];
  office: OfficeLocation;
  settings: WorkShiftSettings;
  recentRecords: AttendanceRecord[];
  onRecordAttendance: (recordData: {
    employee: Employee;
    type: AttendanceType;
    method: VerificationMethod;
    photoSnapshot?: string;
    confidenceScore?: number;
    coords: { latitude: number; longitude: number; accuracy: number };
    distanceMeters: number;
    isWithinGeofence: boolean;
  }) => void;
  onCalibrateOfficeToCoords: (coords: { latitude: number; longitude: number; accuracy: number }) => void;
}

export const EmployeeAttendanceView: React.FC<EmployeeAttendanceViewProps> = ({
  employees,
  office,
  settings,
  recentRecords,
  onRecordAttendance,
  onCalibrateOfficeToCoords,
}) => {
  // Selected employee (or null for auto-identify)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(
    employees[0]?.id || ''
  );
  // Attendance type: check_in or check_out
  const [attendanceType, setAttendanceType] = useState<AttendanceType>('check_in');
  // Verification method: 'face' | 'fingerprint'
  const [activeMethod, setActiveMethod] = useState<'face' | 'fingerprint'>('face');

  // GPS Geolocation state
  const [coords, setCoords] = useState<{
    latitude: number;
    longitude: number;
    accuracy: number;
  } | null>(null);
  const [distanceMeters, setDistanceMeters] = useState<number>(25); // default realistic inside distance
  const [isWithinGeofence, setIsWithinGeofence] = useState<boolean>(true);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [isRefreshingGps, setIsRefreshingGps] = useState(false);

  // Current real-time clock
  const [currentTime, setCurrentTime] = useState<string>(
    new Date().toLocaleTimeString('id-ID', { hour12: false })
  );
  const [currentDateStr, setCurrentDateStr] = useState<string>(
    new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  );

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('id-ID', { hour12: false }));
      setCurrentDateStr(
        now.toLocaleDateString('id-ID', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch device GPS
  const refreshLocation = async () => {
    setIsRefreshingGps(true);
    setGpsError(null);
    try {
      const current = await getCurrentCoordinates();
      setCoords(current);
      const dist = calculateDistanceMeters(
        current.latitude,
        current.longitude,
        office.latitude,
        office.longitude
      );
      setDistanceMeters(dist);
      setIsWithinGeofence(dist <= office.radiusMeters);
    } catch {
      // Default to office location coordinates if geolocation is blocked or denied
      setCoords({
        latitude: office.latitude,
        longitude: office.longitude,
        accuracy: 10,
      });
      setDistanceMeters(20);
      setIsWithinGeofence(true);
      setGpsError('GPS aktif dalam mode simulasi terkalibrasi');
    } finally {
      setIsRefreshingGps(false);
    }
  };

  useEffect(() => {
    refreshLocation();
  }, [office]);

  // Simulate being inside office for testing
  const handleSimulateInOffice = () => {
    setCoords({
      latitude: office.latitude,
      longitude: office.longitude,
      accuracy: 8,
    });
    setDistanceMeters(22);
    setIsWithinGeofence(true);
    triggerHapticFeedback([40]);
  };

  // Find selected employee
  const selectedEmployee =
    employees.find((e) => e.id === selectedEmployeeId) || employees[0] || null;

  // Handle Face Verified
  const handleFaceVerified = (result: {
    employee: Employee;
    confidenceScore: number;
    photoSnapshot: string;
  }) => {
    if (settings.enforceGeofence && !isWithinGeofence) {
      alert(
        `Presensi ditolak: Anda berada di luar radius kantor (${distanceMeters}m > ${office.radiusMeters}m). Dekati kantor atau gunakan opsi simulasi.`
      );
      return;
    }

    onRecordAttendance({
      employee: result.employee,
      type: attendanceType,
      method: 'face',
      photoSnapshot: result.photoSnapshot,
      confidenceScore: result.confidenceScore,
      coords: coords || {
        latitude: office.latitude,
        longitude: office.longitude,
        accuracy: 10,
      },
      distanceMeters,
      isWithinGeofence,
    });
  };

  // Handle Fingerprint Verified
  const handleFingerprintVerified = () => {
    if (!selectedEmployee) return;

    if (settings.enforceGeofence && !isWithinGeofence) {
      alert(
        `Presensi ditolak: Anda berada di luar radius kantor (${distanceMeters}m > ${office.radiusMeters}m).`
      );
      return;
    }

    onRecordAttendance({
      employee: selectedEmployee,
      type: attendanceType,
      method: 'fingerprint',
      photoSnapshot: selectedEmployee.avatarUrl,
      confidenceScore: 100,
      coords: coords || {
        latitude: office.latitude,
        longitude: office.longitude,
        accuracy: 10,
      },
      distanceMeters,
      isWithinGeofence,
    });
  };

  return (
    <div className="space-y-6">
      {/* Real-time Clock & Shift Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 rounded-3xl p-6 text-white shadow-lg border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-sky-500/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-sky-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{currentDateStr}</span>
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold tracking-tight tabular-nums font-mono text-white">
              {currentTime} <span className="text-xs text-sky-400 font-sans font-medium">WIB</span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Batas Masuk: <strong className="text-white">{settings.checkInEnd} WIB</strong> · Toleransi: <strong className="text-white">{settings.lateToleranceMinutes} Menit</strong>
            </p>
          </div>

          {/* Segmented Control: Masuk vs Pulang */}
          <div className="bg-slate-800/80 p-1.5 rounded-2xl flex items-center border border-slate-700/80 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                setAttendanceType('check_in');
                triggerHapticFeedback([20]);
              }}
              className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                attendanceType === 'check_in'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Absen Masuk
            </button>
            <button
              type="button"
              onClick={() => {
                setAttendanceType('check_out');
                triggerHapticFeedback([20]);
              }}
              className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                attendanceType === 'check_out'
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Absen Pulang
            </button>
          </div>
        </div>
      </div>

      {/* Main Terminal Layout: 2 Columns on desktop, 1 on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Biometric Scanner (Face / Fingerprint) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Method Selector Tabs */}
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setActiveMethod('face');
                  triggerHapticFeedback([20]);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                  activeMethod === 'face'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Camera className="w-4 h-4" />
                <span>Identifikasi Wajah (Face AI)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveMethod('fingerprint');
                  triggerHapticFeedback([20]);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                  activeMethod === 'fingerprint'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Fingerprint className="w-4 h-4" />
                <span>Sidik Jari (Fingerprint)</span>
              </button>
            </div>

            <span className="text-[11px] font-medium text-slate-500 hidden sm:inline">
              Autentikasi Biometrik
            </span>
          </div>

          {/* Active Scanner View */}
          {activeMethod === 'face' ? (
            <FaceScanner
              enrolledEmployees={employees}
              selectedEmployee={selectedEmployee}
              onFaceVerified={handleFaceVerified}
              disabled={settings.enforceGeofence && !isWithinGeofence}
            />
          ) : (
            <FingerprintScanner
              employee={selectedEmployee!}
              onFingerprintVerified={handleFingerprintVerified}
              disabled={settings.enforceGeofence && !isWithinGeofence}
            />
          )}

          {/* Geofence notice if blocked */}
          {settings.enforceGeofence && !isWithinGeofence && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 rounded-2xl flex items-center justify-between text-xs text-rose-700 dark:text-rose-300">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>Presensi ditahan: Anda berada di luar radius kantor ({distanceMeters}m).</span>
              </div>
              <button
                type="button"
                onClick={handleSimulateInOffice}
                className="font-bold underline underline-offset-2 shrink-0 hover:text-rose-900"
              >
                Simulasi Masuk Kantor
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Employee Selection & Geofence Radar */}
        <div className="lg:col-span-5 space-y-4">
          {/* Employee Target Profile Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Pilih Profil Karyawan (Untuk Verifikasi)
            </label>

            <select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold text-xs focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.nip}) - {emp.department}
                </option>
              ))}
            </select>

            {/* Selected Employee Preview Pill */}
            {selectedEmployee && (
              <div className="mt-4 flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                <img
                  src={selectedEmployee.avatarUrl}
                  alt={selectedEmployee.name}
                  className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                />
                <div className="min-w-0 flex-1">
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {selectedEmployee.name}
                  </h5>
                  <p className="text-[11px] font-mono text-slate-500">
                    NIP: {selectedEmployee.nip}
                  </p>
                  <p className="text-[11px] text-sky-600 dark:text-sky-400 font-medium truncate">
                    {selectedEmployee.role} · {selectedEmployee.department}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Interactive Geofence Radar */}
          <GeofenceRadar
            office={office}
            currentCoords={coords}
            distanceMeters={distanceMeters}
            isWithinGeofence={isWithinGeofence}
            onCalibrateToHere={() => {
              if (coords) {
                onCalibrateOfficeToCoords(coords);
                setDistanceMeters(0);
                setIsWithinGeofence(true);
              }
            }}
            onSimulateInOffice={handleSimulateInOffice}
          />

          {/* Recent Attendance Feed Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h5 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-sky-600" />
                Catatan Kehadiran Terbaru Hari Ini
              </h5>
              <span className="text-[10px] text-slate-400 font-mono">Real-time Feed</span>
            </div>

            <div className="space-y-2">
              {recentRecords.slice(0, 4).map((rec) => (
                <div
                  key={rec.id}
                  className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-xs border border-slate-100 dark:border-slate-800"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-white ${
                        rec.type === 'check_in' ? 'bg-emerald-600' : 'bg-sky-600'
                      }`}
                    >
                      {rec.method === 'face' ? (
                        <Camera className="w-3.5 h-3.5" />
                      ) : (
                        <Fingerprint className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[130px]">
                        {rec.employeeName}
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        {rec.time} · {rec.type === 'check_in' ? 'Masuk' : 'Pulang'}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      rec.status === 'on_time'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                    }`}
                  >
                    {rec.status === 'on_time' ? 'Tepat Waktu' : 'Terlambat'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
