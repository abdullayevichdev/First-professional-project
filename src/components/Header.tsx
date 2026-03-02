import React from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Globe, User, LogOut, Menu, X, Sun, Moon, Lock, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User as UserType } from '../types';
import { signInWithGoogle, signInWithApple } from '../lib/firebase';

interface HeaderProps {
  user: UserType | null;
  onLogout: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onLoginSuccess?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout, isDarkMode, onToggleTheme, onLoginSuccess }) => {
  const { t, i18n } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const navigate = useNavigate();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const navItems = [
    { name: t('nav.home'), path: '/' },
    { name: t('nav.uzb_politics'), path: '/category/uzbekistan' },
    { name: t('nav.global_politics'), path: '/category/global' },
    { name: t('nav.speech_analysis'), path: '/category/speech' },
    { name: t('nav.opinion'), path: '/category/opinion' },
    { name: t('nav.about'), path: '/about' },
  ];

  const [showLoginModal, setShowLoginModal] = React.useState(false);
  const [isLoggingIn, setIsLoggingIn] = React.useState(false);

  const handleLogin = async (provider: 'google' | 'apple') => {
    setIsLoggingIn(true);
    try {
      let result;
      if (provider === 'google') {
        result = await signInWithGoogle();
      } else {
        result = await signInWithApple();
      }

      if (result && result.user) {
        // Sync with backend to set cookie
        const res = await fetch('/api/auth/firebase-sync', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            uid: result.user.uid,
            email: result.user.email,
            name: result.user.displayName,
            picture: result.user.photoURL
          })
        });

        if (res.ok) {
          if (onLoginSuccess) {
            onLoginSuccess();
          } else {
            window.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
          }
        } else {
          alert('Failed to sync user session with server.');
        }
      }
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        // User closed the popup, no need to show an alert
        return;
      }
      if (err.message.includes('Firebase is not configured')) {
        alert('Authentication is not configured. Please set up Firebase environment variables.');
      } else {
        alert('An error occurred during login. Please try again.');
      }
    } finally {
      setIsLoggingIn(false);
      setShowLoginModal(false);
    }
  };

  return (
    <header className="bg-white dark:bg-dark-card/80 border-b border-navy/5 dark:border-gold/5 sticky top-0 z-50 backdrop-blur-xl transition-all duration-500">
      {/* Top Bar: Logo & Language */}
      <div className="news-container py-6 flex justify-between items-center">
        <div className="flex items-center space-x-12">
          <Link to="/" className="flex flex-col group">
            <span className="text-5xl font-serif font-black tracking-tighter text-navy dark:text-white leading-none group-hover:text-gold transition-colors duration-500">TAHQIQ</span>
            <span className="text-[9px] font-sans font-bold uppercase tracking-[0.5em] text-gold mt-1">Analytical Insight</span>
          </Link>
          
          <div className="hidden md:block h-12 w-[1px] bg-navy/10 dark:bg-gold/10"></div>
          
          <div className="hidden md:flex flex-col">
            <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-navy/40 dark:text-gold/30">Current Edition</span>
            <span className="text-xs font-serif italic text-navy/80 dark:text-gold/60">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>

        <div className="flex items-center space-x-8">
          {/* Admin Access */}
          <Link 
            to="/admin"
            className="p-2 rounded-full border border-navy/5 dark:border-gold/10 text-navy dark:text-gold hover:bg-navy/5 dark:hover:bg-gold/5 transition-all duration-300 opacity-30 hover:opacity-100"
            title="Admin Access"
          >
            <Lock size={18} />
          </Link>

          {/* Theme Toggle */}
          <button 
            onClick={onToggleTheme}
            className="p-2 rounded-full border border-navy/5 dark:border-gold/10 text-navy dark:text-gold hover:bg-navy/5 dark:hover:bg-gold/5 transition-all duration-300"
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <div className="flex items-center space-x-4 text-[10px] font-bold font-sans text-navy/40 dark:text-gold/30">
            {['uz', 'en', 'ru'].map((lng, idx) => (
              <React.Fragment key={lng}>
                <button
                  onClick={() => changeLanguage(lng)}
                  className={`uppercase hover:text-navy dark:hover:text-gold transition-all tracking-[0.2em] ${i18n.language === lng ? 'text-navy dark:text-gold border-b border-gold' : ''}`}
                >
                  {lng === 'ru' ? 'PYC' : lng === 'en' ? 'ENG' : 'UZ'}
                </button>
                {idx < 2 && <span className="text-navy/10 dark:text-gold/10">/</span>}
              </React.Fragment>
            ))}
          </div>
          
          <div className="h-6 w-[1px] bg-navy/10 dark:bg-gold/10"></div>
          
          {user ? (
            <div className="flex items-center space-x-6">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-navy/40 dark:text-gold/30">Member</span>
                <span className="text-xs font-bold text-navy dark:text-white">{user.name}</span>
              </div>
              <div className="relative group">
                <img src={user.picture} alt={user.name} className="w-10 h-10 rounded-full border-2 border-gold/20 shadow-lg group-hover:border-gold transition-all duration-300 cursor-pointer" />
                <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-dark-card border border-navy/5 dark:border-gold/10 shadow-2xl rounded-sm opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 py-2">
                  <button onClick={onLogout} className="w-full px-6 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-navy/60 dark:text-gold/60 hover:text-gold dark:hover:text-white hover:bg-navy/5 dark:hover:bg-gold/5 flex items-center space-x-3">
                    <LogOut size={14} />
                    <span>{t('auth.logout') || 'Logout'}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => setShowLoginModal(true)} 
              className="btn-premium py-2.5 px-8 text-[10px] shadow-none hover:shadow-gold/20 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
              <User size={16} className="relative z-10 group-hover:rotate-12 transition-transform duration-300" />
              <span className="relative z-10">{t('auth.login')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Login Modal Portal */}
      {createPortal(
        <AnimatePresence>
          {showLoginModal && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => !isLoggingIn && setShowLoginModal(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-white dark:bg-[#0B1221] w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden border border-navy/10 dark:border-white/10 z-10"
              >
                <div className="p-8 text-center relative">
                  <button 
                    onClick={() => setShowLoginModal(false)}
                    disabled={isLoggingIn}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 hover:text-navy dark:hover:text-white transition-colors disabled:opacity-50"
                  >
                    <X size={20} />
                  </button>
                  
                  <div className="w-16 h-16 bg-navy/5 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                    <User size={32} className="text-navy dark:text-white" />
                  </div>

                  <h3 className="text-2xl font-serif font-bold text-navy dark:text-white mb-2">Welcome Back</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Sign in to access exclusive content and analysis</p>
                  
                  <div className="space-y-4">
                    <button
                      onClick={() => handleLogin('google')}
                      disabled={isLoggingIn}
                      className="w-full flex items-center justify-center space-x-3 py-3.5 px-4 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all duration-300 group hover:border-navy/30 dark:hover:border-white/30 hover:shadow-lg hover:shadow-navy/5 dark:hover:shadow-white/5 disabled:opacity-50 disabled:cursor-not-allowed bg-transparent"
                    >
                      {isLoggingIn ? (
                        <Loader2 className="w-5 h-5 animate-spin text-navy dark:text-white" />
                      ) : (
                        <>
                          <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                              fill="#4285F4"
                            />
                            <path
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                              fill="#34A853"
                            />
                            <path
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                              fill="#FBBC05"
                            />
                            <path
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                              fill="#EA4335"
                            />
                          </svg>
                          <span className="text-sm font-bold text-gray-700 dark:text-white group-hover:text-navy dark:group-hover:text-gray-200">Continue with Google</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleLogin('apple')}
                      disabled={isLoggingIn}
                      className="w-full flex items-center justify-center space-x-3 py-3.5 px-4 bg-black text-white rounded-xl hover:bg-gray-900 transition-all duration-300 hover:shadow-lg hover:shadow-black/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoggingIn ? (
                        <Loader2 className="w-5 h-5 animate-spin text-white" />
                      ) : (
                        <>
                          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.21-1.23 3.69-1.14.87.04 1.93.32 2.65 1.38-2.34 1.43-1.94 4.61.64 5.65-.43 1.37-1.04 2.76-2.06 4.34zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                          </svg>
                          <span className="text-sm font-bold">Continue with Apple</span>
                        </>
                      )}
                    </button>
                  </div>
                  
                  <p className="mt-8 text-[10px] text-gray-400 uppercase tracking-wider">
                    By continuing, you agree to our Terms of Service and Privacy Policy.
                  </p>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Navigation Bar */}
      <div className="border-t border-navy/5 dark:border-gold/5">
        <div className="news-container">
          <div className="flex justify-center items-center h-14">
            <nav className="hidden lg:flex space-x-12">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="nav-link"
                >
                  {item.name}
                </Link>
              ))}
            </nav>
            
            <button className="lg:hidden text-navy dark:text-gold" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="lg:hidden bg-white dark:bg-dark-card border-t border-navy/5 dark:border-gold/5 shadow-2xl"
          >
            <div className="px-4 py-8 space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="block px-6 py-3 text-[11px] font-bold uppercase tracking-[0.2em] text-navy dark:text-white hover:bg-navy/5 dark:hover:bg-gold/5 rounded-full transition-all"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
