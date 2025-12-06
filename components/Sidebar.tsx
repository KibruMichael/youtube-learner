import React from 'react';
import { VideoData } from '../types';
import { Clock, PlusCircle, Video, PlayCircle, ChevronRight, LogOut, Trash2 } from 'lucide-react';
import { getYoutubeThumbnail } from '../utils/youtube';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

interface SidebarProps {
  history: VideoData[];
  onSelectVideo: (video: VideoData) => void;
  onNewAnalysis: () => void;
  onDeleteVideo: (videoId: string, e: React.MouseEvent) => void;
  activeVideoId: string | null;
}

const Sidebar: React.FC<SidebarProps> = ({ history, onSelectVideo, onNewAnalysis, onDeleteVideo, activeVideoId }) => {
  const handleSignOut = () => {
    signOut(auth);
  };

  return (
    <div className="w-64 bg-slate-900 text-slate-300 flex flex-col h-full border-r border-slate-800 flex-shrink-0">
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-2 mb-6 text-white font-bold text-xl">
          <div className="bg-red-600 p-1.5 rounded-lg">
            <Video size={20} className="text-white" />
          </div>
          <span>YT Learner</span>
        </div>
        
        <button
          onClick={onNewAnalysis}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-2.5 px-4 rounded-lg transition-all font-medium shadow-lg shadow-blue-900/20"
        >
          <PlusCircle size={18} />
          <span>New Analysis</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-2">
          <Clock size={12} />
          <span>Recent History</span>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-10 px-4 text-slate-600">
            <p className="text-sm">No history yet.</p>
            <p className="text-xs mt-1">Analyze a video to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((video) => (
              <div
                key={video.id}
                onClick={() => onSelectVideo(video)}
                className={`group cursor-pointer rounded-xl p-3 transition-all border relative ${
                  activeVideoId === video.id
                    ? 'bg-slate-800 border-slate-700 shadow-md'
                    : 'bg-transparent border-transparent hover:bg-slate-800/50 hover:border-slate-800'
                }`}
              >
                <div className="flex gap-3">
                  <div className="relative w-16 h-12 flex-shrink-0 rounded-md overflow-hidden bg-slate-950">
                    <img 
                      src={getYoutubeThumbnail(video.youtubeId)} 
                      alt="Thumbnail" 
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-black/30 rounded-full p-0.5 backdrop-blur-sm">
                         <PlayCircle size={12} className="text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h3 className={`text-sm font-medium truncate leading-tight mb-1 pr-6 ${
                      activeVideoId === video.id ? 'text-white' : 'text-slate-300 group-hover:text-white'
                    }`}>
                      {video.title}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                       <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                       {activeVideoId === video.id && <ChevronRight size={12} className="text-blue-500" />}
                    </div>
                  </div>
                </div>
                
                {/* Delete Button */}
                <button
                  onClick={(e) => onDeleteVideo(video.id, e)}
                  className="absolute top-2 right-2 p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-700 rounded-full opacity-0 group-hover:opacity-100 transition-all z-10"
                  title="Delete analysis"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={handleSignOut}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;