# Architecture Change for Long Videos: Async Processing

The error `500 Internal Server Error: Scenario failed to complete` confirms that the Make.com scenario is crashing or timing out.

**Why?**
Make.com webhooks have a timeout (usually 40 seconds). Processing a 2-hour video (even just audio) takes longer than this. When the timeout hits, Make.com kills the connection, and your app receives a 500 error.

**The Solution: Asynchronous Processing**
Instead of waiting for the webhook to *return* the data, we will tell Make.com to **write the data directly to Firestore** when it's done.

## Step 1: Update React App (Done ✅)
I have already updated your `App.tsx` and `VideoAnalysisView.tsx` to send two new parameters to your Transcript Webhook:
- `uid`: The user's ID
- `videoId`: The ID of the video document in Firestore

## Step 2: Update Make.com Scenario (Action Required)

You need to modify your **Transcript Scenario** in Make.com:

1.  **Add Firestore Module**:
    *   At the very end of your scenario (after the JSON parser), add a **Google Cloud Firestore** module.
    *   Select **"Update a Document"**.

2.  **Configure Firestore Module**:
    *   **Collection ID**: `users`
    *   **Document ID**: Map the `uid` from the webhook input.
    *   **Sub-collection**: `videos` (You might need to type this manually or use a path like `users/{uid}/videos/{videoId}`).
        *   *Actually, the standard Make.com Firestore module asks for Collection ID and Document ID.*
        *   *If you can't easily do subcollections, use the "Update a Document" with the path:* `users/{{uid}}/videos/{{videoId}}`
    *   **Fields to Update**:
        *   Add a field named `transcript`.
        *   Map the **Array** output from your JSON parser to this field.

3.  **Change Webhook Response**:
    *   Change the **Webhook Response** module to return status `200` and body `{"status": "processing"}` immediately (or just remove it if you want "Fire and Forget").
    *   *Better approach:* Move the Webhook Response to be the *first* thing that happens (or use a "Break" directive), but usually, you just let the webhook wait. If you write to Firestore, you don't *need* the response in the React app anymore because the app is **listening to Firestore**.

## How it works now:
1.  **React App**: Sends request -> "Start processing this video".
2.  **Make.com**: Receives request -> Starts downloading/processing.
3.  **React App**: Doesn't care if the request times out. It just shows "Loading...".
4.  **Make.com**: Finishes processing 5 minutes later -> Writes `transcript` to Firestore.
5.  **React App**: Sees the update in Firestore -> Instantly displays the transcript!

This architecture is **bulletproof** for long videos.
