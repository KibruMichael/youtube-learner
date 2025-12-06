# Make.com Scenario Update Guide - TRANSCRIPT WEBHOOK

## Current Problem
Your scenario is timing out with `500 Internal Server Error` or `Token Limit Exceeded` because:
1. It's processing video (very expensive tokens)
2. It's trying to respond synchronously (times out after 40 seconds)

## Solution: Async Processing + Text Transcript API

---

## PART 1: Update Webhook to Accept New Parameters

### Step 1: Open Your Scenario
Navigate to: https://eu1.make.com/554276/scenarios/3769226/edit

### Step 2: Check the Webhook Module (First Module)
The webhook should now be receiving 3 parameters:
- `url` - The YouTube URL
- `uid` - The Firebase User ID (NEW)
- `videoId` - The Firestore Document ID (NEW)

✅ Your React app is already sending these! No changes needed here.

---

## PART 2: Switch to Transcript API (RapidAPI)

### Step 3: Delete Old Download Modules
Remove any "CloudConvert", "Cobalt", or "Download File" modules.

### Step 4: Add HTTP Module (RapidAPI)
Add a new **HTTP > Make a request** module.

**Configuration:**
- **URL**: `https://youtube-transcripts-transcribe-youtube-video-to-text.p.rapidapi.com/transcript`
- **Method**: `GET`
- **Headers**:
  - `x-rapidapi-key`: `YOUR_RAPIDAPI_KEY`
  - `x-rapidapi-host`: `youtube-transcripts-transcribe-youtube-video-to-text.p.rapidapi.com`
- **Query String**:
  - `video_id`: `{{1.videoId}}`
  - `lang`: `en`
- **Parse Response**: `Yes`

*(Note: You must subscribe to the Free tier of this API on RapidAPI.com first)*

---

## PART 3: Update Gemini Module

### Step 5: Configure Gemini for Text
- **Model**: `gemini-1.5-flash` (Recommended)
- **Message Type**: `Text`
- **File**: **EMPTY** (Do not map anything here)

**Prompt (Text):**
```
You are a transcript formatter. I will provide a raw YouTube transcript. Your job is to format it into a clean JSON array.

INPUT TRANSCRIPT:
{{2.data}}  <-- Map this from HTTP module

INSTRUCTIONS:
1. Parse the input transcript.
2. Group text into logical sentences/segments.
3. Assign a timestamp to each segment (format "MM:SS").
4. Return ONLY a JSON array. No markdown, no code blocks.

OUTPUT FORMAT:
[{"timestamp": "00:00", "text": "..."}]
```

**System Instructions:**
- **DISABLE** this section (Toggle OFF).
- If you cannot disable it, set text to: `You are a helpful assistant.`

---

## PART 4: Add Firestore Update Module

### Step 6: Add New Module After Gemini
- Select **"Google Cloud Firestore"** > **"Update a Document"**

### Step 7: Configure Path & Fields
- **Document Path**: `users/{{1.uid}}/videos/{{1.videoId}}`
- **Fields to Update**:
  - **Field Name**: `transcript`
  - **Field Value**: `{{3.text}}` (The JSON response from Gemini)

---

## PART 5: Handle the Webhook Response

### Step 8: Return Immediately
**Find the "Webhook Response" module** (at the end):
- **Status**: `200`
- **Body**: 
```json
{
  "status": "processing",
  "message": "Transcript generation started"
}
```

---

## Visual Flow Diagram

```
[React App] 
    ↓ (sends: url, uid, videoId)
[Make.com Webhook]
    ↓
[Return 200 OK immediately] ← App no longer waits!
    ↓
[HTTP: Get Transcript Text (RapidAPI)]
    ↓
[Gemini: Format Text to JSON]
    ↓
[Write to Firestore: users/{uid}/videos/{videoId}]
    ↓
[React App sees update via Firestore listener]
    ↓
[Transcript appears in UI! 🎉]
```

---

## Troubleshooting

### "403 Error from HTTP Module"
- You didn't click "Subscribe" on the RapidAPI pricing page. Go back and subscribe to the Free tier.

### "400 Error from Gemini"
- You likely left "System Instructions" enabled but empty. Disable it or add dummy text.

### "Token limit exceeded"
- You are sending a video file instead of text. Check the "File" section in Gemini - it should be empty.
