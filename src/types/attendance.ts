export interface Employee {
  id: string;
  nip: string;
  name: string;
  department: string;
  role: string;
  avatarUrl: string;
  faceVector?: number[]; // Geometric/proportional embedding vector for face matching
  hasFaceRegistered: boolean;
  hasBiometricRegistered: boolean;
  credentialId?: string;
  phone?: string;
  email?: string;
  createdAt: string;
}

export type AttendanceType = 'check_in' | 'check_out';
export type VerificationMethod = 'face' | 'fingerprint' | 'both';
export type AttendanceStatus = 'on_time' | 'late' | 'early_leave' | 'overtime';
export type SyncStatus = 'synced' | 'pending_sync';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  address?: string;
  distanceFromOfficeMeters: number;
  isWithinGeofence: boolean;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  nip: string;
  department: string;
  timestamp: string; // ISO 8601
  date: string; // YYYY-MM-DD
  time: string; // HH:mm:ss
  type: AttendanceType;
  method: VerificationMethod;
  photoSnapshot?: string; // base64 preview snapshot
  location: LocationData;
  status: AttendanceStatus;
  confidenceScore?: number; // e.g. 97.5%
  syncStatus: SyncStatus;
  notes?: string;
  deviceId?: string;
}

export interface OfficeLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  address: string;
  isActive: boolean;
}

export interface WorkShiftSettings {
  checkInStart: string; // "06:30"
  checkInEnd: string; // "08:00"
  checkOutStart: string; // "17:00"
  lateToleranceMinutes: number; // 15
  enforceGeofence: boolean;
  minFaceConfidence: number; // e.g. 80%
  companyName: string;
  companyAddress: string;
}
