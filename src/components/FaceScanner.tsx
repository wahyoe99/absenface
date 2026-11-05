import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Employee } from '../types/attendance';
import {
  extractFaceFromCanvas,
  captureSnapshotFromVideo,
  FaceDetectionResult,
} from '../utils/faceRecognition';
import { triggerHapticFeedback } from '../utils/biometrics';
import { Camera, RefreshCw, CheckCircle2, AlertCircle, Sparkles, UserCheck } from 'lucide-react';

interface FaceScannerProps {
  enrolledEmployees: Employee[];
  selectedEmployee: Employee | null;
  onFaceVerified: (result: {
    employee: Employee;
    confidenceScore: number;
    photoSnapshot: string;
  }) => void;
  disabled?: boolean;
}

export const FaceScanner: React.FC<FaceScannerProps> = ({
  enrolledEmployees,
  selectedEmployee,
  onFaceVerified,
  disabled = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('user');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastResult, setLastResult] = useState<FaceDetectionResult | null>(null);
  const [isSuccessLocked, setIsSuccessLocked] = useState(false);
  const [livenessCount, setLivenessCount] = useState(0);

  // Initialize camera stream
  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: cameraFacing,
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.warn('Camera access issue:', err);
      setCameraError(
        'Kamera tidak dapat diakses atau izin ditolak. Anda dapat menggunakan mode simulasi wajah di bawah.'
      );
    }
  }, [cameraFacing, stream]);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraFacing]);

  // Flip camera (front / back)
  const toggleCameraFacing = () => {
    setCameraFacing((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  // Main real-time frame analysis loop
  useEffect(() => {
    let animId: number;
    let isActive = true;

    const analyzeFrame = () => {
      if (!isActive || isSuccessLocked || disabled) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video && canvas && video.readyState === 4) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 480;

          // Draw current video frame to hidden processing canvas
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          // If a specific employee was selected, filter candidate list to them or all
          const candidateList = selectedEmployee ? [selectedEmployee] : enrolledEmployees;
          const result = extractFaceFromCanvas(canvas, candidateList);
          setLastResult(result);

          // If high confidence face is matched
          if (result.hasFace && result.matchedEmployee && result.confidenceScore >= 78) {
            setLivenessCount((prev) => prev + 1);

            // Require 3 consistent frames to lock in (prevents transient false positives)
            if (livenessCount >= 3) {
              setIsSuccessLocked(true);
              triggerHapticFeedback([50, 70, 50]);

              const snapshot = captureSnapshotFromVideo(video);
              onFaceVerified({
                employee: result.matchedEmployee,
                confidenceScore: result.confidenceScore,
                photoSnapshot: snapshot,
              });
              return;
            }
          } else {
            setLivenessCount(0);
          }
        }
      }

      animId = requestAnimationFrame(analyzeFrame);
    };

    if (stream && !isSuccessLocked) {
      setIsAnalyzing(true);
      animId = requestAnimationFrame(analyzeFrame);
    }

    return () => {
      isActive = false;
      cancelAnimationFrame(animId);
      setIsAnalyzing(false);
    };
  }, [stream, isSuccessLocked, disabled, enrolledEmployees, selectedEmployee, livenessCount, onFaceVerified]);

  // Simulated instant face recognition test for environments without camera
  const handleSimulatedVerify = () => {
    const target = selectedEmployee || enrolledEmployees[0];
    if (!target) return;

    setIsSuccessLocked(true);
    triggerHapticFeedback([40, 80, 40]);

    // Generate a fallback avatar snapshot
    onFaceVerified({
      employee: target,
      confidenceScore: 98.4,
      photoSnapshot: target.avatarUrl,
    });
  };

  const handleResetScanner = () => {
    setIsSuccessLocked(false);
    setLivenessCount(0);
    setLastResult(null);
  };

  return (
    <div className="relative w-full overflow-hidden rounded-3xl bg-slate-950 border border-slate-800 shadow-xl flex flex-col items-center">
      {/* Video Viewport Container */}
      <div className="relative w-full aspect-[3/4] sm:aspect-[4/3] max-h-[460px] bg-slate-900 flex items-center justify-center overflow-hidden">
        {/* Real Video Element */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            cameraError ? 'opacity-20' : 'opacity-100'
          } ${cameraFacing === 'user' ? 'scale-x-[-1]' : ''}`}
        />

        {/* Hidden analysis canvas */}
        <canvas ref={canvasRef} className="hidden" />

        {/* HUD Overlay Graphic */}
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6">
          {/* Top Camera Controls & Mode Indicator */}
          <div className="flex items-center justify-between z-10 pointer-events-auto">
            <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-white text-xs">
              <span className={`w-2 h-2 rounded-full ${isSuccessLocked ? 'bg-emerald-400' : 'bg-sky-400 animate-pulse'}`} />
              <span className="font-medium tracking-tight">
                {isSuccessLocked ? 'Wajah Terkunci' : 'AI Face Scanner'}
              </span>
            </div>

            <button
              type="button"
              onClick={toggleCameraFacing}
              className="p-2.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/15 text-white active:scale-95 transition"
              title="Putar Kamera Depan / Belakang"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Central Face Target Framing Reticle */}
          <div className="relative mx-auto w-56 h-64 sm:w-64 sm:h-72 flex items-center justify-center">
            {/* Corner brackets */}
            <div
              className={`absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 rounded-tl-xl transition-colors duration-300 ${
                isSuccessLocked
                  ? 'border-emerald-400'
                  : lastResult?.hasFace
                  ? 'border-sky-400'
                  : 'border-white/40'
              }`}
            />
            <div
              className={`absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 rounded-tr-xl transition-colors duration-300 ${
                isSuccessLocked
                  ? 'border-emerald-400'
                  : lastResult?.hasFace
                  ? 'border-sky-400'
                  : 'border-white/40'
              }`}
            />
            <div
              className={`absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 rounded-bl-xl transition-colors duration-300 ${
                isSuccessLocked
                  ? 'border-emerald-400'
                  : lastResult?.hasFace
                  ? 'border-sky-400'
                  : 'border-white/40'
              }`}
            />
            <div
              className={`absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 rounded-br-xl transition-colors duration-300 ${
                isSuccessLocked
                  ? 'border-emerald-400'
                  : lastResult?.hasFace
                  ? 'border-sky-400'
                  : 'border-white/40'
              }`}
            />

            {/* Scanning beam animation when active */}
            {!isSuccessLocked && (
              <div className="absolute inset-x-2 h-1 bg-gradient-to-r from-transparent via-sky-400 to-transparent shadow-[0_0_12px_#38bdf8] animate-scanline pointer-events-none" />
            )}

            {/* Center target crosshair */}
            <div className="w-8 h-8 border border-white/20 rounded-full flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-sky-400/80 rounded-full" />
            </div>

            {/* Success Lock Icon */}
            {isSuccessLocked && (
              <div className="absolute inset-0 bg-emerald-500/20 backdrop-blur-2xs rounded-2xl flex flex-col items-center justify-center animate-in fade-in zoom-in duration-200">
                <CheckCircle2 className="w-16 h-16 text-emerald-400 drop-shadow-md" />
                <span className="text-white text-xs font-bold mt-2 uppercase tracking-wider bg-black/60 px-3 py-1 rounded-full">
                  100% Terverifikasi
                </span>
              </div>
            )}
          </div>

          {/* Bottom Live Feedback Pill */}
          <div className="z-10 text-center">
            <div className="inline-block bg-black/75 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 text-white shadow-lg max-w-[90%]">
              {isSuccessLocked ? (
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                  <UserCheck className="w-4 h-4 shrink-0" />
                  <span className="truncate">
                    {lastResult?.matchedEmployee?.name || selectedEmployee?.name || 'Karyawan Dikonfirmasi'}
                  </span>
                </div>
              ) : lastResult?.hasFace ? (
                <div className="space-y-0.5">
                  <p className="text-xs font-medium text-sky-300">
                    {lastResult.qualityMessage}
                  </p>
                  {lastResult.confidenceScore > 0 && (
                    <p className="text-[10px] text-slate-400 tabular-nums">
                      Kecocokan Geometris: {lastResult.confidenceScore}%
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-300 flex items-center justify-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-sky-400 animate-spin" />
                  Posisikan wajah Anda pada kotak pemindai
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Camera Permission Warning fallback */}
        {cameraError && (
          <div className="absolute inset-4 z-20 flex flex-col items-center justify-center text-center p-6 bg-slate-900/90 rounded-2xl border border-slate-700">
            <AlertCircle className="w-10 h-10 text-amber-400 mb-3" />
            <h5 className="text-sm font-semibold text-white mb-1">Akses Kamera Terkendala</h5>
            <p className="text-xs text-slate-400 mb-4 max-w-xs">{cameraError}</p>
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                type="button"
                onClick={startCamera}
                className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold"
              >
                Coba Kamera Lagi
              </button>
              <button
                type="button"
                onClick={handleSimulatedVerify}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Simulasi Presensi Wajah
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Action / Reset Bar */}
      <div className="w-full p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <Camera className="w-4 h-4 text-sky-400" />
          <span>Deteksi Wajah Real-Time</span>
        </div>

        <div className="flex items-center gap-2">
          {isSuccessLocked ? (
            <button
              type="button"
              onClick={handleResetScanner}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium transition"
            >
              Scan Ulang
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSimulatedVerify}
              className="text-[11px] text-sky-400 hover:text-sky-300 font-medium px-2 py-1 rounded hover:bg-slate-800 transition"
              title="Gunakan simulasi pengenalan wajah jika pencahayaan minim"
            >
              ⚡ Opsi Bypass / Quick Scan
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
