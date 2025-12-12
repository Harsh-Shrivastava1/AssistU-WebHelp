export enum AppMode {
  IDLE = 'IDLE',
  CAMERA_ACTIVE = 'CAMERA_ACTIVE',
  PROCESSING = 'PROCESSING',
  LIVE_ASSISTANT = 'LIVE_ASSISTANT',
  ERROR = 'ERROR'
}

export enum AnalysisType {
  SCENE_DESCRIPTION = 'SCENE_DESCRIPTION',
  OCR_READING = 'OCR_READING',
  QUICK_SUMMARY = 'QUICK_SUMMARY',
  NAVIGATOR_FRAME = 'NAVIGATOR_FRAME'
}

export interface AnalysisResult {
  text: string;
  type: AnalysisType;
  timestamp: number;
  isUrgent?: boolean; // For obstacle alerts
  suggestedAction?: string; // For navigation guidance
}
