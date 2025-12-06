import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Video, ArrowRight, Loader2, AlertCircle, Sparkles, Mail, Lock } from 'lucide-react';

const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Create user document in Firestore
        await setDoc(doc(db, "users", userCredential.user.uid), {
          email: email,
          createdAt: Date.now()
        });
      }
    } catch (err: any) {
      // Map Firebase error codes to user-friendly messages
      let msg = "An error occurred. Please try again.";
      
      const errorCode = err.code;

      if (errorCode === 'auth/invalid-credential' || 
          errorCode === 'auth/user-not-found' || 
          errorCode === 'auth/wrong-password') {
        msg = "Invalid email or password.";
      } else if (errorCode === 'auth/email-already-in-use') {
        msg = "That email is already in use. Please sign in instead.";
      } else if (errorCode === 'auth/weak-password') {
        msg = "Password should be at least 6 characters.";
      } else if (errorCode === 'auth/invalid-email') {
        msg = "Please enter a valid email address.";
      } else if (errorCode === 'auth/too-many-requests') {
        msg = "Too many failed attempts. Please try again later.";
      } else if (errorCode === 'auth/network-request-failed') {
        msg = "Network error. Please check your connection.";
      }
      
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-center items-center p-4 overflow-hidden bg-slate-950">
      {/* Dynamic Background with Gradients and Patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900 via-slate-950 to-slate-950 opacity-80"></div>
      
      {/* Animated Mesh/Grid Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20 mask-image:linear-gradient(to bottom, black, transparent)"></div>

      {/* Floating Ambient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>

      {/* Main Auth Card */}
      <div className="relative max-w-md w-full glass-strong rounded-3xl p-8 border border-white/10 shadow-2xl shadow-black/50 animate-scale-in backdrop-blur-3xl">
        
        {/* Glow behind card header */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-blue-500/20 blur-[60px] rounded-full pointer-events-none"></div>

        {/* Logo section */}
        <div className="relative flex flex-col items-center mb-10 text-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-blue-500 rounded-2xl blur-lg opacity-40"></div>
            <div className="relative bg-gradient-to-br from-blue-600 to-indigo-600 p-4 rounded-2xl shadow-xl shadow-blue-900/40 transform hover:rotate-3 transition-transform duration-300">
              <Video size={40} className="text-white ring-1 ring-white/20 rounded-lg p-0.5" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
            {isLogin ? 'Welcome Back' : 'Join Us'}
          </h1>
          <p className="text-slate-400 text-sm max-w-xs mx-auto leading-relaxed">
            {isLogin ? 'Enter your credentials to access your personal dashboard.' : 'Start your learning journey with AI-powered video insights.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="group space-y-2">
              <label className="block text-xs font-bold text-blue-300 uppercase tracking-wider ml-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-4 bg-slate-950/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium hover:border-slate-600"
                  placeholder="name@example.com"
                />
              </div>
            </div>
            
            <div className="group space-y-2">
              <label className="block text-xs font-bold text-blue-300 uppercase tracking-wider ml-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-4 bg-slate-950/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium hover:border-slate-600"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-3 text-red-100 text-sm bg-red-500/10 border border-red-500/20 p-4 rounded-xl animate-slide-up">
              <AlertCircle size={18} className="flex-shrink-0 text-red-400 mt-0.5" />
              <span className="leading-snug">{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full relative overflow-hidden group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-900/30 hover:shadow-blue-500/40 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <div className="relative z-10 flex items-center justify-center gap-2">
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </div>
            {/* Shimmer overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out"></div>
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-slate-400 hover:text-white transition-colors text-sm font-medium inline-flex items-center gap-2 group p-2 rounded-lg hover:bg-white/5"
          >
            <span>{isLogin ? "New here? Create an account" : "Already have an account? Sign in"}</span>
            <Sparkles size={14} className="text-blue-400 group-hover:text-yellow-300 transition-colors" />
          </button>
        </div>
      </div>
      
      {/* Footer */}
      <div className="relative mt-12 text-slate-500 text-xs font-medium tracking-wide">
        &copy; {new Date().getFullYear()} YouTube Learner AI. All rights reserved.
      </div>
    </div>
  );
};

export default Login;