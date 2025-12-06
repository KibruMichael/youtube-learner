# Complete Step-by-Step Guide to Fix Long Video Processing

## What We're Fixing:
- ❌ Videos over 2 hours fail with "Token limit exceeded"
- ❌ Processing times out with "500 Internal Server Error"
- ✅ After this fix: Videos of ANY length will work!

---

## Your Current Scenario:
```
[Webhook #1] → [Google Gemini AI #2] → [Webhook Response #3]
```

## What We'll Build:
```
[Webhook #1] → [HTTP (RapidAPI) #2] → [Google Gemini AI #3] → [Google Firestore #4] → [Webhook Response #5]
```

---

# PART 1: Get the Transcript (The Reliable Way)

We will use a specialized API to get the text transcript directly. This is faster, cheaper, and more reliable than downloading audio.

## Step 1: Get a RapidAPI Key (Free)
1. Go to **[RapidAPI.com](https://rapidapi.com/auth/sign-up)** and sign up (it's free).
2. Go to **[YouTube Transcripts API](https://rapidapi.com/micaelbh/api/youtube-transcripts-transcribe-youtube-video-to-text/pricing)**.
3. Click **"Subscribe"** on the **Basic (Free)** plan ($0.00/mo).
4. Go to the **"Endpoints"** tab and copy your **`x-rapidapi-key`**.

## Step 2: Add HTTP Module
1. In Make.com, add a new **HTTP** module after your Webhook.
2. Select **"Make a request"**.

**Configure it EXACTLY like this:**

- **URL**: `https://youtube-transcripts-transcribe-youtube-video-to-text.p.rapidapi.com/transcript`
- **Method**: `GET`
- **Headers**:
  - Item 1:
    - **Name**: `x-rapidapi-key`
    - **Value**: `PASTE_YOUR_KEY_HERE`
  - Item 2:
    - **Name**: `x-rapidapi-host`
    - **Value**: `youtube-transcripts-transcribe-youtube-video-to-text.p.rapidapi.com`
- **Query String**:
  - Item 1:
    - **Name**: `video_id`
    - **Value**: `{{1.videoId}}` (Map this from the Webhook)
  - Item 2:
    - **Name**: `lang`
    - **Value**: `en`
- **Parse Response**: `Yes`

**Click OK.**

---

# PART 2: Update Gemini Module (Process Text)

## Step 3: Configure Gemini
1. Open your **Google Gemini AI** module.
2. **Model**: Select `gemini-1.5-flash` (Faster & Cheaper) or `gemini-1.5-pro`.

### Configure "Messages":
- **Role**: `User`
- **Message Type**: `Text`
- **Text**:
  ```
  You are a transcript formatter. I will provide a raw YouTube transcript. Your job is to format it into a clean JSON array.

  INPUT TRANSCRIPT:
  {{2.data}}  <-- Map this from the HTTP module output

  INSTRUCTIONS:
  1. Parse the input transcript.
  2. Group text into logical sentences/segments.
  3. Assign a timestamp to each segment (format "MM:SS").
  4. Return ONLY a JSON array. No markdown, no code blocks, no other text.

  OUTPUT FORMAT:
  [
    {
      "timestamp": "00:00",
      "text": "First sentence of the video."
    },
    {
      "timestamp": "00:15",
      "text": "Second sentence..."
    }
  ]
  ```
- **File**: Ensure this section is **EMPTY**.

### Configure "System Instructions" (Crucial Fix):
- **Option A (Recommended)**: Disable/Toggle OFF "System Instructions".
- **Option B**: If enabled, set Text to: `You are a helpful assistant.`
- **Do NOT leave it enabled but empty**, or you will get a 400 error.

**Click OK.**

---

# PART 3: Add Firestore Module (Async Save)

## Step 4: Add Firestore Module
1. Add **"Google Cloud Firestore"** module after Gemini.
2. Select **"Update a Document"**.
3. **Connection**: Select your Firebase connection (or add one using Service Account JSON).

## Step 5: Configure Path & Fields
- **Document Path**: `users/{{1.uid}}/videos/{{1.videoId}}`
  *(Map `uid` and `videoId` from the Webhook)*

- **Fields to Update**:
  - **Field Name**: `transcript`
  - **Field Value**: `{{3.text}}` (Map the response text from Gemini)

**Click OK.**

---

# PART 4: Webhook Response (Immediate Return)

## Step 6: Update Webhook Response
1. Open the **Webhook Response** module (at the end).
2. **Status**: `200`
3. **Body**:
   ```json
   {
     "status": "processing",
     "message": "Transcript generation started. Results will appear automatically."
   }
   ```

**Click OK.**

---

# PART 5: Save and Test

1. **Save** the scenario.
2. **Turn it ON**.
3. Go to your App and test with a video!

## Troubleshooting
- **403 Error**: You didn't click "Subscribe" on the RapidAPI pricing page.
- **404 Error**: You used the wrong API URL. Use the one in Step 2.
- **400 Error (Gemini)**: You left "System Instructions" enabled but empty. Disable it.
- **Token Limit Error**: You are sending a video file instead of text. Ensure "File" is empty in Gemini.
