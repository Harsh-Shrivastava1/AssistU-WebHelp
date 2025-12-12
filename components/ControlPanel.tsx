import React from 'react';
import { AnalysisType, AppMode } from '../types';

interface ControlPanelProps {
  mode: AppMode;
  isCameraActive: boolean;
  onToggleCamera: () => void;
  onAnalyze: (type: AnalysisType) => void;
  onToggleLiveMode: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ 
  mode,
  isCameraActive, 
  onToggleCamera, 
  onAnalyze,
  onToggleLiveMode
}) => {
  
  const isProcessing = mode === AppMode.PROCESSING;
  const isLive = mode === AppMode.LIVE_ASSISTANT;
  
  // Base classes for the new premium button style
  const baseBtn = "relative overflow-hidden group flex flex-col items-center justify-center p-4 rounded-2xl transition-all duration-300 transform shadow-lg hover:shadow-xl hover:-translate-y-1 focus:ring-4 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none min-h-[140px]";
  
  // Typography for button labels
  const labelClass = "mt-3 font-bold text-sm tracking-wider uppercase";

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 mt-4">
      
      {/* Camera Toggle - Gradient Emerald/Red */}
      <button
        onClick={onToggleCamera}
        disabled={isProcessing || isLive}
        className={`${baseBtn} ${isCameraActive 
          ? 'bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-red-500/30 hover:shadow-red-500/40 focus:ring-red-300' 
          : 'bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-green-500/30 hover:shadow-green-500/40 focus:ring-green-300'}`}
        aria-label={isCameraActive ? "Stop Camera" : "Start Camera"}
      >
        <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm group-hover:scale-110 transition-transform">
          {isCameraActive ? (
             <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
             </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
        </div>
        <span className={labelClass}>{isCameraActive ? "Stop Cam" : "Start Cam"}</span>
      </button>

      {/* Live Navigator - Gradient Amber/Orange */}
      <button
        onClick={onToggleLiveMode}
        disabled={!isCameraActive}
        className={`${baseBtn} ${isLive 
          ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white ring-4 ring-orange-200 animate-pulse-ring' 
          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-orange-300 hover:text-orange-600'}`}
      >
        <div className={`p-3 rounded-full transition-colors ${isLive ? 'bg-white/20' : 'bg-slate-100 group-hover:bg-orange-100'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </div>
        <span className={labelClass}>{isLive ? "Live Active" : "Live Nav"}</span>
      </button>

      {/* Describe Scene - Gradient Blue */}
      <button
        onClick={() => onAnalyze(AnalysisType.SCENE_DESCRIPTION)}
        disabled={!isCameraActive || isProcessing || isLive}
        className={`${baseBtn} bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-blue-500/30 hover:shadow-blue-500/40 focus:ring-blue-300`}
      >
        <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm group-hover:scale-110 transition-transform">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <span className={labelClass}>Describe</span>
      </button>

      {/* Read Text - Gradient Violet */}
      <button
        onClick={() => onAnalyze(AnalysisType.OCR_READING)}
        disabled={!isCameraActive || isProcessing || isLive}
        className={`${baseBtn} bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-violet-500/30 hover:shadow-violet-500/40 focus:ring-violet-300`}
      >
        <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm group-hover:scale-110 transition-transform">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <span className={labelClass}>Read Text</span>
      </button>

      {/* Quick Summary - Gradient Cyan */}
      <button
        onClick={() => onAnalyze(AnalysisType.QUICK_SUMMARY)}
        disabled={!isCameraActive || isProcessing || isLive}
        className={`${baseBtn} bg-gradient-to-br from-cyan-500 to-teal-600 text-white shadow-cyan-500/30 hover:shadow-cyan-500/40 focus:ring-cyan-300`}
      >
        <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm group-hover:scale-110 transition-transform">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <span className={labelClass}>Summary</span>
      </button>

    </div>
  );
};

export default ControlPanel;