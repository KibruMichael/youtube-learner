# How to Fix "Token Limit Exceeded" for Long Videos

The error `[400] The input token count exceeds the maximum number of tokens allowed 1048576` happens because **video processing** consumes a huge number of tokens.

- **1 Hour of Video** ≈ 950,000 tokens
- **2 Hours of Video** ≈ 1,900,000 tokens (Exceeds the 1M limit)

## The Solution: Switch to Audio Processing

Audio is much more efficient. **1 Hour of Audio is only ~115,000 tokens**. You can process up to ~9 hours of audio within the 1M token limit.

### Steps to Fix in Make.com:

1.  **Open your Make.com Scenario**.
2.  Locate the module that downloads the media from YouTube.
3.  **Change the Download Format**:
    *   Instead of downloading "Video" (mp4), configure it to download **"Audio Only"** (mp3/m4a/wav).
    *   If you are using a specific YouTube module, look for an option like "Download Audio" or "Extract Audio".
    *   If you are using a generic HTTP Get, ensure you are targeting an audio stream URL (you might need a different tool/API to get the audio link).
4.  **Update the Gemini Module**:
    *   Ensure the Gemini module is set to accept the audio file.
    *   Gemini 1.5 Pro handles audio files natively and provides excellent transcription and analysis.

### Alternative: Use Text Transcript

If downloading audio is difficult in your current setup, you can fetch the **Text Transcript** directly from YouTube (if available) and send that text to Gemini. Text is extremely cheap (2 hours ≈ 30k tokens).

1.  Use a "Get YouTube Transcript" module (or API).
2.  Pass the *text content* to Gemini instead of the file.

### Summary
**Video** = ~260 tokens/sec (Expensive ❌)
**Audio** = ~30 tokens/sec (Efficient ✅)
**Text** = ~5 tokens/sec (Very Efficient ✅✅)

Switching to **Audio** or **Text** will instantly solve the issue for videos up to several hours long.
