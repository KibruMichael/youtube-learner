# URGENT: Fix Token Limit - Step by Step

## The Problem
Error: `[400] The input token count exceeds the maximum number of tokens allowed 1048576`

**Root Cause**: You're sending VIDEO to Gemini, which uses massive tokens.
- 1 hour of VIDEO = ~950,000 tokens ❌
- 1 hour of AUDIO = ~115,000 tokens ✅ (8x more efficient!)

---

## SOLUTION: Switch to Audio Processing

### Step 1: Find Your YouTube Download Module

In your Make.com scenario, look for a module that downloads from YouTube. It might be:
- "YouTube" module
- "HTTP Request" module
- "Tools" > "Download file"
- Any module that fetches the video

### Step 2: Change the Download Settings

**Option A: If you have a "YouTube" module**
1. Click on the YouTube module
2. Look for a setting called:
   - "Format" or "Download Type" or "Media Type"
3. Change it from "Video" to **"Audio"** or **"Audio Only"**
4. If there's a quality setting, choose:
   - "128kbps" or "Medium Quality" (good enough for transcription)

**Option B: If you're using an HTTP request**
You'll need to use a different URL that points to the audio stream. 

**Better Solution**: Replace with a dedicated YouTube module that supports audio download.

### Step 3: Verify the Gemini Module Accepts Audio

1. Click on your "Google Gemini AI" module
2. Look at where you're sending the file
3. Make sure it's configured to accept audio files (MP3, M4A, WAV)
4. The model should be **"Gemini 1.5 Pro"** or **"Gemini 1.5 Flash"** (both support audio)

---

## Alternative: Use YouTube's Built-in Transcript

If changing to audio is too complicated, there's an EASIER solution:

### Use YouTube's Auto-Generated Transcript (No Download Needed!)

**Step 1: Install a YouTube Transcript Module**
1. In Make.com, click the **"+"** button to add a new module
2. Search for **"YouTube Transcript"** or **"Get YouTube Captions"**
3. If not available, use an HTTP module to call this API:
   ```
   https://youtube.com/youtubei/v1/get_transcript?videoId=VIDEO_ID
   ```

**Step 2: Send TEXT to Gemini (Super Cheap!)**
1. Instead of sending a video/audio file, send the transcript TEXT
2. This uses only ~5 tokens per second of video (super efficient!)
3. A 2-hour video transcript = only ~36,000 tokens ✅

**Step 3: Update Your Prompt**
Change your Gemini prompt to something like:
```
Analyze this YouTube transcript and provide:
1. Key insights and takeaways
2. Main topics discussed
3. Any action items or recommendations

Transcript:
{{transcript_text}}
```

---

## Which Solution Should You Choose?

| Method | Tokens for 2hr Video | Pros | Cons |
|--------|---------------------|------|------|
| **Video** | ~1,900,000 ❌ | Best quality | Exceeds limit, expensive |
| **Audio** | ~230,000 ✅ | Good accuracy | Requires download |
| **Text Transcript** | ~36,000 ✅✅ | Super cheap, fast | May miss context |

**My Recommendation**: Start with **Text Transcript** (easiest + cheapest), then upgrade to **Audio** if you need better accuracy.

---

## Quick Test After Changes

1. **Save** your scenario (click Save button)
2. **Turn it ON** (toggle switch)
3. Go back to your React app
4. Try a **LONG video** (1+ hour)
5. Check Make.com execution history:
   - If you see "Success" ✅ - It worked!
   - If you still see token errors ❌ - The module is still using video

---

## Need More Help?

Take a screenshot of:
1. Your scenario flow (all modules visible)
2. The settings of your YouTube download module

And I'll give you EXACT step-by-step instructions!
