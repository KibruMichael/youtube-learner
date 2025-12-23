import React, { useState } from 'react';
import { Search, Sparkles, Youtube, Brain, Clock, FileText } from 'lucide-react';

interface VideoInputProps {
  onGenerate: (url: string, lang: 'en' | 'am') => void;
}

const VideoInput: React.FC<VideoInputProps> = ({ onGenerate }) => {
  const [url, setUrl] = useState('');
  const [lang, setLang] = useState<'en' | 'am'>('en');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('Please enter a YouTube URL');
      return;
    }
    onGenerate(url, lang);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 p-6 animate-fade-in relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iYmxhY2siIHN0cm9rZS1vcGFjaXR5PSIwLjAyIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-60"></div>
      
      <div className="max-w-3xl w-full text-center space-y-10 relative z-10">
        {/* Hero section */}
        <div className="space-y-6 animate-slide-up">
          <div className="inline-flex items-center justify-center relative">
            <div className="absolute inset-0 bg-red-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
            <div className="relative p-5 gradient-accent rounded-2xl shadow-xl">
              <Youtube size={56} className="text-white" />
            </div>
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
              Learn smarter from <span className="gradient-accent bg-clip-text text-transparent">YouTube</span>
            </h1>
            <p className="text-base md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed px-4">
              Get instant AI summaries and interactive transcripts. Paste a video link below to start learning.
            </p>
          </div>
        </div>

        {/* Input form */}
        <form onSubmit={handleSubmit} className="relative max-w-2xl mx-auto animate-scale-in w-full">
          <div className="relative group flex flex-col md:block">
            <div className="absolute top-5 left-0 pl-5 flex items-center pointer-events-none md:inset-y-0">
              <Search className="h-6 w-6 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            </div>
            <input
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError('');
              }}
              className="block w-full pl-14 pr-4 md:pr-48 py-5 bg-white border-2 border-slate-200 rounded-2xl shadow-lg placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-base hover:border-slate-300"
              placeholder="Paste YouTube URL here..."
            />
            <div className="mt-3 md:mt-0 w-full md:w-auto md:absolute md:right-2 md:top-2 md:bottom-2 flex gap-2">
               <select
                value={lang}
                onChange={(e) => setLang(e.target.value as 'en' | 'am')}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer border-r-8 border-transparent"
              >
                <option value="en">🇺🇸 EN</option>
                <option value="am">🇪🇹 AM</option>
              </select>
              <button
                type="submit"
                className="gradient-primary hover:opacity-90 text-white px-5 py-4 md:py-0 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-blue-500/50 group"
              >
                <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />
                <span className="hidden md:inline">Generate</span>
              </button>
            </div>
          </div>
          {error && <p className="mt-3 text-red-600 text-sm font-medium animate-slide-up">{error}</p>}
        </form>

        {/* Feature cards */}
        <div className="pt-4 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {[
            { 
              icon: Brain, 
              title: "Smart Summary", 
              desc: "Get the key takeaways in seconds without watching hours of footage.",
              color: "indigo"
            },
            { 
              icon: FileText, 
              title: "Full Transcript", 
              desc: "Searchable, timestamped text to find exactly what you need.",
              color: "blue"
            },
            { 
              icon: Clock, 
              title: "History Archive", 
              desc: "Save your learnings and revisit them anytime.",
              color: "purple"
            }
          ].map((item, i) => (
            <div 
              key={i} 
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover-lift hover:shadow-xl hover:border-slate-300 transition-all group animate-scale-in"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className={`inline-flex p-3 rounded-xl bg-${item.color}-50 mb-4 group-hover:scale-110 transition-transform`}>
                <item.icon size={24} className={`text-${item.color}-600`} />
              </div>
              <h3 className="font-bold text-slate-900 mb-2 text-lg">{item.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VideoInput;