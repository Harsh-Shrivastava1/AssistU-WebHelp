import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';

interface CameraPreviewProps {
  isActive: boolean;
  onStreamReady?: () => void;
}

export interface CameraHandle {
  captureImage: () => string | null;
}

const CameraPreview = forwardRef<CameraHandle, CameraPreviewProps>(({ isActive, onStreamReady }, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Expose capture method to parent
  useImperativeHandle(ref, () => ({
    captureImage: () => {
      if (!videoRef.current || !canvasRef.current) return null;
      
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (!context) return null;

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Return base64 string
      return canvas.toDataURL('image/jpeg', 0.8);
    }
  }));

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        if (isActive && videoRef.current) {
          stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
              facingMode: 'environment', // Prefer back camera on mobile
              width: { ideal: 1280 },
              height: { ideal: 720 }
            } 
          });
          
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => {
               if(onStreamReady) onStreamReady();
            };
          }
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        alert("Could not access camera. Please ensure permissions are granted.");
      }
    };

    if (isActive) {
      startCamera();
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isActive, onStreamReady]);

  return (
    <div className={`relative w-full aspect-video bg-white rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 ${isActive ? 'ring-4 ring-indigo-500/20 shadow-indigo-500/20' : 'ring-1 ring-slate-200'}`}>
      
      {!isActive && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 text-slate-400">
          <div className="bg-white p-6 rounded-full shadow-sm mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-lg font-medium tracking-wide">Camera Inactive</p>
          <p className="text-sm text-slate-400 mt-1">Tap 'Start Camera' to begin</p>
        </div>
      )}

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full h-full object-cover transition-opacity duration-700 ${isActive ? 'opacity-100' : 'opacity-0'}`}
      />
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Overlay Decoration */}
      {isActive && (
        <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          LIVE
        </div>
      )}
    </div>
  );
});

export default CameraPreview;