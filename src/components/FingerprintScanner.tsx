import React, { useState } from 'react';
import { Employee } from '../types/attendance';
import { verifyDeviceFingerprint, triggerHapticFeedback } from '../utils/biometrics';
import { Fingerprint, CheckCircle2, ShieldAlert, Sparkles } from 'lucide-react';

interface FingerprintScannerProps {
  employee: Employee;
  onFingerprintVerified: () => void;
  disabled?: boolean;
}

export const FingerprintScanner: React.FC<FingerprintScannerProps> = ({
  employee,
  onFingerprintVerified,
  disabled = false,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [scanMessage, setScanMessage] = useState<string>(
    'Sentuh tombol sensor sidik jari di bawah untuk autentikasi'
  );

  const handleScan = async () => {
    if (disabled || isScanning || isSuccess) return;

    setIsScanning(true);
    setScanMessage('Memindai sensor sidik jari perangkat Android...');
    triggerHapticFeedback([40]);

    try {
      const result = await verifyDeviceFingerprint(employee.credentialId);
      if (result.success) {
        setIsSuccess(true);
        setScanMessage('✓ Sidik Jari Terverifikasi & Sesuai');
        triggerHapticFeedback([50, 70, 50]);
        setTimeout(() => {
          onFingerprintVerified();
        }, 600);
      } else {
        setIsScanning(false);
        setScanMessage(result.errorMessage || 'Sidik jari tidak cocok. Silakan coba lagi.');
        triggerHapticFeedback([100, 50, 100]);
      }
    } catch {
      setIsScanning(false);
      setScanMessage('Gagal membaca sensor biometrik.');
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center text-white shadow-xl relative overflow-hidden">
      {/* Background glow circle */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="mb-4">
        <h4 className="text-base font-bold text-white flex items-center justify-center gap-2">
          <Fingerprint className="w-5 h-5 text-sky-400" />
          Autentikasi Biometrik Sidik Jari
        </h4>
        <p className="text-xs text-slate-400 mt-1">
          Opsi verifikasi ganda untuk pegawai: <strong className="text-slate-200">{employee.name}</strong>
        </p>
      </div>

      {/* Interactive Biometric Sensor Touch Pad */}
      <div className="my-6 flex justify-center">
        <button
          type="button"
          onClick={handleScan}
          disabled={disabled || isSuccess}
          className={`relative group w-28 h-28 rounded-full flex items-center justify-center transition-all duration-300 focus:outline-hidden ${
            isSuccess
              ? 'bg-emerald-600/20 border-2 border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.4)]'
              : isScanning
              ? 'bg-sky-600/30 border-2 border-sky-400 scale-95 animate-pulse shadow-[0_0_25px_rgba(56,189,248,0.4)]'
              : 'bg-slate-800/80 border-2 border-slate-700 hover:border-sky-400 active:scale-95 shadow-inner hover:shadow-[0_0_20px_rgba(56,189,248,0.25)]'
          }`}
          title="Ketuk untuk memindai sidik jari"
        >
          {/* Animated concentric rings during scan */}
          {isScanning && !isSuccess && (
            <div className="absolute inset-0 rounded-full border border-sky-400/50 animate-ping" />
          )}

          {isSuccess ? (
            <CheckCircle2 className="w-14 h-14 text-emerald-400 transition-transform duration-300 scale-110" />
          ) : (
            <Fingerprint
              className={`w-14 h-14 transition-colors duration-300 ${
                isScanning ? 'text-sky-300' : 'text-slate-400 group-hover:text-sky-400'
              }`}
            />
          )}
        </button>
      </div>

      <div className="min-h-[40px] flex items-center justify-center">
        <p
          className={`text-xs font-medium max-w-xs transition-colors ${
            isSuccess
              ? 'text-emerald-400 font-bold'
              : isScanning
              ? 'text-sky-300 animate-pulse'
              : 'text-slate-300'
          }`}
        >
          {scanMessage}
        </p>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          Android Biometrics Native API
        </span>
        <button
          type="button"
          onClick={handleScan}
          disabled={disabled || isSuccess}
          className="text-sky-400 hover:text-sky-300 font-semibold underline underline-offset-2"
        >
          {isSuccess ? 'Berhasil' : 'Pindai Sekarang'}
        </button>
      </div>
    </div>
  );
};
