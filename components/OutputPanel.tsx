import React from 'react';
import { AnalysisResult, AppMode, AnalysisType } from '../types';

interface OutputPanelProps {
  result: AnalysisResult | null;
  mode: AppMode;
}

const OutputPanel: React.FC<OutputPanelProps> = ({ result, mode }) => {
  const isLive = mode === AppMode.LIVE_ASSISTANT;
  const isProcessing = mode === AppMode.PROCESSING;
  const isUrgent = result?.isUrgent;

  // Premium colors based on state
  let borderClass = "border-indigo-500";
  let titleColor = "text-indigo-600";
  let title = "Assistant Output";
  let statusBadge = null;

  if (isLive) {
    borderClass = isUrgent ? "border-red-500" : "border-emerald-500";
    titleColor = isUrgent ? "text-red-600" : "text-emerald-600";
    title = isUrgent ? "OBSTACLE WARNING" : "Live Navigation";
    statusBadge = (
      <span className={`text-xs font-bold uppercase px-2 py-1 rounded border ${isUrgent ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
        {isUrgent ? "Urgent" : "Active"}
      </span>
    );
  }

  return (
    <div 
      className={`glass-panel rounded-2xl border-l-8 ${borderClass} p-8 shadow-xl transition-all duration-300 min-h-[200px] flex flex-col justify-center relative overflow-hidden`}
      aria-live={isUrgent ? "assertive" : "polite"}
      role="region"
      aria-label="Output Panel"
    >
      {/* Header Line */}
      <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-4">
        <h2 className={`text-xl font-extrabold tracking-wide uppercase flex items-center gap-3 ${titleColor}`}>
          {isLive && (
            <span className="relative flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isUrgent ? 'bg-red-400' : 'bg-emerald-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${isUrgent ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
            </span>
          )}
          {title}
        </h2>
        {statusBadge}
      </div>
      
      {/* Content Area */}
      <div className="relative z-10">
        {isProcessing ? (
          <div className="flex flex-col items-center justify-center py-6 space-y-4 animate-pulse">
            <div className="w-full h-4 bg-slate-200 rounded"></div>
            <div className="w-5/6 h-4 bg-slate-200 rounded"></div>
            <div className="w-3/4 h-4 bg-slate-200 rounded"></div>
            <p className="text-sm text-slate-400 font-medium uppercase tracking-widest mt-2">Processing...</p>
          </div>
        ) : result ? (
          <div className="prose prose-slate prose-lg max-w-none">
             <p className={`text-2xl leading-relaxed font-medium ${isUrgent ? 'text-red-700' : 'text-slate-700'}`}>
               {result.text}
             </p>
             <div className="mt-6 flex items-center gap-2 text-xs text-slate-400 font-medium uppercase tracking-wide">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
               Processed at: {new Date(result.timestamp).toLocaleTimeString()}
             </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-xl text-slate-400 font-light italic">
              {isLive ? "Initializing navigation systems..." : "Ready to assist. Start camera to begin."}
            </p>
          </div>
        )}
      </div>

      {/* Decorative Background Icon */}
      <div className="absolute -bottom-6 -right-6 text-slate-50 opacity-50 z-0">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-40 w-40" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
        </svg>
      </div>
    </div>
  );
};

export default OutputPanel;