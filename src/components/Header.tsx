import React from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Globe, User, LogOut, Menu, X, Sun, Moon, Lock, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User as UserType } from '../types';
import { AuthModal } from './AuthModal';

interface HeaderProps {
  user: UserType | null;
  onLogout: () => void;
  onLoginSuccess?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout, onLoginSuccess }) => {
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

  return (
    <header className="bg-white dark:bg-dark-card/80 border-b border-navy/5 dark:border-gold/5 sticky top-0 z-50 backdrop-blur-xl transition-all duration-500">
      {/* Top Bar: Logo & Language */}
      <div className="news-container py-6 flex justify-between items-center">
        <div className="flex items-center space-x-12">
          <Link to="/" className="flex flex-col group">
            <span className="text-5xl font-serif font-black tracking-tighter text-navy dark:text-white leading-none group-hover:text-gold transition-colors duration-500">TAHQIQ</span>
          </Link>
          
          <div className="hidden md:block h-12 w-[1px] bg-navy/10 dark:bg-gold/10"></div>
          
          <div className="hidden md:flex flex-col">
            <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-navy/40 dark:text-gold/30">{t('common.current_edition')}</span>
            <span className="text-xs font-serif italic text-navy/80 dark:text-gold/60">{new Date().toLocaleDateString(i18n.language === 'uz' ? 'uz-UZ' : i18n.language === 'ru' ? 'ru-RU' : 'en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
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
                <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-navy/40 dark:text-gold/30">{t('common.member')}</span>
                <span className="text-xs font-bold text-navy dark:text-white">{user.name}</span>
              </div>
              <div className="relative group">
                <Link to="/profile">
                  <img src={user.picture || 'https://picsum.photos/seed/user/100/100'} alt={user.name} className="w-10 h-10 rounded-full border-2 border-gold/20 shadow-lg group-hover:border-gold transition-all duration-300 cursor-pointer" />
                </Link>
                <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-dark-card border border-navy/5 dark:border-gold/10 shadow-2xl rounded-sm opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 py-2">
                  <Link to="/profile" className="w-full px-6 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-navy/60 dark:text-gold/60 hover:text-gold dark:hover:text-white hover:bg-navy/5 dark:hover:bg-gold/5 flex items-center space-x-3">
                    <User size={14} />
                    <span>Profil</span>
                  </Link>
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

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
        onSuccess={() => onLoginSuccess?.()} 
      />

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
              
              <div className="pt-4 border-t border-navy/5 dark:border-gold/5">
                {user ? (
                  <>
                    <Link
                      to="/profile"
                      className="block px-6 py-3 text-[11px] font-bold uppercase tracking-[0.2em] text-navy dark:text-white hover:bg-navy/5 dark:hover:bg-gold/5 rounded-full transition-all"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Profil
                    </Link>
                    <button
                      onClick={() => {
                        onLogout();
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left px-6 py-3 text-[11px] font-bold uppercase tracking-[0.2em] text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full transition-all"
                    >
                      Chiqish
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setShowLoginModal(true);
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left px-6 py-3 text-[11px] font-bold uppercase tracking-[0.2em] text-gold hover:bg-gold/5 rounded-full transition-all"
                  >
                    Kirish
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
