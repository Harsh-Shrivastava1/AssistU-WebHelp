import React, { useState, useRef, useCallback, useEffect } from 'react';
import CameraPreview, { CameraHandle } from './components/CameraPreview';
import ControlPanel from './components/ControlPanel';
import OutputPanel from './components/OutputPanel';
import { AnalysisResult, AnalysisType, AppMode } from './types';
import { analyzeImage, analyzeLiveFrame, processVoiceCommand } from './services/geminiService';
import { speakText, stopSpeaking } from './services/ttsService';
import { startListening, stopListening } from './services/voiceService';

function App() {
  const [mode, setMode] = useState<AppMode>(AppMode.IDLE);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [userCommand, setUserCommand] = useState<string>("");
  
  const cameraRef = useRef<CameraHandle>(null);
  const processingRef = useRef<boolean>(false);
  const modeRef = useRef<AppMode>(AppMode.IDLE); // Ref to track mode in async loops
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync ref with state
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  const toggleCamera = () => {
    if (isCameraActive) {
      setIsCameraActive(false);
      setMode(AppMode.IDLE);
      stopSpeaking();
      stopListening();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    } else {
      setIsCameraActive(true);
      setMode(AppMode.CAMERA_ACTIVE);
      speakText("Camera started. Ready.");
    }
  };

  // ----------------------------------------------------------------------
  // SINGLE SHOT ANALYSIS (Original Features)
  // ----------------------------------------------------------------------
  const handleAnalysis = useCallback(async (type: AnalysisType) => {
    if (!cameraRef.current) return;
    
    stopSpeaking();
    const imageBase64 = cameraRef.current.captureImage();
    if (!imageBase64) {
      speakText("Camera capture failed.");
      return;
    }

    setMode(AppMode.PROCESSING);
    speakText("Analyzing...");

    try {
      const textResponse = await analyzeImage(imageBase64, type);
      const newResult: AnalysisResult = {
        text: textResponse,
        type: type,
        timestamp: Date.now()
      };
      setResult(newResult);
      setMode(AppMode.CAMERA_ACTIVE);
      speakText(textResponse);
    } catch (error) {
      console.error(error);
      setMode(AppMode.ERROR);
      setResult({
        text: "Error processing image.",
        type: type,
        timestamp: Date.now()
      });
      speakText("Error processing.");
    }
  }, []);

  // ----------------------------------------------------------------------
  // LIVE NAVIGATOR / VOICE ASSISTANT MODE
  // ----------------------------------------------------------------------
  const startLiveMode = () => {
    if (mode === AppMode.LIVE_ASSISTANT) {
      // Stop Live Mode
      setMode(AppMode.CAMERA_ACTIVE);
      stopSpeaking();
      stopListening();
      speakText("Live navigation stopped.");
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      return;
    }

    // Start Live Mode
    setMode(AppMode.LIVE_ASSISTANT);
    speakText("Voice assistant active. I am listening.");
    
    // Start Continuous Voice Recognition
    startListening((transcript) => {
      // When voice is detected, we immediately trigger a voice command cycle
      // This bypasses the standard navigation loop delay
      handleVoiceInput(transcript);
    });

    // Start Background Navigation Loop
    runLiveLoop();
  };

  // Immediate handler for voice commands
  const handleVoiceInput = async (transcript: string) => {
    if (modeRef.current !== AppMode.LIVE_ASSISTANT) return;
    if (!transcript.trim()) return;

    setUserCommand(transcript);
    console.log("Processing Voice Command:", transcript);

    // Cancel pending navigation loop to avoid double-speak
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    // Wait slightly if processing is already happening, effectively simple debounce
    if (processingRef.current) {
        // Force interrupt current processing if possible (not easy with promises), 
        // but mostly we just wait for the next slot.
        // For now, let's just proceed.
    }

    processingRef.current = true;
    
    try {
        if (cameraRef.current) {
            const image = cameraRef.current.captureImage();
            if (image) {
                // Acknowledge logic if needed, but we want speed.
                const response = await processVoiceCommand(image, transcript);
                
                if (response.speech) {
                    setResult({
                        text: response.speech,
                        type: AnalysisType.NAVIGATOR_FRAME,
                        timestamp: Date.now(),
                        isUrgent: response.isUrgent
                    });
                    stopSpeaking(); // Stop anything else
                    speakText(response.speech);
                }
            }
        }
    } catch(e) {
        console.error("Voice processing error", e);
    } finally {
        processingRef.current = false;
        setUserCommand(""); // Clear display of command
        // Restart the navigation loop after the voice response
        timeoutRef.current = setTimeout(runLiveLoop, 4000); // Give time for voice reply to finish
    }
  };

  // Background loop for obstacle detection and safe path (Runs when user is silent)
  const runLiveLoop = async () => {
    // Safety check
    if (modeRef.current !== AppMode.LIVE_ASSISTANT) return;
    
    // Skip if already processing (e.g., a voice command is being handled)
    if (processingRef.current) {
      timeoutRef.current = setTimeout(runLiveLoop, 500);
      return;
    }

    processingRef.current = true;

    try {
      if (cameraRef.current) {
        const image = cameraRef.current.captureImage();
        
        if (image) {
          const response = await analyzeLiveFrame(image);

          if (response.speech) {
            setResult({
              text: response.speech,
              type: AnalysisType.NAVIGATOR_FRAME,
              timestamp: Date.now(),
              isUrgent: response.isUrgent
            });

            // If urgent, always speak.
            // If not urgent, only speak if we haven't spoken recently? 
            // For now, simple logic: just speak. The loop delay controls frequency.
            if (response.isUrgent) {
               stopSpeaking();
               speakText(response.speech);
            } else {
               // Normal navigation guidance
               speakText(response.speech);
            }
          }
        }
      }
    } catch (e) {
      console.error("Live loop error", e);
    } finally {
      processingRef.current = false;
      // Schedule next frame. 
      if (modeRef.current === AppMode.LIVE_ASSISTANT) {
        timeoutRef.current = setTimeout(runLiveLoop, 2500); 
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Premium Header with Gradient Text */}
      <header className="py-8 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 flex flex-col items-center">
          <div className="flex items-center gap-3 mb-1">
             <span className="text-3xl">🟦</span>
             <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gradient">
              AssistU
             </h1>
          </div>
          <p className="text-lg font-medium text-slate-500 tracking-wide">
            AI Accessibility Navigator
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-8 py-8 flex flex-col gap-8">
        
        {/* Camera Section */}
        <section aria-label="Camera Feed" className="w-full">
          <CameraPreview 
            ref={cameraRef} 
            isActive={isCameraActive} 
          />
          
          {/* Active Voice Indicator Pill */}
          {mode === AppMode.LIVE_ASSISTANT && (
             <div className="mt-6 flex flex-col items-center gap-3 animate-float">
                <span className="inline-flex items-center gap-2 px-6 py-2 rounded-full text-sm font-bold bg-red-50 text-red-600 border border-red-200 shadow-sm animate-pulse-ring">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                  LISTENING & WATCHING
                </span>
                
                {userCommand && (
                  <div className="bg-white px-6 py-3 rounded-2xl shadow-lg border border-indigo-100 transform transition-all duration-300">
                    <p className="text-indigo-900 text-lg font-medium flex items-center gap-2">
                      <span className="text-indigo-400">You:</span> "{userCommand}"
                    </p>
                  </div>
                )}
             </div>
          )}
        </section>

        {/* Controls Section */}
        <section aria-label="Control Panel">
          <ControlPanel 
            mode={mode}
            isCameraActive={isCameraActive}
            onToggleCamera={toggleCamera}
            onAnalyze={handleAnalysis}
            onToggleLiveMode={startLiveMode}
          />
        </section>

        {/* Output Section */}
        <section aria-label="Analysis Results" className="pb-12">
          <OutputPanel 
            result={result}
            mode={mode}
          />
        </section>

      </main>

      <footer className="py-8 text-center text-slate-400 text-sm font-medium border-t border-slate-200 bg-white">
        <p>Powered by Gemini 3 Pro Multimodal • Premium Access</p>
      </footer>

    </div>
  );
}

export default App;