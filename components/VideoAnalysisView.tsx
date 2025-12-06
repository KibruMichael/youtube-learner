import React, { useState, useEffect } from 'react';
import { VideoData } from '../types';
import { Brain, FileText, Clock, AlertCircle, Loader2, Sparkles, RefreshCw } from 'lucide-react';
import { LOADING_MESSAGES } from '../constants';
import { doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';

interface VideoAnalysisViewProps {
  video: VideoData;
  isLoading: boolean;
}

const VideoAnalysisView: React.FC<VideoAnalysisViewProps> = ({ video, isLoading }) => {
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);
  const [isRetryingTranscript, setIsRetryingTranscript] = useState(false);

  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadingMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  // Helper to parse transcript response
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

  const handleRetryTranscript = async () => {
    if (!auth.currentUser) return;
    
    setIsRetryingTranscript(true);

    try {
      const transcriptWebhookUrl = 'https://hook.eu1.make.com/24b913pgm5tod9fsdvxk3f7flupq8g2l';
      
      const response = await fetch(`${transcriptWebhookUrl}?url=${encodeURIComponent(video.url)}&uid=${auth.currentUser.uid}&videoId=${video.id}`, {
        method: 'GET',
        headers: { 'Accept': 'text/plain, application/json' }
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, body: ${errText.substring(0, 100)}`);
      }

      const responseText = await response.text();
      console.log("Retry - Received transcript response:", responseText);

      const transcriptArray = parseTranscriptResponse(responseText);
      
      if (transcriptArray && transcriptArray.length > 0) {
        await updateDoc(doc(db, 'users', auth.currentUser.uid, 'videos', video.id), {
          transcript: transcriptArray
        });
        console.log("Transcript retry successful.");
      } else {
        // Still failed
        await updateDoc(doc(db, 'users', auth.currentUser.uid, 'videos', video.id), {
          transcript: []
        });
      }
    } catch (err) {
      console.error("Retry failed:", err);
      await updateDoc(doc(db, 'users', auth.currentUser.uid, 'videos', video.id), {
        transcript: []
      });
    } finally {
      setIsRetryingTranscript(false);
    }
  };

  // Determine transcript state
  const hasTranscript = video.transcript && video.transcript.length > 0;
  const transcriptFailed = !isLoading && video.transcript !== undefined && video.transcript.length === 0;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
      {/* Top Bar / Breadcrumb */}
      <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shadow-sm flex-shrink-0 z-10">
        <h2 className="font-semibold text-lg text-slate-800 truncate max-w-2xl" title={video.title}>
          {video.title}
        </h2>
        <div className="flex items-center gap-2 text-sm text-slate-500">
           <span className="bg-slate-100 px-2 py-1 rounded border border-slate-200 font-mono text-xs">ID: {video.youtubeId}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Video Player Section */}
          <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl ring-1 ring-slate-900/5">
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>

          {/* Analysis Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
            
            {/* Insights Column */}
            <div className="lg:col-span-1 flex flex-col gap-6">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-[500px]">
                <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-white rounded-t-2xl flex items-center gap-2">
                  <Brain className="text-indigo-600" size={20} />
                  <h3 className="font-bold text-slate-800">AI Insights</h3>
                </div>
                
                <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                  {isLoading ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4 p-4">
                      <div className="relative">
                        <div className="absolute inset-0 bg-indigo-500 blur-lg opacity-20 animate-pulse rounded-full"></div>
                        <Loader2 className="animate-spin text-indigo-600 relative z-10" size={32} />
                      </div>
                      <div>
                        <p className="text-indigo-900 font-medium animate-pulse">{LOADING_MESSAGES[loadingMsgIndex]}</p>
                        <p className="text-xs text-slate-400 mt-1">This might take a few minutes</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {video.insights?.map((insight, idx) => (
                        <div key={idx} className="flex gap-3 items-start group">
                          <div className="mt-1.5 min-w-[6px] h-[6px] rounded-full bg-indigo-500 ring-2 ring-indigo-100 group-hover:bg-indigo-600 transition-colors"></div>
                          <p className="text-slate-600 text-sm leading-relaxed">{insight}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Transcript Column */}
            <div className="lg:col-span-2 flex flex-col gap-6">
               <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-[500px]">
                <div className="p-5 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="text-blue-600" size={20} />
                    <h3 className="font-bold text-slate-800">Transcript</h3>
                  </div>
                  {!isLoading && hasTranscript && (
                    <div className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                      English (Auto)
                    </div>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto p-0 custom-scrollbar relative">
                   {isLoading ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm z-10">
                      <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100 flex flex-col items-center gap-3">
                         <Sparkles className="text-amber-500 animate-bounce" size={24} />
                         <span className="text-sm font-medium text-slate-600">Transcribing audio...</span>
                      </div>
                    </div>
                  ) : transcriptFailed ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10 p-6">
                      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 max-w-md flex flex-col items-center gap-4 text-center">
                        <AlertCircle className="text-red-500" size={32} />
                        <div>
                          <h4 className="text-red-900 font-semibold mb-1">Failed to load transcript</h4>
                          <p className="text-red-700 text-sm">There was an error processing the transcript.</p>
                        </div>
                        <button
                          onClick={handleRetryTranscript}
                          disabled={isRetryingTranscript}
                          className="gradient-primary hover:opacity-90 text-white px-6 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 shadow-lg disabled:opacity-50"
                        >
                          {isRetryingTranscript ? (
                            <>
                              <Loader2 className="animate-spin" size={16} />
                              <span>Retrying...</span>
                            </>
                          ) : (
                            <>
                              <RefreshCw size={16} />
                              <span>Try Again</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : null}

                  <div className={`p-5 space-y-1 ${isLoading || transcriptFailed ? 'blur-sm opacity-50 select-none' : ''}`}>
                    {(video.transcript || []).map((line, idx) => (
                      <div key={idx} className="flex gap-4 hover:bg-blue-50/50 p-2 rounded-lg transition-colors group cursor-pointer">
                        <span className="text-xs font-mono text-blue-600 font-medium pt-1 min-w-[40px] opacity-70 group-hover:opacity-100">
                          {line.timestamp}
                        </span>
                        <p className="text-slate-700 text-sm leading-relaxed group-hover:text-slate-900">
                          {line.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoAnalysisView;