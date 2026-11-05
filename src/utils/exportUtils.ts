import { AttendanceRecord, WorkShiftSettings } from '../types/attendance';

/**
 * Exports attendance records to an Excel-compatible CSV file with UTF-8 BOM
 */
export function exportAttendanceToExcel(
  records: AttendanceRecord[],
  settings: WorkShiftSettings
) {
  // UTF-8 BOM for Excel to open Indonesian text properly
  const BOM = '\uFEFF';

  // Excel Header Row
  const headers = [
    'No',
    'Tanggal',
    'Waktu',
    'NIP',
    'Nama Karyawan',
    'Departemen',
    'Tipe Presensi',
    'Metode Autentikasi',
    'Status Kehadiran',
    'Skor Verifikasi',
    'Jarak Kantor (m)',
    'Status Geofence',
    'Status Sinkronisasi',
    'Koordinat GPS',
    'Catatan',
  ];

  const rows = records.map((rec, index) => {
    const latLng = `${rec.location.latitude.toFixed(6)}, ${rec.location.longitude.toFixed(6)}`;
    const tipe = rec.type === 'check_in' ? 'Masuk' : 'Pulang';
    const metode =
      rec.method === 'face'
        ? 'Wajah'
        : rec.method === 'fingerprint'
        ? 'Fingerprint'
        : 'Wajah + Fingerprint';

    const statusMap: Record<string, string> = {
      on_time: 'Tepat Waktu',
      late: 'Terlambat',
      early_leave: 'Pulang Awal',
      overtime: 'Lembur',
    };

    const statusStr = statusMap[rec.status] || rec.status;
    const geofenceStr = rec.location.isWithinGeofence ? 'Dalam Radius' : 'Luar Radius';
    const syncStr = rec.syncStatus === 'synced' ? 'Tersinkronisasi Cloud' : 'Lokal (Pending)';
    const scoreStr = rec.confidenceScore ? `${rec.confidenceScore}%` : '-';

    return [
      index + 1,
      `"${rec.date}"`,
      `"${rec.time}"`,
      `"${rec.nip}"`,
      `"${rec.employeeName}"`,
      `"${rec.department}"`,
      `"${tipe}"`,
      `"${metode}"`,
      `"${statusStr}"`,
      `"${scoreStr}"`,
      rec.location.distanceFromOfficeMeters,
      `"${geofenceStr}"`,
      `"${syncStr}"`,
      `"${latLng}"`,
      `"${rec.notes || '-'}"`,
    ].join(',');
  });

  const companyMeta = [
    `"LAPORAN REKAPITULASI KEHADIRAN KARYAWAN"`,
    `"Perusahaan: ${settings.companyName}"`,
    `"Dicetak pada: ${new Date().toLocaleString('id-ID')}"`,
    `"Total Baris: ${records.length}"`,
    '',
  ].join('\n');

  const csvContent = BOM + companyMeta + headers.join(',') + '\n' + rows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const dateStr = new Date().toISOString().split('T')[0];
  link.setAttribute('download', `Laporan_Presensi_${settings.companyName.replace(/\s+/g, '_')}_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Triggers clean print-to-PDF layout formatted specifically for standard A4 report sheet
 */
export function printAttendanceReportPDF(
  records: AttendanceRecord[],
  settings: WorkShiftSettings,
  startDate?: string,
  endDate?: string
) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Popup terblokir oleh browser. Harap izinkan popup untuk mencetak laporan PDF.');
    return;
  }

  const todayStr = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Calculate summary statistics
  const totalHadir = records.length;
  const onTimeCount = records.filter((r) => r.status === 'on_time').length;
  const lateCount = records.filter((r) => r.status === 'late').length;
  const faceCount = records.filter((r) => r.method === 'face').length;
  const fingerCount = records.filter((r) => r.method === 'fingerprint').length;

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <title>Laporan Kehadiran - ${settings.companyName}</title>
      <style>
        @page { size: A4 landscape; margin: 15mm; }
        body {
          font-family: Arial, Helvetica, sans-serif;
          color: #1e293b;
          margin: 0;
          padding: 10px;
          font-size: 11px;
        }
        .header {
          border-bottom: 2px solid #0284c7;
          padding-bottom: 12px;
          margin-bottom: 16px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }
        .title {
          font-size: 18px;
          font-weight: bold;
          color: #0369a1;
          margin: 0 0 4px 0;
        }
        .subtitle {
          font-size: 12px;
          color: #64748b;
          margin: 0;
        }
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 10px;
          margin-bottom: 16px;
        }
        .kpi-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 8px 12px;
          text-align: center;
        }
        .kpi-val {
          font-size: 16px;
          font-weight: bold;
          color: #0f172a;
        }
        .kpi-label {
          font-size: 10px;
          color: #64748b;
          text-transform: uppercase;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        th {
          background-color: #0284c7;
          color: white;
          text-align: left;
          padding: 6px 8px;
          font-size: 10px;
          text-transform: uppercase;
        }
        td {
          padding: 6px 8px;
          border-bottom: 1px solid #e2e8f0;
        }
        tr:nth-child(even) td {
          background-color: #f8fafc;
        }
        .badge {
          display: inline-block;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 9px;
          font-weight: bold;
        }
        .badge-ontime { background: #dcfce7; color: #15803d; }
        .badge-late { background: #fee2e2; color: #b91c1c; }
        .badge-face { background: #e0f2fe; color: #0369a1; }
        .badge-finger { background: #ede9fe; color: #6d28d9; }
        .footer {
          margin-top: 30px;
          display: flex;
          justify-content: space-between;
          font-size: 11px;
        }
        .sign-box {
          text-align: center;
          width: 200px;
        }
        .sign-line {
          margin-top: 60px;
          border-top: 1px solid #334155;
          font-weight: bold;
        }
        @media print {
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="no-print" style="margin-bottom: 12px; background: #e0f2fe; padding: 10px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center;">
        <span>Klik tombol untuk menyimpan sebagai PDF atau cetak ke printer:</span>
        <button onclick="window.print()" style="background: #0284c7; color: white; border: none; padding: 6px 16px; border-radius: 4px; cursor: pointer; font-weight: bold;">
          Cetak / Unduh PDF
        </button>
      </div>

      <div class="header">
        <div>
          <h1 class="title">${settings.companyName.toUpperCase()}</h1>
          <p class="subtitle">${settings.companyAddress}</p>
          <p class="subtitle" style="margin-top: 4px;"><strong>Laporan Presensi Kehadiran Karyawan (Wajah & Biometrik)</strong></p>
        </div>
        <div style="text-align: right;">
          <p class="subtitle">Tanggal Cetak: ${todayStr}</p>
          <p class="subtitle">Periode: ${startDate || 'Semua'} s/d ${endDate || 'Hari Ini'}</p>
        </div>
      </div>

      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-val">${totalHadir}</div>
          <div class="kpi-label">Total Kehadiran</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-val" style="color: #16a34a;">${onTimeCount}</div>
          <div class="kpi-label">Tepat Waktu</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-val" style="color: #dc2626;">${lateCount}</div>
          <div class="kpi-label">Terlambat</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-val">${faceCount}</div>
          <div class="kpi-label">Autentikasi Wajah</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-val">${fingerCount}</div>
          <div class="kpi-label">Autentikasi Fingerprint</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width: 30px;">No</th>
            <th>Waktu Presensi</th>
            <th>NIP</th>
            <th>Nama Lengkap</th>
            <th>Departemen</th>
            <th>Tipe</th>
            <th>Metode</th>
            <th>Jarak GPS</th>
            <th>Status</th>
            <th>Sinkronisasi</th>
          </tr>
        </thead>
        <tbody>
          ${records
            .map(
              (r, idx) => `
            <tr>
              <td style="text-align: center;">${idx + 1}</td>
              <td>${r.date} ${r.time}</td>
              <td style="font-family: monospace;">${r.nip}</td>
              <td><strong>${r.employeeName}</strong></td>
              <td>${r.department}</td>
              <td>${r.type === 'check_in' ? 'Masuk' : 'Pulang'}</td>
              <td>
                <span class="badge ${r.method === 'face' ? 'badge-face' : 'badge-finger'}">
                  ${r.method === 'face' ? 'Face ID' : 'Fingerprint'}
                </span>
              </td>
              <td>${r.location.distanceFromOfficeMeters} m (${r.location.isWithinGeofence ? 'Dalam Area' : 'Luar Area'})</td>
              <td>
                <span class="badge ${r.status === 'on_time' ? 'badge-ontime' : 'badge-late'}">
                  ${r.status === 'on_time' ? 'Tepat Waktu' : 'Terlambat'}
                </span>
              </td>
              <td>${r.syncStatus === 'synced' ? 'Tersinkron Cloud' : 'Offline'}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>

      <div class="footer">
        <div class="sign-box">
          <p>Disiapkan Oleh:</p>
          <div class="sign-line">Petugas Absensi</div>
        </div>
        <div class="sign-box">
          <p>Mengetahui,</p>
          <div class="sign-line">Manager HRD / Pimpinan</div>
        </div>
      </div>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
