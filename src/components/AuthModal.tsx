import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, Loader2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { signInWithGoogle, signInWithApple } from '../lib/firebase';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

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
        if (data.token) {
          localStorage.setItem('auth_token', data.token);
        }
        toast.success(t('auth.welcome_back') || 'Successfully logged in!');
        onSuccess(data.user);
        onClose();
      } else {
        setError(data.error || 'An error occurred during Google sign-in');
      }
    } catch (err: any) {
      console.error('Google auth error:', err);
      if (err.code === 'auth/unauthorized-domain') {
        setError("Error: 'tahqiq.uz' is not an authorized domain. Please add 'tahqiq.uz' to Firebase Console -> Authentication -> Settings -> Authorized domains.");
      } else if (err.code === 'auth/popup-blocked') {
        setError("Error: Pop-up blocked. Please enable pop-ups to sign in with Google.");
      } else if (err.code === 'auth/operation-not-allowed') {
        setError("Error: Google login is not enabled in Firebase Authentication. Please enable Google sign-in method in Firebase Console.");
      } else if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message || 'An error occurred during Google sign-in');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithApple();
      const user = result.user;
      
      const res = await fetch('/api/auth/apple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email || `${user.uid}@apple.com`,
          name: user.displayName || 'Apple User',
          picture: user.photoURL || ''
        })
      });
      
      const data = await res.json();
      if (res.ok) {
        if (data.token) {
          localStorage.setItem('auth_token', data.token);
        }
        toast.success(t('auth.welcome_back') || 'Successfully logged in!');
        onSuccess(data.user);
        onClose();
      } else {
        setError(data.error || 'An error occurred during Apple sign-in');
      }
    } catch (err: any) {
      console.error('Apple auth error:', err);
      if (err.code === 'auth/popup-blocked') {
        setError("Error: Pop-up blocked. Please enable pop-ups to sign in with Apple.");
      } else if (err.code === 'auth/operation-not-allowed') {
        setError("Error: Apple login is not enabled in Firebase Authentication. Please enable Apple sign-in method in Firebase Console.");
      } else if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message || 'An error occurred during Apple sign-in');
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
              className="relative bg-white dark:bg-[#0A0A0B] w-full max-w-[390px] rounded-[2rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] border border-white/10 z-10 m-auto p-8 sm:p-10 pointer-events-auto"
            >
              {/* Branding Section */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#C6A861] text-navy font-serif font-bold text-2xl mb-4 shadow-xl shadow-[#C6A861]/20">
                  T
                </div>
                <h2 className="text-2xl font-serif font-bold text-navy dark:text-white mb-2 leading-tight">
                  {t('auth.welcome_back') || 'Welcome Back'}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-xs font-serif leading-normal px-2">
                  {t('auth.sign_in_desc') || 'Sign in to access exclusive content and analysis'}
                </p>
              </div>

              {/* Error messages */}
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-2xl text-red-600 dark:text-red-400 text-xs font-medium text-center leading-normal"
                >
                  {error}
                </motion.div>
              )}

              {/* Loader overlay inside the card during loading */}
              {loading && (
                <div className="absolute inset-0 bg-white/60 dark:bg-black/60 backdrop-blur-sm z-[10015] flex items-center justify-center rounded-[2rem]">
                  <div className="text-center font-serif text-[#C6A861] flex flex-col items-center gap-3">
                    <Loader2 className="animate-spin text-[#C6A861]" size={40} strokeWidth={1.5} />
                    <span className="text-sm font-semibold tracking-wider uppercase text-navy dark:text-gray-200">Connecting...</span>
                  </div>
                </div>
              )}

              {/* Buttons Container */}
              <div className="space-y-4">
                {/* Google Button */}
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleGoogleLogin}
                  className="w-full py-4 px-6 bg-white dark:bg-white/5 border-2 border-gray-100 dark:border-white/10 hover:border-gray-200 dark:hover:border-[#C6A861]/40 text-navy dark:text-white font-bold rounded-2xl shadow-sm transition-all flex items-center justify-center gap-3 group active:scale-[0.98]"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
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
                  <span className="uppercase tracking-[0.1em] text-xs font-bold text-gray-700 dark:text-gray-200">
                    {t('auth.continue_google') || 'Continue with Google'}
                  </span>
                </button>

                {/* Apple Button */}
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleAppleLogin}
                  className="w-full py-4 px-6 bg-black dark:bg-[#1C1C1E] hover:bg-neutral-900 dark:hover:bg-[#2C2C2E] text-white font-bold rounded-2xl shadow-sm transition-all flex items-center justify-center gap-3 group active:scale-[0.98]"
                >
                  <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.21.67-2.93 1.49-.62.69-1.16 1.84-1.01 2.96 1.11.09 2.27-.58 2.95-1.39z" />
                  </svg>
                  <span className="uppercase tracking-[0.1em] text-xs font-bold">
                    {t('auth.continue_apple') || 'Continue with Apple'}
                  </span>
                </button>
              </div>

              {/* Disclaimer */}
              <div className="mt-8 text-center text-[10px] text-gray-400 dark:text-gray-500 font-serif px-2 leading-relaxed">
                {t('auth.terms_agree') || 'By continuing, you agree to our Terms of Service and Privacy Policy.'}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};
