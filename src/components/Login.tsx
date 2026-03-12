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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl shadow-indigo-100/50 overflow-hidden"
        >
          <div className="p-8 pb-6 text-center space-y-2 border-b border-slate-100 bg-slate-50/50">
            <div className="w-40 h-40 mx-auto flex items-center justify-center mb-2">
              <img src="/logo.png" alt="Surya Cable Network" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Admin Portal</h1>
            <p className="text-sm text-slate-500 font-medium">Please sign in to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="bg-rose-50 text-rose-600 p-4 rounded-xl flex items-center gap-3 text-sm font-semibold border border-rose-100"
                >
                  <AlertCircle size={18} />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email</label>
                <div className="relative">
                  <User size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-semibold text-slate-700 bg-slate-50 focus:bg-white"
                    placeholder="admin@suryacable.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Password</label>
                <div className="relative">
                  <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-semibold text-slate-700 bg-slate-50 focus:bg-white"
                    placeholder="Enter password"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-4 text-lg mt-2 relative overflow-hidden group shadow-lg shadow-indigo-200"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform" />
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
                    <span>Sign In</span>
                  </>
                )}
              </div>
            </button>
          </form>
          
          <div className="p-4 bg-slate-50 text-center border-t border-slate-100">
             <p className="text-xs font-semibold text-slate-400">Surya Cable Network &copy; {new Date().getFullYear()}</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
