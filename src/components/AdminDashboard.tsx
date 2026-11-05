import React, { useState, useMemo } from 'react';
import {
  AttendanceRecord,
  Employee,
  OfficeLocation,
  WorkShiftSettings,
} from '../types/attendance';
import { exportAttendanceToExcel, printAttendanceReportPDF } from '../utils/exportUtils';
import { RegisterFaceModal } from './RegisterFaceModal';
import {
  Users,
  Calendar,
  FileSpreadsheet,
  Printer,
  Search,
  Filter,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Fingerprint,
  Camera,
  Plus,
  Trash2,
  Edit,
  ExternalLink,
  ShieldCheck,
  CloudCheck,
  RefreshCw,
  Sliders,
  Settings,
  Eye,
  X,
} from 'lucide-react';

interface AdminDashboardProps {
  employees: Employee[];
  attendanceRecords: AttendanceRecord[];
  office: OfficeLocation;
  settings: WorkShiftSettings;
  isOnline: boolean;
  pendingSyncCount: number;
  onSaveEmployee: (emp: Employee) => void;
  onDeleteEmployee: (id: string) => void;
  onSaveOffice: (office: OfficeLocation) => void;
  onSaveSettings: (settings: WorkShiftSettings) => void;
  onTriggerSync: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  employees,
  attendanceRecords,
  office,
  settings,
  isOnline,
  pendingSyncCount,
  onSaveEmployee,
  onDeleteEmployee,
  onSaveOffice,
  onSaveSettings,
  onTriggerSync,
}) => {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'reports' | 'employees' | 'settings'>('reports');

  // Filters for attendance reports
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedMethod, setSelectedMethod] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('');

  // Modals
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [inspectRecord, setInspectRecord] = useState<AttendanceRecord | null>(null);

  // Settings form states
  const [officeName, setOfficeName] = useState(office.name);
  const [officeAddress, setOfficeAddress] = useState(office.address);
  const [officeLat, setOfficeLat] = useState(office.latitude.toString());
  const [officeLng, setOfficeLng] = useState(office.longitude.toString());
  const [officeRadius, setOfficeRadius] = useState(office.radiusMeters.toString());

  const [companyName, setCompanyName] = useState(settings.companyName);
  const [checkInEnd, setCheckInEnd] = useState(settings.checkInEnd);
  const [checkOutStart, setCheckOutStart] = useState(settings.checkOutStart);
  const [lateTolerance, setLateTolerance] = useState(settings.lateToleranceMinutes.toString());
  const [enforceGeofence, setEnforceGeofence] = useState(settings.enforceGeofence);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Filter attendance records
  const filteredRecords = useMemo(() => {
    return attendanceRecords.filter((rec) => {
      const matchQuery =
        !searchQuery ||
        rec.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.nip.includes(searchQuery);

      const matchDept = selectedDept === 'all' || rec.department === selectedDept;
      const matchStatus = selectedStatus === 'all' || rec.status === selectedStatus;
      const matchMethod = selectedMethod === 'all' || rec.method === selectedMethod;
      const matchDate = !selectedDate || rec.date === selectedDate;

      return matchQuery && matchDept && matchStatus && matchMethod && matchDate;
    });
  }, [attendanceRecords, searchQuery, selectedDept, selectedStatus, selectedMethod, selectedDate]);

  // Statistics calculation for today
  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecords = attendanceRecords.filter((r) => r.date === todayStr);
  const todayCheckIns = todayRecords.filter((r) => r.type === 'check_in');
  const todayOnTime = todayCheckIns.filter((r) => r.status === 'on_time').length;
  const todayLate = todayCheckIns.filter((r) => r.status === 'late').length;
  const totalEmployeesCount = employees.length || 1;
  const attendancePercentage = Math.round((todayCheckIns.length / totalEmployeesCount) * 100);

  // Unique departments for filter dropdown
  const departments = Array.from(new Set(employees.map((e) => e.department)));

  // Save office settings
  const handleSaveOfficeAndShift = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveOffice({
      ...office,
      name: officeName,
      address: officeAddress,
      latitude: parseFloat(officeLat) || office.latitude,
      longitude: parseFloat(officeLng) || office.longitude,
      radiusMeters: parseInt(officeRadius, 10) || 100,
    });

    onSaveSettings({
      ...settings,
      companyName,
      checkInEnd,
      checkOutStart,
      lateToleranceMinutes: parseInt(lateTolerance, 10) || 15,
      enforceGeofence,
    });

    setSaveSuccessMsg('Pengaturan kantor dan jam kerja berhasil disimpan!');
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Admin KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Total Karyawan
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">
              {employees.length}
            </span>
            <Users className="w-5 h-5 text-sky-600" />
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Terdaftar dalam sistem</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Hadir Hari Ini
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">
              {todayCheckIns.length}
            </span>
            <span className="text-xs font-bold text-sky-600 tabular-nums">
              {attendancePercentage}%
            </span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Rasio kehadiran aktif</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block">
            Tepat Waktu
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-extrabold text-emerald-600 tabular-nums">
              {todayOnTime}
            </span>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">
            Sebelum {settings.checkInEnd} WIB
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <span className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider block">
            Terlambat
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-extrabold text-rose-600 tabular-nums">
              {todayLate}
            </span>
            <AlertTriangle className="w-5 h-5 text-rose-500" />
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">
            Melebihi toleransi {settings.lateToleranceMinutes} mnt
          </span>
        </div>

        <div className="col-span-2 lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Sinkronisasi Cloud
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                {isOnline ? 'Cloud Terhubung' : 'Mode Offline Aktif'}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
            <span className="text-slate-500">Pending: {pendingSyncCount}</span>
            <button
              onClick={onTriggerSync}
              disabled={!isOnline || pendingSyncCount === 0}
              className="text-sky-600 hover:text-sky-700 font-semibold disabled:opacity-40 flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Sinkronkan
            </button>
          </div>
        </div>
      </div>

      {/* Admin Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
            activeTab === 'reports'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Laporan &amp; Rekap Kehadiran
        </button>
        <button
          onClick={() => setActiveTab('employees')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 ${
            activeTab === 'employees'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          Karyawan &amp; Wajah ({employees.length})
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 ${
            activeTab === 'settings'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          Pengaturan Geofence &amp; Jam Kerja
        </button>
      </div>

      {/* TAB 1: REPORTS & AUDIT TABLE */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          {/* Action Bar: Export & Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            {/* Search Input */}
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama karyawan atau NIP..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
              />
            </div>

            {/* Export Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => exportAttendanceToExcel(filteredRecords, settings)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs active:scale-95"
                title="Unduh data dalam format file Excel (.csv)"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Ekspor Excel</span>
              </button>

              <button
                type="button"
                onClick={() => printAttendanceReportPDF(filteredRecords, settings)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs active:scale-95 border border-slate-700"
                title="Cetak atau simpan laporan ke format PDF A4"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak / PDF</span>
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div>
              <label className="block text-[10px] text-slate-500 font-medium mb-1">
                Filter Departemen
              </label>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs"
              >
                <option value="all">Semua Departemen</option>
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-slate-500 font-medium mb-1">
                Status Kehadiran
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs"
              >
                <option value="all">Semua Status</option>
                <option value="on_time">Tepat Waktu</option>
                <option value="late">Terlambat</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-slate-500 font-medium mb-1">
                Metode Autentikasi
              </label>
              <select
                value={selectedMethod}
                onChange={(e) => setSelectedMethod(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs"
              >
                <option value="all">Semua Metode</option>
                <option value="face">Wajah (Face ID)</option>
                <option value="fingerprint">Fingerprint</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-slate-500 font-medium mb-1">
                Pilih Tanggal
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs"
              />
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Waktu &amp; Tanggal</th>
                    <th className="py-3 px-4">Karyawan</th>
                    <th className="py-3 px-4">Tipe &amp; Metode</th>
                    <th className="py-3 px-4">Geofence Lokasi</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Cloud Sync</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        Tidak ada catatan presensi yang cocok dengan kriteria filter.
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((rec) => (
                      <tr
                        key={rec.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition"
                      >
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="font-bold text-slate-900 dark:text-white tabular-nums block">
                            {rec.time}
                          </span>
                          <span className="text-[11px] text-slate-400 tabular-nums">
                            {rec.date}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 shrink-0">
                              {rec.photoSnapshot ? (
                                <img
                                  src={rec.photoSnapshot}
                                  alt={rec.employeeName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center font-bold text-slate-500 text-xs">
                                  {rec.employeeName.charAt(0)}
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white truncate max-w-[160px]">
                                {rec.employeeName}
                              </p>
                              <p className="text-[10px] text-slate-500 font-mono">
                                NIP: {rec.nip} · {rec.department}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                            {rec.type === 'check_in' ? 'Masuk' : 'Pulang'}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-sky-600 dark:text-sky-400">
                            {rec.method === 'face' ? (
                              <>
                                <Camera className="w-3 h-3" /> Wajah (Face ID)
                              </>
                            ) : (
                              <>
                                <Fingerprint className="w-3 h-3" /> Fingerprint
                              </>
                            )}
                          </span>
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="font-mono text-xs tabular-nums text-slate-800 dark:text-slate-200 block">
                            {rec.location.distanceFromOfficeMeters} m
                          </span>
                          <span
                            className={`text-[10px] font-semibold ${
                              rec.location.isWithinGeofence
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            {rec.location.isWithinGeofence ? '✓ Dalam Radius' : '⚠ Di Luar Radius'}
                          </span>
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              rec.status === 'on_time'
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                            }`}
                          >
                            {rec.status === 'on_time' ? 'Tepat Waktu' : 'Terlambat'}
                          </span>
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="text-[11px] text-slate-500 flex items-center gap-1">
                            {rec.syncStatus === 'synced' ? (
                              <span className="text-emerald-600 font-medium flex items-center gap-1">
                                <CloudCheck className="w-3.5 h-3.5" /> Cloud
                              </span>
                            ) : (
                              <span className="text-amber-600 font-medium flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" /> Pending
                              </span>
                            )}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setInspectRecord(rec)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-sky-600 transition"
                            title="Lihat Detail Bukti Presensi"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
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

      {/* TAB 2: EMPLOYEE & FACE ENROLLMENT MANAGEMENT */}
      {activeTab === 'employees' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Daftar Pegawai &amp; Status Identifikasi Biometrik
              </h4>
              <p className="text-xs text-slate-500">
                Kelola profil wajah terdaftar dan autentikator sidik jari per karyawan
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingEmployee(null);
                setIsRegisterModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition shadow-xs active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Daftarkan Karyawan Baru</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {employees.map((emp) => (
              <div
                key={emp.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start gap-3">
                    <img
                      src={emp.avatarUrl}
                      alt={emp.name}
                      className="w-12 h-12 rounded-xl object-cover bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700"
                    />
                    <div className="min-w-0 flex-1">
                      <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {emp.name}
                      </h5>
                      <p className="text-[11px] font-mono text-slate-500">NIP: {emp.nip}</p>
                      <p className="text-[11px] text-slate-500 truncate">{emp.role}</p>
                      <span className="text-[10px] text-sky-600 dark:text-sky-400 font-medium block mt-0.5">
                        {emp.department}
                      </span>
                    </div>
                  </div>

                  {/* Biometric Status Badges */}
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap gap-1.5">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                        emp.hasFaceRegistered
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <Camera className="w-3 h-3" />
                      {emp.hasFaceRegistered ? 'Wajah Terdaftar' : 'Belum Ada Wajah'}
                    </span>

                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                        emp.hasBiometricRegistered
                          ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <Fingerprint className="w-3 h-3" />
                      {emp.hasBiometricRegistered ? 'Fingerprint Aktif' : 'Fingerprint Belum'}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingEmployee(emp);
                      setIsRegisterModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition flex items-center gap-1"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit / Scan Wajah</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteEmployee(emp.id)}
                    className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 transition"
                    title="Hapus Karyawan"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: GEOFENCE & SHIFT SETTINGS */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveOfficeAndShift} className="space-y-6">
          {saveSuccessMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {saveSuccessMsg}
            </div>
          )}

          {/* Office Geofencing Settings */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <MapPin className="w-5 h-5 text-sky-600" />
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Konfigurasi Geofencing Titik Kantor
                </h4>
                <p className="text-xs text-slate-500">
                  Tentukan titik sentral dan radius toleransi jarak (meter) untuk kehadiran
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Lokasi / Cabang
                </label>
                <input
                  type="text"
                  required
                  value={officeName}
                  onChange={(e) => setOfficeName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Radius Geofence Maksimal (Meter)
                </label>
                <input
                  type="number"
                  required
                  min="10"
                  max="5000"
                  value={officeRadius}
                  onChange={(e) => setOfficeRadius(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Latitude GPS
                </label>
                <input
                  type="text"
                  required
                  value={officeLat}
                  onChange={(e) => setOfficeLat(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Longitude GPS
                </label>
                <input
                  type="text"
                  required
                  value={officeLng}
                  onChange={(e) => setOfficeLng(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Alamat Lengkap Kantor
                </label>
                <input
                  type="text"
                  required
                  value={officeAddress}
                  onChange={(e) => setOfficeAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                />
              </div>
            </div>
          </div>

          {/* Work Shift Settings */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Clock className="w-5 h-5 text-sky-600" />
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Jam Kerja &amp; Batas Toleransi Keterlambatan
                </h4>
                <p className="text-xs text-slate-500">
                  Parameter otomatis untuk menentukan status &quot;Tepat Waktu&quot; atau &quot;Terlambat&quot;
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Jam Masuk Kantor
                </label>
                <input
                  type="time"
                  required
                  value={checkInEnd}
                  onChange={(e) => setCheckInEnd(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Toleransi Keterlambatan (Menit)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  max="60"
                  value={lateTolerance}
                  onChange={(e) => setLateTolerance(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Jam Pulang Kantor
                </label>
                <input
                  type="time"
                  required
                  value={checkOutStart}
                  onChange={(e) => setCheckOutStart(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                />
              </div>

              <div className="sm:col-span-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enforceGeofence}
                    onChange={(e) => setEnforceGeofence(e.target.checked)}
                    className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500"
                  />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Terapkan Pembatasan Ketat Radius Geofence (Tolak presensi jika di luar radius)
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition shadow-md active:scale-98"
            >
              Simpan Semua Perubahan
            </button>
          </div>
        </form>
      )}

      {/* MODAL: REGISTER / EDIT EMPLOYEE */}
      {isRegisterModalOpen && (
        <RegisterFaceModal
          employee={editingEmployee}
          onSave={(emp) => {
            onSaveEmployee(emp);
            setIsRegisterModalOpen(false);
          }}
          onClose={() => setIsRegisterModalOpen(false)}
        />
      )}

      {/* MODAL: INSPECT ATTENDANCE PROOF */}
      {inspectRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-sky-600" />
                Bukti Presensi &amp; Verifikasi Geotag
              </h4>
              <button
                onClick={() => setInspectRecord(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-300 dark:border-slate-700">
                {inspectRecord.photoSnapshot ? (
                  <img
                    src={inspectRecord.photoSnapshot}
                    alt={inspectRecord.employeeName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-slate-400">
                    No Pic
                  </div>
                )}
              </div>
              <div>
                <h5 className="text-sm font-bold text-slate-900 dark:text-white">
                  {inspectRecord.employeeName}
                </h5>
                <p className="text-xs text-slate-500 font-mono">NIP: {inspectRecord.nip}</p>
                <p className="text-xs text-slate-500">{inspectRecord.department}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <span className="text-[10px] text-slate-400 block">Waktu Presensi</span>
                <p className="font-bold tabular-nums">
                  {inspectRecord.date} {inspectRecord.time} WIB
                </p>
              </div>
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <span className="text-[10px] text-slate-400 block">Metode Autentikasi</span>
                <p className="font-bold capitalize">
                  {inspectRecord.method === 'face' ? 'Wajah (Face ID)' : 'Fingerprint'}
                </p>
              </div>
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <span className="text-[10px] text-slate-400 block">Jarak ke Kantor</span>
                <p className="font-bold tabular-nums">
                  {inspectRecord.location.distanceFromOfficeMeters} m ({inspectRecord.location.isWithinGeofence ? 'Dalam Area' : 'Luar Area'})
                </p>
              </div>
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <span className="text-[10px] text-slate-400 block">Skor Kecocokan</span>
                <p className="font-bold tabular-nums">
                  {inspectRecord.confidenceScore ? `${inspectRecord.confidenceScore}%` : '100%'}
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-xs space-y-1">
              <span className="text-[10px] text-slate-400 block font-semibold">
                Koordinat GPS Valid
              </span>
              <p className="font-mono text-slate-700 dark:text-slate-300">
                Lat: {inspectRecord.location.latitude.toFixed(6)}, Lng: {inspectRecord.location.longitude.toFixed(6)}
              </p>
              <a
                href={`https://www.google.com/maps?q=${inspectRecord.location.latitude},${inspectRecord.location.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="text-sky-600 hover:text-sky-700 font-semibold flex items-center gap-1 text-[11px] pt-1"
              >
                <ExternalLink className="w-3 h-3" />
                Buka di Google Maps
              </a>
            </div>

            <button
              type="button"
              onClick={() => setInspectRecord(null)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
