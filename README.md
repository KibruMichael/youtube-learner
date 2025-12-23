# 📺 YouTube Learner AI

**Turn any YouTube video into a learning opportunity.**
This application generates detailed **Transcripts** and **AI Insights** (Key Takeaways) for YouTube videos of ANY length—from 2-minute clips to 3-hour documentaries.

---

## ✨ Features

- **🚀 Universal Support**: Works with videos of any length (bypassing standard AI token limits).
- **🌍 Multi-Language**: Supports **English** 🇺🇸 and **Amharic** 🇪🇹 transcription.
- **🧠 AI Insights**: Automatically extracts the top 5 key takeaways/summary points.
- **📝 Full Transcript**: Generates a clean, time-stamped transcript.
- **💾 History**: Saves all your analyzed videos to your personal library (via Firebase).
- **⚡ Fast Processing**: Uses a synchronous webhook architecture for immediate feedback.

---

## 🛠️ Architecture

This project uses a modern "Serverless" architecture to handle heavy AI processing without a backend server:

1.  **Frontend (React + Vite)**: Handles the UI and sends requests.
2.  **Make.com (Backend Logic)**: Orchestrates the AI processing.
    -   **Step 1**: Fetches transcript text via **RapidAPI/Tactiq** (Avoids large video file downloads).
    -   **Step 2**: Sends text to **Google Gemini 1.5 Flash** for analysis.
    -   **Step 3**: Returns the result to the Frontend.
3.  **Firebase (Database & Auth)**: Handles User Login and Data Storage.

---

## 📋 Prerequisites

Before you begin, ensure you have:

1.  **Node.js** installed (v16 or higher).
2.  A **Google Firebase** account (Free).
3.  A **Make.com** account (Free).
4.  A **RapidAPI** account (Free) for the "YouTube Transcripts" API.

---

## ⚙️ Setup Guide

### 1. Clone & Install
```bash
# Clone the repository
git clone <your-repo-url>

# Navigate into the folder
cd youtube-learner

# Install dependencies
npm install
```

### 2. Firebase Setup
1.  Go to [Firebase Console](https://console.firebase.google.com/).
2.  Create a new project.
3.  **Authentication**: Enable **Google Sign-In**.
4.  **Firestore Database**: Create a database (Start in **Test Mode** for easier setup).
5.  **Project Settings**:
    -   Go to Project Settings > General.
    -   Scroll down to "Your apps" > Web App.
    -   Copy the `firebaseConfig` object.
6.  **Update Code**:
    -   Open `src/firebase.ts`.
    -   Replace the `firebaseConfig` object with your own keys.

### 3. Make.com Setup (The Engine)
You need to create **TWO** separate scenarios in Make.com.

#### 🟢 Scenario A: Transcript Generator
**Goal**: Get the full text transcript.

1.  **Create a new Scenario**.
2.  **Module 1: Webhook** (Custom Webhook)
    -   Create a webhook and copy the URL.
    -   *Note this URL for later.*
3.  **Module 2: HTTP** (Make a request)
    -   **URL**: `https://youtube-transcripts-transcribe-youtube-video-to-text.p.rapidapi.com/transcribe`
    -   **Method**: `POST`
    -   **Headers**:
        -   `x-rapidapi-key`: `YOUR_RAPIDAPI_KEY`
        -   `x-rapidapi-host`: `youtube-transcripts-transcribe-youtube-video-to-text.p.rapidapi.com`
    -   **Body Type**: `JSON` (application/json)
    -   **Request Content**: 
        ```json
        {
          "url": "{{1.url}}",
          "lang": "{{1.lang}}"
        }
        ```
    -   **Parse Response**: `Yes`
4.  **Module 3: Google Gemini AI** (Generate a response)
    -   **Model**: `gemini-1.5-flash`
    -   **Prompt**: `Format this transcript into a JSON array with timestamps: {{2.captions}}`
    -   **Response Format**: Text.
5.  **Module 4: Webhook Response**
    -   **Status**: `200`
    -   **Body**: `{{3.text}}` (The output from Gemini).

#### 🔵 Scenario B: AI Insights Generator
**Goal**: Get the 5 key takeaways.

1.  **Create a new Scenario**.
2.  **Module 1: Webhook** (Custom Webhook)
    -   Create a NEW webhook and copy the URL.
3.  **Module 2: HTTP** (Same as above).
4.  **Module 3: Google Gemini AI**
    -   **Model**: `gemini-1.5-flash`
    -   **Prompt**: `Analyze this transcript and provide 5 key insights as a JSON array of strings: {{2.captions}}`
5.  **Module 4: Webhook Response**
    -   **Status**: `200`
    -   **Body**: `{{3.text}}` (The output from Gemini).

### 4. Connect Frontend to Backend
1.  Open `src/App.tsx`.
2.  Find the `insightsWebhookUrl` and `transcriptWebhookUrl` variables.
3.  Replace them with your **Make.com Webhook URLs** from the steps above.

---

## 🚀 How to Run

1.  Start the development server:
    ```bash
    npm run dev
    ```
2.  Open your browser to `http://localhost:3000` (or the port shown).
3.  **Sign In** with Google.
4.  Paste a YouTube URL (e.g., `https://www.youtube.com/watch?v=...`).
5.  Click **"Get Insights"**.
6.  Watch the magic happen! ✨

---

## ❓ Troubleshooting

| Issue | Solution |
|-------|----------|
| **"Scenario failed to complete"** | Ensure you are using `gemini-1.5-flash` (it's faster) and your Webhook Response is set to return 200 OK. |
| **"Token Limit Exceeded"** | You might be sending the *Video File* instead of *Text*. Ensure your Gemini module is processing the *Text* output from the HTTP module. |
| **Transcript is empty** | Check if the video actually has captions/subtitles on YouTube. |
| **CORS Error** | In Make.com Webhook settings, ensure "Access-Control-Allow-Origin" includes your localhost or `*`. |

---

## 📜 License
This project is open source. Feel free to use and modify!
