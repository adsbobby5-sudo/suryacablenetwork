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
  LogOut
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
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 print:bg-white print:min-h-0 print:block">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 sticky top-0 h-screen no-print">
        <div className="p-6 border-b border-slate-100 flex flex-col items-center text-center">
          <img src="/logo.png" alt="Surya Cable Network" className="w-32 h-auto object-contain" />
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-3 bg-slate-100 py-1 px-3 rounded-full">Operator Portal</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id 
                  ? 'bg-indigo-50 text-indigo-600 font-semibold shadow-sm' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }`}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden bg-white border-b border-slate-200 sticky top-0 z-50 px-4 py-3 flex items-center justify-between no-print">
        <div className="flex items-center gap-3">
          {onBack ? (
            <button onClick={onBack} className="p-2 -ml-2 text-slate-600">
              <ChevronLeft size={24} />
            </button>
          ) : (
            <button onClick={() => setIsMenuOpen(true)} className="p-2 -ml-2 text-slate-600">
              <Menu size={24} />
            </button>
          )}
          <h1 className="font-bold text-slate-800 text-lg">{title}</h1>
        </div>
        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
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
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] md:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-white z-[70] md:hidden shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex flex-col items-start px-2">
                  <img src="/logo.png" alt="Surya Cable Network" className="w-24 h-auto object-contain" />
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2 bg-slate-100 py-1 px-3 rounded-full">Operator Portal</p>
                </div>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 text-slate-400">
                  <X size={24} />
                </button>
              </div>
              <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all ${
                      activeTab === item.id 
                        ? 'bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-200' 
                        : 'text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <item.icon size={22} />
                    <span className="text-lg">{item.label}</span>
                  </button>
                ))}
              </nav>
              <div className="p-6 border-t border-slate-100 flex flex-col gap-4">
                <button 
                  onClick={() => signOut(auth)}
                  className="flex items-center gap-3 text-rose-500 font-semibold hover:bg-rose-50 p-3 rounded-xl transition-colors w-full"
                >
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>
                <p className="text-xs text-slate-400 text-center">v1.0.4 • Surya Cable Network</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Desktop Header */}
        <header className="hidden md:flex bg-white border-b border-slate-200 px-8 py-4 items-center justify-between sticky top-0 z-40 no-print">
          <div className="flex items-center gap-4">
            {onBack && (
              <button onClick={onBack} className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors">
                <ChevronLeft size={20} />
              </button>
            )}
            <h2 className="text-xl font-bold text-slate-800">{title}</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-700">Admin User</p>
              <p className="text-xs text-slate-400">Main Office</p>
            </div>
            <button 
              onClick={() => signOut(auth)}
              className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold hover:bg-rose-50 hover:text-rose-500 transition-colors"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <div className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full print:p-0 print:max-w-none print:m-0">
          {children}
        </div>
      </main>
    </div>
  );
}
