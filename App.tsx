import React, { useState, useEffect } from 'react';
import { VideoData, ViewState } from './types';
import Sidebar from './components/Sidebar';
import VideoInput from './components/VideoInput';
import VideoAnalysisView from './components/VideoAnalysisView';
import Login from './components/Login';
import { getYoutubeId } from './utils/youtube';
import { AlertTriangle, Loader2, Menu } from 'lucide-react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, query, orderBy, onSnapshot, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  const [history, setHistory] = useState<VideoData[]>([]);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [viewState, setViewState] = useState<ViewState>('home');
  // We use local loading for the initial setup (fetching title/creating doc), 
  // but the long-term loading state depends on the data presence in Firestore.
  const [isInitializing, setIsInitializing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sidebar State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Monitor Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Sync History with Firestore
  useEffect(() => {
    if (!user) {
      setHistory([]);
      return;
    }

    const q = query(collection(db, 'users', user.uid, 'videos'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const videos = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as VideoData));
      setHistory(videos);
    }, (error) => {
      console.error("Error fetching history:", error);
    });

    return () => unsubscribe();
  }, [user]);

  // Helper to fetch real YouTube title
  const fetchVideoTitle = async (url: string): Promise<string> => {
    try {
      // Using noembed to fetch title without API key for this demo
      const response = await fetch(`https://noembed.com/embed?url=${url}`);
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      return data.title || "New Video Analysis";
    } catch (err) {
      console.warn("Failed to fetch video title", err);
      return "New Video Analysis";
    }
  };

  const handleGenerate = async (url: string) => {
    if (!user) return;

    const ytId = getYoutubeId(url);
    if (!ytId) {
      setErrorMsg("Invalid YouTube URL. Please try again.");
      setTimeout(() => setErrorMsg(null), 3000);
      return;
    }

    // Check if already in history
    const existing = history.find(v => v.youtubeId === ytId);
    if (existing) {
      setActiveVideoId(existing.id);
      setViewState('analysis');
      return;
    }

    setViewState('analysis');
    setIsInitializing(true);

    try {
      // 1. Fetch metadata first
      console.log("Step 1: Fetching video title...");
      const title = await fetchVideoTitle(url);
      
      const newVideoData: Omit<VideoData, 'id'> = {
        youtubeId: ytId,
        url,
        title: title,
        createdAt: Date.now(),
        // Note: insights and transcript are undefined initially.
        // The UI will show "Generating..." until these fields appear in Firestore.
      };

      // 2. Add to Firestore immediately
      console.log("Step 2: Creating Firestore document...");
      const docRef = await addDoc(collection(db, 'users', user.uid, 'videos'), newVideoData);
      const newId = docRef.id;
      
      setActiveVideoId(newId);
      console.log(`Step 3: Document created with ID: ${newId}. Starting webhooks...`);

      // 3. Trigger BOTH webhooks simultaneously
      const insightsWebhookUrl = 'https://hook.eu1.make.com/py1odn2kjgjlmf74vepttcvco3biuabk';
      const transcriptWebhookUrl = 'https://hook.eu1.make.com/24b913pgm5tod9fsdvxk3f7flupq8g2l';

      // Call both webhooks in parallel
      const [insightsResult, transcriptResult] = await Promise.allSettled([
        // Insights webhook
        fetch(`${insightsWebhookUrl}?url=${encodeURIComponent(url)}&uid=${user.uid}&videoId=${newId}`, {
          method: 'GET',
          headers: { 'Accept': 'text/plain, application/json' }
        }).then(res => res.text()),
        
        // Transcript webhook
        fetch(`${transcriptWebhookUrl}?url=${encodeURIComponent(url)}&uid=${user.uid}&videoId=${newId}`, {
          method: 'GET',
          headers: { 'Accept': 'text/plain, application/json' }
        }).then(async res => {
          if (!res.ok) {
            const errText = await res.text();
            throw new Error(`HTTP error! status: ${res.status}, body: ${errText.substring(0, 100)}`);
          }
          return res.text();
        })
      ]);

      // Process insights
      // Process insights
      if (insightsResult.status === 'fulfilled') {
        const responseText = insightsResult.value;
        console.log("Received insights response:", responseText);

        const insightsArray = responseText
          .split('\n')
          .map(line => line.replace(/^[-•]\s*/, '').trim())
          .filter(line => line.length > 0);

        if (insightsArray.length > 0) {
          await updateDoc(doc(db, 'users', user.uid, 'videos', newId), {
            insights: insightsArray
          });
          console.log("Firestore updated with insights.");
        }
      } else {
        console.error("Insights webhook failed:", insightsResult.reason);
        // Don't set error message here, as transcript might still succeed
      }

      // Process transcript with robust parsing
      if (transcriptResult.status === 'fulfilled') {
        const responseText = transcriptResult.value;
        console.log("Received transcript response:", responseText);

        try {
          const transcriptArray = parseTranscriptResponse(responseText);
          
          if (transcriptArray && transcriptArray.length > 0) {
            await updateDoc(doc(db, 'users', user.uid, 'videos', newId), {
              transcript: transcriptArray
            });
            console.log("Firestore updated with transcript.");
          } else {
            // Mark as failed so UI can show retry
            await updateDoc(doc(db, 'users', user.uid, 'videos', newId), {
              transcript: [] // Empty array signals parse failure
            });
          }
        } catch (parseErr) {
          console.error("Transcript parsing failed:", parseErr);
          // Mark as failed
          await updateDoc(doc(db, 'users', user.uid, 'videos', newId), {
            transcript: [] // Empty array signals parse failure
          });
        }
      } else {
        console.error("Transcript webhook failed:", transcriptResult.reason);
        // Mark as failed
        await updateDoc(doc(db, 'users', user.uid, 'videos', newId), {
          transcript: [] // Empty array signals failure
        });
      }

    } catch (err) {
      console.error("Error creating video analysis:", err);
      setErrorMsg("Failed to start analysis. Please try again.");
      setViewState('home');
    } finally {
      setIsInitializing(false);
    }
  };

  // Helper function to parse transcript with robust parsing
  const parseTranscriptResponse = (responseText: string): Array<{ timestamp: string; text: string }> | null => {
    try {
      // 1. Try parsing the raw response first
      try {
        const parsed = JSON.parse(responseText);
        if (isValidTranscript(parsed)) return parsed;
      } catch (e) {
        // Continue to extraction logic
      }

      // 2. Try extracting from markdown code blocks or just finding the array
      // This handles cases like:
      // - ```json [...] ```
      // - "Here is the transcript: [...]"
      // - [...] with trailing text
      const jsonString = responseText.trim();
      const arrayStart = jsonString.indexOf('[');
      const arrayEnd = jsonString.lastIndexOf(']');
      
      if (arrayStart !== -1 && arrayEnd !== -1 && arrayEnd > arrayStart) {
        const extracted = jsonString.substring(arrayStart, arrayEnd + 1);
        try {
            const parsed = JSON.parse(extracted);
            if (isValidTranscript(parsed)) return parsed;
        } catch (e) {
            console.warn("Failed to parse extracted JSON:", e);
        }
      }
      
      return null;
    } catch (err) {
      console.error("Transcript parsing error:", err);
      return null;
    }
  };

  const isValidTranscript = (data: any): boolean => {
      return Array.isArray(data) && data.length > 0 && 'timestamp' in data[0] && 'text' in data[0];
  };

  const handleSelectVideo = (video: VideoData) => {
    setActiveVideoId(video.id);
    setViewState('analysis');
    setIsSidebarOpen(false); // Close sidebar on mobile when selecting
  };

  const handleDeleteVideo = async (videoId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering selection
    if (!user) return;

    if (confirm("Are you sure you want to delete this analysis?")) {
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'videos', videoId));
        if (activeVideoId === videoId) {
          setActiveVideoId(null);
          setViewState('home');
        }
      } catch (err) {
        console.error("Error deleting video:", err);
        setErrorMsg("Failed to delete video.");
        setTimeout(() => setErrorMsg(null), 3000);
      }
    }
  };

  const handleNewAnalysis = () => {
    setActiveVideoId(null);
    setViewState('home');
    // Sidebar closes automatically via onNewAnalysis prop in Sidebar content buttons usually
  };

  // Auth Loading State
  if (authLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  // Unauthenticated State
  if (!user) {
    return <Login />;
  }

  // Authenticated State (Main App)
  const activeVideo = history.find(v => v.id === activeVideoId);

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* Toast Error */}
      {errorMsg && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-full shadow-2xl z-50 flex items-center gap-2 animate-bounce">
          <AlertTriangle size={18} />
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      {/* Sidebar */}
      <Sidebar 
        history={history} 
        onSelectVideo={handleSelectVideo} 
        onNewAnalysis={handleNewAnalysis}
        onDeleteVideo={handleDeleteVideo}
        activeVideoId={activeVideoId}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative min-w-0 transition-all duration-300">
        
        {/* Mobile Header */}
        <div className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-20">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            <Menu size={24} />
          </button>
          <span className="font-bold text-slate-800">YT Learner</span>
          <div className="w-8"></div> {/* Spacer for center alignment */}
        </div>

        {viewState === 'home' && (
          <VideoInput onGenerate={handleGenerate} />
        )}

        {viewState === 'analysis' && activeVideo && (
          <VideoAnalysisView 
            video={activeVideo} 
            // Show loading if initializing OR if insights haven't arrived from Firestore yet
            isLoading={isInitializing || !activeVideo.insights} 
          />
        )}
      </main>
    </div>
  );
};

export default App;