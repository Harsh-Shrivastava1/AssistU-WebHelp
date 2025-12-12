// Simple wrapper for Web Speech API

let recognition: any = null;
let isContinuousMode = false;
let onResultCallback: ((text: string) => void) | null = null;

export const startListening = (onResult: (text: string) => void) => {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    console.warn("Speech recognition not supported");
    return null;
  }

  // @ts-ignore
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  // Prevent multiple instances
  if (recognition) {
    try {
      recognition.stop();
    } catch(e) {}
  }

  recognition = new SpeechRecognition();
  
  recognition.continuous = false; // We use restart logic for better control
  recognition.interimResults = false;
  recognition.lang = 'en-US';

  onResultCallback = onResult;
  isContinuousMode = true;

  recognition.onresult = (event: any) => {
    const transcript = event.results[0][0].transcript;
    console.log("User said:", transcript);
    if (onResultCallback) onResultCallback(transcript);
  };

  recognition.onerror = (event: any) => {
    // Determine if we should ignore the error (e.g. no speech detected)
    if (event.error === 'no-speech') {
        // Just ignore
    } else {
        console.warn("Speech recognition error", event.error);
    }
  };

  recognition.onend = () => {
    if (isContinuousMode) {
      try {
        // Small delay to prevent CPU thrashing if it fails repeatedly
        setTimeout(() => {
            if (isContinuousMode && recognition) {
                recognition.start();
            }
        }, 100);
      } catch (e) {
        console.log("Recognition restart failed", e);
      }
    }
  };

  try {
    recognition.start();
  } catch (e) {
    console.log("Recognition start error", e);
  }

  return recognition;
};

export const stopListening = () => {
  isContinuousMode = false;
  onResultCallback = null;
  if (recognition) {
    try {
      recognition.stop();
    } catch (e) {
      // ignore
    }
    recognition = null;
  }
};
