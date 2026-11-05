import {
  AttendanceRecord,
  Employee,
  OfficeLocation,
  WorkShiftSettings,
} from '../types/attendance';
import { DEFAULT_OFFICE } from './geofencing';

const STORAGE_KEYS = {
  EMPLOYEES: 'presensikita_employees_v1',
  ATTENDANCE: 'presensikita_attendance_v1',
  OFFICE: 'presensikita_office_v1',
  SETTINGS: 'presensikita_settings_v1',
  PENDING_SYNC: 'presensikita_pending_sync_v1',
  SIMULATED_OFFLINE: 'presensikita_simulated_offline_v1',
};

// Seed Employees with registered faces and biometrics
export const SEED_EMPLOYEES: Employee[] = [
  {
    id: 'emp-001',
    nip: '198904122015031001',
    name: 'Budi Santoso, S.Kom',
    department: 'Teknologi Informasi',
    role: 'Lead Mobile Engineer',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    hasFaceRegistered: true,
    hasBiometricRegistered: true,
    credentialId: 'bio_emp_001',
    phone: '0812-3456-7890',
    email: 'budi.santoso@presensikita.id',
    createdAt: '2026-01-10',
    // Pre-calculated geometric face vector
    faceVector: [
      0.38, 0.45, 0.28, 0.25, 1.34,
      0.45, 0.52, 0.61, 0.58, 0.49, 0.42,
      0.55, 0.64, 0.72, 0.70, 0.61, 0.53,
      0.62, 0.75, 0.81, 0.79, 0.68, 0.59,
      0.58, 0.71, 0.78, 0.76, 0.65, 0.55,
      0.51, 0.63, 0.69, 0.67, 0.59, 0.49,
      0.44, 0.54, 0.60, 0.58, 0.50, 0.43,
    ],
  },
  {
    id: 'emp-002',
    nip: '199208242018012002',
    name: 'Siti Rahmawati, S.E.',
    department: 'Keuangan & Akuntansi',
    role: 'Senior Financial Analyst',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    hasFaceRegistered: true,
    hasBiometricRegistered: true,
    credentialId: 'bio_emp_002',
    phone: '0813-9876-5432',
    email: 'siti.rahma@presensikita.id',
    createdAt: '2026-01-15',
    faceVector: [
      0.35, 0.42, 0.29, 0.27, 1.28,
      0.52, 0.58, 0.66, 0.63, 0.55, 0.48,
      0.60, 0.71, 0.79, 0.77, 0.68, 0.59,
      0.66, 0.79, 0.86, 0.84, 0.75, 0.65,
      0.62, 0.76, 0.83, 0.81, 0.72, 0.61,
      0.56, 0.67, 0.74, 0.72, 0.64, 0.54,
      0.48, 0.58, 0.65, 0.63, 0.55, 0.47,
    ],
  },
  {
    id: 'emp-003',
    nip: '199511052020121003',
    name: 'Ahmad Fadillah',
    department: 'Operasional & Lapangan',
    role: 'Field Operations Specialist',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    hasFaceRegistered: true,
    hasBiometricRegistered: false,
    phone: '0857-1234-5678',
    email: 'ahmad.fadillah@presensikita.id',
    createdAt: '2026-02-01',
    faceVector: [
      0.41, 0.46, 0.27, 0.24, 1.38,
      0.42, 0.49, 0.58, 0.55, 0.46, 0.40,
      0.52, 0.61, 0.69, 0.67, 0.58, 0.50,
      0.59, 0.71, 0.78, 0.76, 0.65, 0.56,
      0.55, 0.68, 0.75, 0.73, 0.62, 0.53,
      0.49, 0.60, 0.66, 0.64, 0.56, 0.47,
      0.41, 0.51, 0.57, 0.55, 0.47, 0.41,
    ],
  },
  {
    id: 'emp-004',
    nip: '199803152022032004',
    name: 'Dewi Lestari, M.Psi',
    department: 'Sumber Daya Manusia (HRD)',
    role: 'HR People Partner',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200',
    hasFaceRegistered: true,
    hasBiometricRegistered: true,
    credentialId: 'bio_emp_004',
    phone: '0878-5555-1234',
    email: 'dewi.lestari@presensikita.id',
    createdAt: '2026-02-15',
    faceVector: [
      0.36, 0.43, 0.28, 0.26, 1.30,
      0.48, 0.55, 0.63, 0.60, 0.52, 0.45,
      0.57, 0.68, 0.76, 0.74, 0.65, 0.56,
      0.63, 0.76, 0.83, 0.81, 0.72, 0.62,
      0.59, 0.73, 0.80, 0.78, 0.69, 0.58,
      0.53, 0.64, 0.71, 0.69, 0.61, 0.51,
      0.45, 0.55, 0.62, 0.60, 0.52, 0.44,
    ],
  },
];

export const DEFAULT_SETTINGS: WorkShiftSettings = {
  checkInStart: '06:00',
  checkInEnd: '08:00',
  checkOutStart: '17:00',
  lateToleranceMinutes: 15,
  enforceGeofence: true,
  minFaceConfidence: 75,
  companyName: 'PT Nusantara Digital Presensi',
  companyAddress: 'Gedung Menara Merdeka Lt. 14, Gambir, Jakarta Pusat 10110',
};

// Seed Attendance Records for today and recent days
function generateSeedAttendance(): AttendanceRecord[] {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const yest = new Date(today);
  yest.setDate(yest.getDate() - 1);
  const yestStr = yest.toISOString().split('T')[0];

  return [
    {
      id: 'att-001',
      employeeId: 'emp-001',
      employeeName: 'Budi Santoso, S.Kom',
      nip: '198904122015031001',
      department: 'Teknologi Informasi',
      timestamp: `${todayStr}T07:42:15.000Z`,
      date: todayStr,
      time: '07:42:15',
      type: 'check_in',
      method: 'face',
      location: {
        latitude: -6.17521,
        longitude: 106.82731,
        accuracy: 8,
        distanceFromOfficeMeters: 28,
        isWithinGeofence: true,
      },
      status: 'on_time',
      confidenceScore: 97.8,
      syncStatus: 'synced',
      notes: 'Presensi Wajah Berhasil',
    },
    {
      id: 'att-002',
      employeeId: 'emp-002',
      employeeName: 'Siti Rahmawati, S.E.',
      nip: '199208242018012002',
      department: 'Keuangan & Akuntansi',
      timestamp: `${todayStr}T08:18:04.000Z`,
      date: todayStr,
      time: '08:18:04',
      type: 'check_in',
      method: 'fingerprint',
      location: {
        latitude: -6.17545,
        longitude: 106.82711,
        accuracy: 12,
        distanceFromOfficeMeters: 45,
        isWithinGeofence: true,
      },
      status: 'late',
      confidenceScore: 100,
      syncStatus: 'synced',
      notes: 'Terlambat 3 menit setelah toleransi',
    },
    {
      id: 'att-003',
      employeeId: 'emp-004',
      employeeName: 'Dewi Lestari, M.Psi',
      nip: '199803152022032004',
      department: 'Sumber Daya Manusia (HRD)',
      timestamp: `${todayStr}T07:55:20.000Z`,
      date: todayStr,
      time: '07:55:20',
      type: 'check_in',
      method: 'face',
      location: {
        latitude: -6.17531,
        longitude: 106.8272,
        accuracy: 6,
        distanceFromOfficeMeters: 18,
        isWithinGeofence: true,
      },
      status: 'on_time',
      confidenceScore: 96.2,
      syncStatus: 'synced',
    },
    // Yesterday
    {
      id: 'att-004',
      employeeId: 'emp-001',
      employeeName: 'Budi Santoso, S.Kom',
      nip: '198904122015031001',
      department: 'Teknologi Informasi',
      timestamp: `${yestStr}T07:48:00.000Z`,
      date: yestStr,
      time: '07:48:00',
      type: 'check_in',
      method: 'face',
      location: {
        latitude: -6.17539,
        longitude: 106.82715,
        accuracy: 10,
        distanceFromOfficeMeters: 12,
        isWithinGeofence: true,
      },
      status: 'on_time',
      confidenceScore: 98.1,
      syncStatus: 'synced',
    },
    {
      id: 'att-005',
      employeeId: 'emp-001',
      employeeName: 'Budi Santoso, S.Kom',
      nip: '198904122015031001',
      department: 'Teknologi Informasi',
      timestamp: `${yestStr}T17:05:22.000Z`,
      date: yestStr,
      time: '17:05:22',
      type: 'check_out',
      method: 'fingerprint',
      location: {
        latitude: -6.17539,
        longitude: 106.82715,
        accuracy: 9,
        distanceFromOfficeMeters: 15,
        isWithinGeofence: true,
      },
      status: 'on_time',
      syncStatus: 'synced',
    },
  ];
}

class AttendanceSyncStorage {
  private syncListeners: (() => void)[] = [];

  constructor() {
    this.initStorage();
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.triggerAutoSync();
      });
    }
  }

  private initStorage() {
    if (typeof window === 'undefined') return;

    if (!localStorage.getItem(STORAGE_KEYS.EMPLOYEES)) {
      localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(SEED_EMPLOYEES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ATTENDANCE)) {
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(generateSeedAttendance()));
    }
    if (!localStorage.getItem(STORAGE_KEYS.OFFICE)) {
      localStorage.setItem(STORAGE_KEYS.OFFICE, JSON.stringify(DEFAULT_OFFICE));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PENDING_SYNC)) {
      localStorage.setItem(STORAGE_KEYS.PENDING_SYNC, JSON.stringify([]));
    }
  }

  // Network State
  public isOnline(): boolean {
    if (typeof window === 'undefined') return true;
    const isSimulatedOffline = localStorage.getItem(STORAGE_KEYS.SIMULATED_OFFLINE) === 'true';
    if (isSimulatedOffline) return false;
    return navigator.onLine;
  }

  public setSimulatedOffline(offline: boolean) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.SIMULATED_OFFLINE, offline ? 'true' : 'false');
    if (!offline) {
      this.triggerAutoSync();
    }
    this.notifyListeners();
  }

  public isSimulatedOffline(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(STORAGE_KEYS.SIMULATED_OFFLINE) === 'true';
  }

  // Subscription
  public subscribe(listener: () => void) {
    this.syncListeners.push(listener);
    return () => {
      this.syncListeners = this.syncListeners.filter((l) => l !== l);
    };
  }

  private notifyListeners() {
    for (const listener of this.syncListeners) {
      try {
        listener();
      } catch (e) {
        console.error(e);
      }
    }
  }

  // Employees
  public getEmployees(): Employee[] {
    if (typeof window === 'undefined') return SEED_EMPLOYEES;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
      return data ? JSON.parse(data) : SEED_EMPLOYEES;
    } catch {
      return SEED_EMPLOYEES;
    }
  }

  public saveEmployee(emp: Employee) {
    const list = this.getEmployees();
    const existingIdx = list.findIndex((e) => e.id === emp.id);
    if (existingIdx >= 0) {
      list[existingIdx] = emp;
    } else {
      list.unshift(emp);
    }
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(list));
    this.notifyListeners();
  }

  public deleteEmployee(id: string) {
    const list = this.getEmployees().filter((e) => e.id !== id);
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(list));
    this.notifyListeners();
  }

  // Attendance Records
  public getAttendanceRecords(): AttendanceRecord[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public getPendingSyncCount(): number {
    if (typeof window === 'undefined') return 0;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PENDING_SYNC);
      const list: string[] = data ? JSON.parse(data) : [];
      return list.length;
    } catch {
      return 0;
    }
  }

  /**
   * Save a new attendance record with automatic offline fallback.
   * If online, immediately marks as 'synced'.
   * If offline, marks as 'pending_sync' and enqueues in sync queue.
   */
  public recordAttendance(record: Omit<AttendanceRecord, 'syncStatus'>): AttendanceRecord {
    const online = this.isOnline();
    const syncStatus = online ? 'synced' : 'pending_sync';

    const fullRecord: AttendanceRecord = {
      ...record,
      syncStatus,
    };

    const records = this.getAttendanceRecords();
    records.unshift(fullRecord);
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(records));

    if (!online) {
      const pending: string[] = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.PENDING_SYNC) || '[]'
      );
      if (!pending.includes(fullRecord.id)) {
        pending.push(fullRecord.id);
        localStorage.setItem(STORAGE_KEYS.PENDING_SYNC, JSON.stringify(pending));
      }
    }

    this.notifyListeners();
    return fullRecord;
  }

  /**
   * Syncs all pending records when internet connects
   */
  public async triggerAutoSync(): Promise<{ syncedCount: number }> {
    if (!this.isOnline()) return { syncedCount: 0 };

    const pendingIds: string[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.PENDING_SYNC) || '[]'
    );
    if (pendingIds.length === 0) return { syncedCount: 0 };

    const records = this.getAttendanceRecords();
    let updatedCount = 0;

    for (const rec of records) {
      if (pendingIds.includes(rec.id) && rec.syncStatus === 'pending_sync') {
        rec.syncStatus = 'synced';
        updatedCount++;
      }
    }

    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(records));
    localStorage.setItem(STORAGE_KEYS.PENDING_SYNC, JSON.stringify([]));

    this.notifyListeners();
    return { syncedCount: updatedCount };
  }

  // Office Location
  public getOfficeLocation(): OfficeLocation {
    if (typeof window === 'undefined') return DEFAULT_OFFICE;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.OFFICE);
      return data ? JSON.parse(data) : DEFAULT_OFFICE;
    } catch {
      return DEFAULT_OFFICE;
    }
  }

  public saveOfficeLocation(loc: OfficeLocation) {
    localStorage.setItem(STORAGE_KEYS.OFFICE, JSON.stringify(loc));
    this.notifyListeners();
  }

  // Settings
  public getSettings(): WorkShiftSettings {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? JSON.parse(data) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  public saveSettings(settings: WorkShiftSettings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    this.notifyListeners();
  }
}

export const syncStorage = new AttendanceSyncStorage();
