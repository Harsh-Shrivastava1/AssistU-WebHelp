<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# AssistU – AI Accessibility Navigator
Real-time Vision and Voice Navigation Assistant powered by Gemini 3 Pro.

AssistU is an AI-powered visual navigation system designed to assist visually-impaired users. Using Gemini 3 Pro’s multimodal vision, reasoning, text, and voice capabilities, AssistU provides scene understanding, obstacle alerts, safe path guidance, OCR text reading, and natural voice interaction in real time.

---

## Features

### 1. Real-Time Scene Description
Captures a camera frame and provides a detailed and structured understanding of the environment.

### 2. Live Navigation Mode
Continuously analyzes video feed to detect obstacles, estimate distances, and suggest safe navigation paths.
Alerts include:
- "Stop, obstacle ahead"
- "Move slightly left"
- "Path is clear"

### 3. Voice Assistant Mode
Users can speak naturally and ask:
- "What is around me?"
- "Is the path safe?"
- "Read the sign ahead"
AssistU replies using voice, combining visual and contextual reasoning.

### 4. OCR Text Reading
Reads signs, boards, menus, and documents aloud.

### 5. Scene Summary Mode
Provides a simplified overview of the entire visual environment.

---

## Tech Stack

Frontend:
- HTML, CSS, TypeScript
- WebRTC for camera access
- Speech Recognition and Speech Synthesis APIs

Backend:
- Node.js and Express
- Vision, navigation, OCR, and assistant endpoints
- Gemini 3 Pro API for multimodal reasoning

AI Models:
- Gemini 3 Pro Multimodal
- Gemini Audio/Text Models

---


## How It Works

1. Frontend captures a camera frame.
2. Sends image to backend.
3. Backend forwards it to Gemini Vision.
4. Gemini returns:
   - Object detection
   - Distance estimation
   - Obstacle alerts
   - Navigation suggestions
5. System converts the output to voice for the user.
6. Voice queries are processed using Gemini text and multimodal reasoning.

---

## Hackathon Submission
This project was created for the Gemini 3 Pro Hackathon under the Accessibility Track, demonstrating real-world impact through AI-based mobility assistance.

---

## Contributing
Pull requests are welcome. Contributors may add features such as improved UI, AR overlays, or extended navigation capabilities.

---

## License
MIT License




