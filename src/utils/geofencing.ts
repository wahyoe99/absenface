import { OfficeLocation } from '../types/attendance';

// Default Office: Monas / Balai Kota area or Jakarta Business District as baseline
export const DEFAULT_OFFICE: OfficeLocation = {
  id: 'office-hq',
  name: 'Kantor Pusat - Gedung Presensi',
  latitude: -6.175392,
  longitude: 106.827153,
  radiusMeters: 150, // 150 meters radius
  address: 'Jl. Medan Merdeka Selatan No. 8-9, Gambir, Jakarta Pusat',
  isActive: true,
};

/**
 * Calculates the great-circle distance between two points on the Earth surface
 * using the Haversine formula in meters.
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Get current device GPS location via browser Geolocation API
 */
export function getCurrentCoordinates(): Promise<{
  latitude: number;
  longitude: number;
  accuracy: number;
}> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Perangkat tidak mendukung GPS Geolocation'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy),
        });
      },
      (err) => {
        // Fallback gracefully if user rejects or simulated
        console.warn('Geolocation error:', err.message);
        reject(err);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 10000,
      }
    );
  });
}
