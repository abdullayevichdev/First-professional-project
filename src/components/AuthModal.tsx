import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Calendar, Phone, Camera, Loader2, Check, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { signInWithGoogle } from '../lib/firebase';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
}

type AuthMode = 'login' | 'register';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    phone: '',
    username: '',
    password: '',
    confirmPassword: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === 'phone') {
      // Remove all non-digits
      const digits = value.replace(/\D/g, '');
      
      // Format as +998 XX XXX XX XX
      if (digits.length <= 12) {
        let formatted = '+';
        // Ensure it starts with 998 if it's not empty
        const d = digits.startsWith('998') ? digits : (digits.length > 0 ? '998' + digits : '');
        
        if (d.length > 0) {
          formatted += d.substring(0, 3); // 998
          if (d.length > 3) formatted += ' ' + d.substring(3, 5); // XX
          if (d.length > 5) formatted += ' ' + d.substring(5, 8); // XXX
          if (d.length > 8) formatted += ' ' + d.substring(8, 10); // XX
          if (d.length > 10) formatted += ' ' + d.substring(10, 12); // XX
          newValue = formatted;
        } else {
          newValue = '';
        }
      } else {
        // Don't allow more than 12 digits
        return;
      }
    }

    setFormData(prev => ({ ...prev, [name]: newValue }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'register' && formData.password !== formData.confirmPassword) {
      setError('Parollar mos kelmadi');
      return;
    }

    setLoading(true);
    const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
    
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        onSuccess(data.user);
        onClose();
      } else {
        setError(data.error || 'Xatolik yuz berdi');
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError('Server bilan bog\'lanishda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(prev => prev === 'login' ? 'register' : 'login');
    setError(null);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithGoogle();
      const user = result.user;
      
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
          name: user.displayName,
          picture: user.photoURL
        })
      });
      
      const data = await res.json();
      if (res.ok) {
        onSuccess(data.user);
        onClose();
      } else {
        setError(data.error || 'Google orqali kirishda xatopik yuz berdi');
      }
    } catch (err: any) {
      console.error('Google auth error:', err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setError('Google orqali kirishda xatolik yuz berdi');
      }
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] overflow-y-auto flex flex-col custom-scrollbar">
          {/* Full-screen Blurred Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#0f172a]/80 backdrop-blur-[12px] pointer-events-auto"
            onClick={onClose}
          />
          
          {/* Centering Container */}
          <div className="relative min-h-full w-full flex p-4 sm:p-8 pointer-events-none">
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="fixed top-4 right-4 md:top-6 md:right-6 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all z-[10010] pointer-events-auto"
            >
              <X size={20} />
            </button>

            {/* Authentication Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="relative bg-white dark:bg-[#0A0A0B] w-full max-w-[420px] rounded-[2rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] border border-white/10 z-10 m-auto pointer-events-auto"
            >
              {/* Header with Tabs */}
              <div className="flex border-b border-gray-100 dark:border-white/5 bg-white/50 dark:bg-black/20 backdrop-blur-md rounded-t-[2rem] overflow-hidden">
                <button
                  onClick={() => setMode('login')}
                  className={cn(
                    "flex-1 py-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-all relative",
                    mode === 'login' ? "text-gold" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  )}
                >
                  Kirish
                  {mode === 'login' && (
                    <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold" />
                  )}
                </button>
                <button
                  onClick={() => setMode('register')}
                  className={cn(
                    "flex-1 py-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-all relative",
                    mode === 'register' ? "text-gold" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  )}
                >
                  Ro'yxatdan o'tish
                  {mode === 'register' && (
                    <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold" />
                  )}
                </button>
              </div>

              <div className="p-6 sm:p-10 relative">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gold text-navy font-serif font-bold text-xl mb-4 shadow-lg shadow-gold/20">
                    T
                  </div>
                  <h2 className="text-2xl font-serif font-bold text-navy dark:text-white mb-1">
                    {mode === 'login' ? 'Xush kelibsiz' : 'Tahqiq Hamjamiyati'}
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 text-[9px] font-bold uppercase tracking-[0.3em]">
                    {mode === 'login' ? 'Profilingizga kiring' : 'Yangi profil yarating'}
                  </p>
                </div>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl text-red-600 dark:text-red-400 text-[11px] font-medium text-center"
                  >
                    {error}
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">Login</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                      <input
                        required
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        placeholder="foydalanuvchinomi@example.com"
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-gold focus:ring-1 focus:ring-gold outline-none rounded-xl text-navy dark:text-white transition-all font-medium text-xs"
                      />
                    </div>
                  </div>

                  {mode === 'register' && (
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">Telefon</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                        <input
                          required
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="+998 90 123 45 67"
                          className="w-full pl-10 pr-3 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-gold focus:ring-1 focus:ring-gold outline-none rounded-xl text-navy dark:text-white transition-all font-medium text-xs"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">Parol</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                      <input
                        required
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-10 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-gold focus:ring-1 focus:ring-gold outline-none rounded-xl text-navy dark:text-white transition-all font-medium text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gold transition-colors"
                      >
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  {mode === 'register' && (
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">Parolni tasdiqlash</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                        <input
                          required
                          type={showPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          placeholder="••••••••"
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-gold focus:ring-1 focus:ring-gold outline-none rounded-xl text-navy dark:text-white transition-all font-medium text-xs"
                        />
                      </div>
                    </div>
                  )}

                  <div className="pt-4 space-y-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 bg-gold hover:bg-gold/90 text-navy font-bold rounded-xl shadow-xl shadow-gold/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                    >
                      {loading ? (
                        <Loader2 className="animate-spin" size={18} />
                      ) : (
                        <>
                          <span className="uppercase tracking-[0.2em] text-[10px]">
                            {mode === 'login' ? 'Kirish' : "Ro'yxatdan o'tish"}
                          </span>
                          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>

                    <div className="relative py-2">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-100 dark:border-white/5"></div>
                      </div>
                      <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold">
                        <span className="px-4 bg-white dark:bg-[#0A0A0B] text-gray-400">Yoki</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={loading}
                      onClick={handleGoogleLogin}
                      className="w-full py-3.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-gold dark:hover:border-gold/50 text-navy dark:text-white font-bold rounded-xl transition-all flex items-center justify-center gap-3 group"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      <span className="uppercase tracking-[0.2em] text-[10px]">Google orqali kirish</span>
                    </button>
                  </div>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={toggleMode}
                      className="text-[9px] font-bold text-gray-400 hover:text-gold uppercase tracking-[0.2em] transition-colors"
                    >
                      {mode === 'login' 
                        ? "Hisobingiz yo'qmi? Ro'yxatdan o'ting" 
                        : "Allaqachon hisobingiz bormi? Kiring"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );


  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};
