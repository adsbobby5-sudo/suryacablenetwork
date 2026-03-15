import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  UserPlus, 
  Search, 
  FileText, 
  BarChart3, 
  Menu, 
  X,
  ChevronLeft,
  LogOut,
  Settings as SettingsIcon
} from 'lucide-react';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  title: string;
  onBack?: () => void;
}

export default function Layout({ children, activeTab, setActiveTab, title, onBack }: LayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'add-customer', label: 'Add Customer', icon: UserPlus },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Admin Settings', icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-mesh-light print:bg-white print:min-h-0 print:block">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white/70 backdrop-blur-2xl border-r border-white/50 sticky top-0 h-screen no-print shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] z-10">
        <div className="p-8 border-b border-indigo-50/50 flex flex-col items-center text-center">
          <img src="/logo.png" alt="Surya Cable Network" className="w-32 h-auto object-contain drop-shadow-sm transition-transform hover:scale-105 duration-300" />
          <p className="text-[10px] text-indigo-500 font-extrabold uppercase tracking-[0.2em] mt-3 bg-indigo-50/80 py-1.5 px-4 rounded-full shadow-inner">Operator Portal</p>
        </div>
        <nav className="flex-1 p-5 space-y-2 relative">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
                  isActive 
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30 font-semibold translate-x-1' 
                    : 'text-slate-500 hover:bg-white hover:text-indigo-600 hover:shadow-sm hover:translate-x-1'
                }`}
              >
                <item.icon size={20} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-500 transition-colors'} />
                {item.label}
              </button>
            )
          })}
        </nav>
        <div className="p-5 border-t border-indigo-50/50">
          <button 
            onClick={() => signOut(auth)}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl text-rose-500 font-semibold hover:bg-rose-50 hover:text-rose-600 transition-all duration-300"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden bg-white/80 backdrop-blur-xl border-b border-white sticky top-0 z-50 px-4 py-4 flex items-center justify-between no-print shadow-sm">
        <div className="flex items-center gap-3">
          {onBack ? (
            <button onClick={onBack} className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
              <ChevronLeft size={24} />
            </button>
          ) : (
            <button onClick={() => setIsMenuOpen(true)} className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
              <Menu size={24} />
            </button>
          )}
          <h1 className="font-bold text-slate-800 text-xl tracking-tight">{title}</h1>
        </div>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold shadow-md">
          S
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] md:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[280px] bg-white z-[70] md:hidden shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex flex-col items-start px-2">
                  <img src="/logo.png" alt="Surya Cable Network" className="w-24 h-auto object-contain" />
                  <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-[0.2em] mt-2 bg-indigo-50 py-1 px-3 rounded-full">Operator Portal</p>
                </div>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 text-slate-400 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors">
                  <X size={20} />
                </button>
              </div>
              <nav className="flex-1 p-5 space-y-3 overflow-y-auto">
                {navItems.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${
                        isActive 
                          ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold shadow-lg shadow-indigo-500/30' 
                          : 'text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      <item.icon size={22} className={isActive ? 'text-white' : 'text-slate-400'} />
                      <span className="text-lg">{item.label}</span>
                    </button>
                  )
                })}
              </nav>
              <div className="p-6 border-t border-slate-100 flex flex-col gap-4">
                <button 
                  onClick={() => signOut(auth)}
                  className="flex items-center gap-3 text-rose-500 font-semibold hover:bg-rose-50 p-4 rounded-2xl transition-colors w-full"
                >
                  <LogOut size={20} />
                  <span>Secure Logout</span>
                </button>
                <p className="text-xs text-slate-400 text-center font-medium">v1.1.0 • Surya Cable Network</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        {/* Desktop Header */}
        <header className="hidden md:flex bg-white/60 backdrop-blur-xl border-b border-white/50 px-10 py-5 items-center justify-between sticky top-0 z-40 no-print shadow-[0_4px_24px_-12px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-5">
            {onBack && (
              <button onClick={onBack} className="p-2 -ml-2 rounded-xl hover:bg-white text-slate-600 shadow-sm border border-slate-100 transition-all hover:-translate-x-0.5">
                <ChevronLeft size={20} />
              </button>
            )}
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 tracking-tight">{title}</h2>
          </div>
          <div className="flex items-center gap-5">
            <div className="text-right">
              <p className="text-sm font-bold text-slate-800">Administrator</p>
              <p className="text-xs font-medium text-slate-500 flex items-center gap-1 justify-end">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Main Office
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold shadow-md">
              S
            </div>
          </div>
        </header>

        <div className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full print:p-0 print:max-w-none print:m-0 z-0">
          {children}
        </div>
      </main>
    </div>
  );
}
