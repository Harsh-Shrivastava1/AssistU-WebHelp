import { GoogleGenAI } from "@google/genai";
import { AnalysisType } from "../types";

// Initialize Gemini Client
// Using API_KEY as per latest instructions
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-3-pro-preview';

export const analyzeImage = async (
  base64Image: string, 
  type: AnalysisType
): Promise<string> => {
  
  let prompt = "";
  let systemInstruction = "You are a helpful visual assistant for a blind user. Be concise, accurate, and prioritize safety.";

  switch (type) {
    case AnalysisType.SCENE_DESCRIPTION:
      prompt = `
        Analyze this scene in detail for a visually impaired user.
        1. Describe the layout of the room or environment.
        2. Identify key objects and their relative positions (left, right, center, near, far).
        3. CRITICAL: Identify any potential obstacles, tripping hazards, or safety risks immediately.
        4. Describe any people or interactions present.
        Keep the tone descriptive but efficient.
      `;
      break;
    case AnalysisType.OCR_READING:
      prompt = `
        Extract and read all visible text in this image.
        1. If it is a document, menu, or sign, read the content in a logical reading order.
        2. If the text is very long, provide a structured summary of the key points first, then offer to read more.
        3. If there is no text, explicitly state "No text detected."
      `;
      break;
    case AnalysisType.QUICK_SUMMARY:
      prompt = `
        Provide a single, short sentence summarizing exactly what is directly in front of the camera. 
        Focus on the most important element a user needs to know instantly.
      `;
      break;
  }

  try {
    const cleanBase64 = base64Image.includes(',') 
      ? base64Image.split(',')[1] 
      : base64Image;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
          { text: prompt }
        ]
      },
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.4,
      }
    });

    const text = response.text;
    if (!text) throw new Error("No description generated.");
    return text;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to analyze image. Please try again.");
  }
};

interface LiveNavResponse {
  speech: string;
  isUrgent: boolean;
}

// Handler for User Voice Commands (Conversational Mode)
export const processVoiceCommand = async (
  base64Image: string,
  userSpeech: string
): Promise<LiveNavResponse> => {
  try {
    const cleanBase64 = base64Image.includes(',') 
      ? base64Image.split(',')[1] 
      : base64Image;

    const prompt = `
      USER VOICE COMMAND: "${userSpeech}"
      
      TASK:
      1. Answer the user's question or follow their command based on the visual input.
      2. If the user asks for guidance/navigation, check for obstacles and safe paths.
      3. If you detect immediate danger (tripping hazards, collisions), flag as URGENT.
      4. Keep the response SHORT and CONVERSATIONAL (1-2 sentences).
      
      Output JSON only:
      {
        "speech": "Your spoken reply here.",
        "isUrgent": boolean
      }
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: 'application/json',
        systemInstruction: "You are a smart, friendly voice assistant for a blind user. Speak naturally.",
        temperature: 0.3,
      }
    });

    const text = response.text;
    if (!text) return { speech: "I couldn't understand that.", isUrgent: false };

    try {
      const data = JSON.parse(text) as LiveNavResponse;
      return data;
    } catch {
      return { speech: text, isUrgent: false };
    }
  } catch (error) {
    console.error("Voice Command API Error:", error);
    return { speech: "Connection error.", isUrgent: false };
  }
};

// Handler for Background Navigation Loop
export const analyzeLiveFrame = async (
  base64Image: string
): Promise<LiveNavResponse> => {
  try {
    const cleanBase64 = base64Image.includes(',') 
      ? base64Image.split(',')[1] 
      : base64Image;

    const prompt = `
        Analyze the path ahead for a blind user.
        
        1. DISTANCE & OBJECTS: Identify objects and estimate distance:
           - Very Close (0-1m)
           - Near (1-2m)
           - Medium (2-4m)
           - Far (4m+)
        
        2. OBSTACLE ALERT:
           - If an object is "Very Close" or "Near" AND in the center path, flag as URGENT hazard.
        
        3. SAFE PATH:
           - Suggest: "Continue straight", "Move left", "Move right", or "Stop".
        
        Output JSON format only:
        {
          "speech": "The spoken response to the user. Include distance info (e.g., 'Table 1 meter ahead') and navigation commands.",
          "isUrgent": boolean // true if collision is imminent or path is blocked
        }
      `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: 'application/json',
        systemInstruction: "You are a real-time navigation assistant. Speak directly to the user. Be extremely concise. Use meters for distance.",
        temperature: 0.2, // Low temp for consistent navigation data
      }
    });

    const text = response.text;
    if (!text) return { speech: "No data", isUrgent: false };

    try {
      const data = JSON.parse(text) as LiveNavResponse;
      return data;
    } catch (e) {
      return { speech: text, isUrgent: false };
    }

  } catch (error) {
    console.error("Gemini Live API Error:", error);
    return { speech: "", isUrgent: false };
  }
};
