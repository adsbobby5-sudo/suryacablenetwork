import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, User, LogIn, AlertCircle } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Let App.tsx's onAuthStateChanged handle the redirect, but call onLogin just in case
      onLogin();
    } catch (err: any) {
      console.error(err);
      setError(
        err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password'
          ? 'Invalid email or password'
          : 'Failed to sign in. Please try again later.'
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-mesh-light flex items-center justify-center p-4 selection:bg-indigo-500/30">
      
      {/* Decorative background elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-500/20 to-emerald-400/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          className="bg-white/80 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_32px_rgba(30,27,75,0.05)] border border-white/60 overflow-hidden"
        >
          <div className="p-8 pb-6 text-center space-y-3 relative">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500" />
            <div className="w-40 h-40 mx-auto flex items-center justify-center mb-4 transition-transform hover:scale-105 duration-300">
              <img src="/logo.png" alt="Surya Cable Network" className="w-full h-full object-contain drop-shadow-md" />
            </div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-slate-900 to-slate-600 tracking-tight">Admin Portal</h1>
            <p className="text-sm font-semibold text-slate-500/80 uppercase tracking-[0.2em]">Secure Access</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 pt-2 space-y-6">
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, scale: 0.9 }}
                  animate={{ opacity: 1, height: 'auto', scale: 1 }}
                  exit={{ opacity: 0, height: 0, scale: 0.9 }}
                  className="bg-rose-50/80 backdrop-blur-sm text-rose-600 p-4 rounded-2xl flex items-center gap-3 text-sm font-medium border border-rose-100 shadow-sm shadow-rose-100/50 mb-6"
                >
                  <AlertCircle size={18} className="shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Email</label>
                <div className="relative group">
                  <User size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200/80 bg-white/50 focus:bg-white focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-800 placeholder:text-slate-400 shadow-sm"
                    placeholder="admin@suryacable.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Password</label>
                <div className="relative group">
                  <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200/80 bg-white/50 focus:bg-white focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-800 placeholder:text-slate-400 shadow-sm"
                    placeholder="Enter password"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-4 px-6 rounded-2xl font-semibold tracking-wide shadow-xl shadow-indigo-600/20 hover:shadow-indigo-600/40 hover:-translate-y-0.5 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-3 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <div className="relative flex items-center justify-center gap-2">
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : (
                  <>
                    <LogIn size={20} />
                    <span>Secure Sign In</span>
                  </>
                )}
              </div>
            </button>
          </form>
          
          <div className="p-5 bg-slate-50/50 text-center border-t border-slate-100/50 backdrop-blur-sm">
             <p className="text-xs font-bold text-slate-400 tracking-wider">SURYA CABLE NETWORK &copy; {new Date().getFullYear()}</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
