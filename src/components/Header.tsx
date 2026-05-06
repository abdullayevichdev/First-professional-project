import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Globe, User, LogOut, Menu, X, Sun, Moon, Lock, Loader2, Search, Instagram, Twitter, Youtube, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User as UserType, ContentItem } from '../types';
import { AuthModal } from './AuthModal';

interface HeaderProps {
  user: UserType | null;
  onLogout: () => void;
  onLoginSuccess?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout, onLoginSuccess }) => {
  const { t, i18n } = useTranslation();
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    // Update date every minute to ensure real-time accuracy
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const getMonthName = (date: Date, lang: string) => {
    const monthsUz = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'];
    const monthsRu = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    const monthsEn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    // Fallback to English if lang is not recognized
    const normalizedLang = lang ? lang.split('-')[0].toLowerCase() : 'en';
    const m = date.getMonth();
    if (normalizedLang === 'uz') return monthsUz[m];
    if (normalizedLang === 'ru') return monthsRu[m];
    return monthsEn[m];
  };

  const month = getMonthName(currentDate, i18n.language);
  const day = currentDate.getDate();
  const year = currentDate.getFullYear();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<ContentItem[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const navigate = useNavigate();

  // Debounced search
  React.useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true);
        try {
          const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
          if (res.ok) {
            const data = await res.json();
            setSearchResults(data);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const navItems = [
    { name: t('nav.home'), path: '/' },
    { name: t('nav.uzb_politics'), path: '/category/uzbekistan' },
    { name: t('nav.global_politics'), path: '/category/global' },
    { name: t('nav.speech_analysis'), path: '/category/speech' },
    { name: t('nav.opinion'), path: '/category/opinion' },
    { name: t('nav.glossary'), path: '/glossary' },
    { name: t('nav.about'), path: '/about' },
    { name: 'Maqola yuborish', path: '/submit-article' },
  ];

  const [showLoginModal, setShowLoginModal] = React.useState(false);

  return (
    <header className="bg-white dark:bg-dark-card/80 border-b border-navy/5 dark:border-gold/5 sticky top-0 z-50 backdrop-blur-xl transition-all duration-500">
      {/* Top Bar: Logo & Language */}
      <div className="news-container py-4 sm:py-6 flex justify-between items-center">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center space-x-3 sm:space-x-12"
        >
          <Link to="/" className="flex flex-col group">
            <motion.span 
              whileHover={{ scale: 1.02 }}
              className="text-2xl sm:text-4xl md:text-5xl font-serif font-black tracking-[-0.05em] text-navy dark:text-white leading-none group-hover:text-gold transition-all duration-500"
            >
              TAHQIQ
            </motion.span>
            <span className="text-[7px] sm:text-[9px] font-bold uppercase tracking-[0.4em] text-gold/60 mt-1 hidden sm:block">Political Analysis Center</span>
          </Link>
          
          <div className="lg:block h-12 w-[1px] bg-navy/10 dark:bg-gold/10 ml-6 hidden sm:block"></div>
          
          <div className="flex flex-col sm:pl-6 sm:border-l border-navy/10 dark:border-gold/10 sm:ml-6 relative group cursor-default">
            <motion.div 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-2 mb-0.5 sm:mb-1.5"
            >
              <div className="w-1 h-1 rounded-full bg-gold shadow-[0_0_8px_rgba(212,175,55,0.4)]"></div>
              <span className="text-[7px] sm:text-[10px] font-medium uppercase tracking-[0.3em] text-gold/90 dark:text-gold/60">
                {t('common.current_edition')}
              </span>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-baseline space-x-1.5 sm:space-x-2.5"
            >
              <span className="text-sm sm:text-2xl font-serif italic text-navy dark:text-white leading-none">
                {day} {month}
              </span>
              <span className="text-[10px] sm:text-sm font-sans font-light text-navy/30 dark:text-gold/20 tracking-widest hidden xs:inline">
                {year}
              </span>
            </motion.div>
          </div>
        </motion.div>

        <div className="flex items-center space-x-2 sm:space-x-8">
          {/* Action Buttons Container - Desktop Only */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Search Button */}
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2.5 rounded-full border border-navy/5 dark:border-gold/10 text-navy dark:text-gold hover:bg-navy/5 dark:hover:bg-gold/5 transition-all duration-300"
            >
              <Search size={20} />
            </button>

            {/* Language Selector */}
            <div className="flex items-center px-2 py-1.5 bg-gray-50 dark:bg-white/5 rounded-full border border-navy/5 dark:border-gold/10">
              {['uz', 'en', 'ru'].map((lng, idx) => (
                <React.Fragment key={lng}>
                  <button
                    onClick={() => changeLanguage(lng)}
                    className={`uppercase px-2 text-[10px] font-bold tracking-widest transition-all ${i18n.language === lng ? 'text-gold' : 'text-navy/30 dark:text-gold/20 hover:text-navy dark:hover:text-gold'}`}
                  >
                    {lng}
                  </button>
                  {idx < 2 && <div className="w-[1px] h-2.5 bg-navy/10 dark:bg-gold/10"></div>}
                </React.Fragment>
              ))}
            </div>
          </div>
          
          {user ? (
            <div className="flex items-center space-x-3 sm:space-x-6">
              {user.role === 'admin' && (
                <Link to="/admin" className="flex items-center justify-center space-x-1.5 p-2 px-3 lg:py-2.5 lg:px-4 rounded-full border border-navy/10 dark:border-gold/20 text-navy dark:text-gold hover:bg-navy/5 dark:hover:bg-gold/10 transition-all duration-300">
                  <Lock size={16} />
                  <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">Admin</span>
                </Link>
              )}
              <div className="hidden md:flex flex-col items-end">
                <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-navy/40 dark:text-gold/30">{t('common.member')}</span>
                <span className="text-xs font-bold text-navy dark:text-white">{user.name}</span>
              </div>
              <Link to="/profile" className="relative group">
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full border-2 border-gold/20 shadow-xl group-hover:border-gold transition-all duration-300 cursor-pointer flex items-center justify-center bg-navy dark:bg-gold text-white dark:text-navy font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </Link>
            </div>
          ) : (
            <button 
              onClick={() => setShowLoginModal(true)} 
              className="flex items-center justify-center space-x-2 bg-navy dark:bg-gold text-white dark:text-navy py-2 px-5 sm:py-2.5 sm:px-7 text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.1em] sm:tracking-[0.15em] rounded-full hover:bg-gold dark:hover:bg-white hover:text-white dark:hover:text-navy active:scale-95 transition-all duration-300 shadow-sm hover:shadow-gold/30 group relative overflow-hidden"
            >
              <User size={16} className="relative z-10 group-hover:rotate-12 transition-transform duration-300" />
              <span className="relative z-10">{t('auth.login')}</span>
            </button>
          )}

          {/* Mobile Actions Container */}
          <div className="flex lg:hidden items-center space-x-1">
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 text-navy dark:text-gold hover:bg-navy/5 dark:hover:bg-gold/5 rounded-full transition-colors"
              aria-label="Search"
            >
              <Search size={22} />
            </button>
            <button 
              className="p-2 text-navy dark:text-gold hover:bg-navy/5 dark:hover:bg-gold/5 rounded-full transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle Menu"
            >
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute inset-x-0 top-full bg-white dark:bg-dark-card border-b border-navy/10 dark:border-gold/10 shadow-2xl z-40"
          >
            <div className="news-container py-12">
              <div className="flex justify-end mb-4">
                <button 
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchResults([]);
                    setSearchQuery('');
                  }}
                  className="text-navy dark:text-gold hover:text-gold dark:hover:text-white transition-colors"
                >
                  <X size={32} />
                </button>
              </div>
              <form onSubmit={handleSearch} className="relative max-w-3xl mx-auto">
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('common.search_placeholder') || "Maqolalarni qidirish..."}
                  className="w-full bg-gray-50 dark:bg-white/5 border-b-2 border-navy/10 dark:border-gold/20 focus:border-gold outline-none py-4 px-6 text-2xl font-serif text-navy dark:text-white transition-all"
                />
                <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-gold">
                  {isSearching ? <Loader2 className="animate-spin" size={24} /> : <Search size={24} />}
                </button>
              </form>

              {searchResults.length > 0 && (
                <div className="mt-12 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                  {searchResults.map((item) => (
                    <Link
                      key={item.id}
                      to={`/article/${item.id}`}
                      onClick={() => setIsSearchOpen(false)}
                      className="flex space-x-4 group"
                    >
                      <div className="w-24 h-24 flex-shrink-0 bg-gray-100 dark:bg-white/5 rounded-lg overflow-hidden">
                        <img 
                          src={item.image_url || `https://picsum.photos/seed/${item.id}/200/200`} 
                          alt="" 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            if (target.src.includes('unsplash.com')) {
                              target.src = `https://picsum.photos/seed/${item.id}/200/200`;
                            } else {
                              target.src = `https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=200&h=200`;
                            }
                          }}
                        />
                      </div>
                      <div>
                        <h4 className="text-sm font-serif font-bold text-navy dark:text-white group-hover:text-gold transition-colors line-clamp-2">
                          {i18n.language === 'en' ? item.title_en : i18n.language === 'ru' ? item.title_ru : item.title_uz}
                        </h4>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-2">{item.category}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              
              {searchQuery && searchResults.length === 0 && !isSearching && (
                <p className="text-center mt-8 text-gray-400 font-serif italic">Natija topilmadi</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
        onSuccess={(user) => {
          onLoginSuccess?.();
          setShowLoginModal(false);
        }} 
      />

      {/* Navigation Bar */}
      <div className="border-t border-navy/5 dark:border-gold/5">
        <div className="news-container">
          <div className="flex justify-between lg:justify-center items-center h-14">
            <nav className="hidden lg:flex space-x-4 xl:space-x-8 px-4">
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
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] lg:hidden bg-white dark:bg-dark-bg flex flex-col h-screen"
          >
            {/* Header in Menu */}
            <div className="flex justify-between items-center p-6 border-b border-navy/5 dark:border-gold/5 flex-shrink-0">
              <span className="text-2xl font-serif font-black tracking-tighter text-navy dark:text-white uppercase transition-colors">TAHQIQ</span>
              <button 
                className="text-navy dark:text-gold p-2 hover:bg-navy/5 dark:hover:bg-gold/5 rounded-full transition-colors" 
                onClick={() => setIsMenuOpen(false)}
                aria-label="Close menu"
              >
                <X size={32} />
              </button>
            </div>

            {/* Menu Content */}
            <div className="flex-grow overflow-y-auto px-8 py-10 flex flex-col space-y-12">
              <nav className="space-y-4">
                {navItems.map((item, idx) => (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Link
                      to={item.path}
                      className="group flex items-baseline space-x-6 py-3 border-b border-navy/5 dark:border-white/5"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span className="text-[10px] font-mono font-bold text-gold/40 group-hover:text-gold transition-colors w-6">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <span className="text-2xl font-serif font-bold text-navy dark:text-white group-hover:text-gold transition-colors">
                        {item.name}
                      </span>
                    </Link>
                  </motion.div>
                ))}

                {/* Admin Panel Link specifically for mobile menu */}
                {user?.role === 'admin' && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: navItems.length * 0.05 }}
                  >
                    <Link
                      to="/admin"
                      className="group flex items-baseline space-x-6 py-3 border-b border-gold/20"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span className="text-[10px] font-mono font-bold text-gold/40 group-hover:text-gold transition-colors w-6">
                        {String(navItems.length + 1).padStart(2, '0')}
                      </span>
                      <div className="flex items-center space-x-3">
                        <Lock size={20} className="text-gold" />
                        <span className="text-2xl font-serif font-bold text-gold group-hover:text-white transition-colors">
                          Admin Panel
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                )}
              </nav>

              {/* Language Selector in Menu */}
              <div className="bg-gray-50 dark:bg-white/5 p-6 rounded-2xl border border-navy/5 dark:border-white/5">
                <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-navy/40 dark:text-gold/40 mb-6 flex items-center">
                  <span className="mr-3">Tushunish darajasi</span>
                  <div className="flex-grow h-[1px] bg-navy/5 dark:bg-gold/10"></div>
                </div>
                <div className="flex justify-between items-center bg-white dark:bg-dark-card p-1.5 rounded-full shadow-inner">
                  {['uz', 'en', 'ru'].map((lng) => (
                    <button
                      key={lng}
                      onClick={() => { changeLanguage(lng); setIsMenuOpen(false); }}
                      className={`flex-grow py-3 px-4 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 ${i18n.language === lng ? 'bg-navy dark:bg-gold text-white dark:text-navy shadow-lg' : 'text-navy/40 dark:text-gold/40 hover:text-navy dark:hover:text-white'}`}
                    >
                      {lng}
                    </button>
                  ))}
                </div>
              </div>

              {/* Auth / Profile in Menu */}
              <div className="pb-10">
                {user ? (
                  <div className="space-y-6">
                    <div className="flex items-center space-x-5 p-6 bg-navy/5 dark:bg-gold/5 rounded-3xl border border-navy/5 dark:border-gold/10 shadow-sm">
                      <div className="w-16 h-16 rounded-full bg-navy dark:bg-gold flex items-center justify-center text-white dark:text-navy font-serif font-black text-2xl shadow-xl border-4 border-white dark:border-dark-bg">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-grow">
                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold/60 dark:text-gold/40 mb-1.5 flex items-center">
                          <span className="w-2 h-2 bg-gold rounded-full mr-2 animate-pulse"></span>
                          Profilingiz
                        </p>
                        <p className="text-xl font-serif font-bold text-navy dark:text-white leading-tight">{user.name}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Link 
                        to="/profile" 
                        onClick={() => setIsMenuOpen(false)} 
                        className="btn-premium py-4 w-full flex justify-center items-center text-[10px] tracking-widest shadow-none"
                      >
                        PROFIL
                      </Link>
                      <button 
                        onClick={() => { onLogout(); setIsMenuOpen(false); }} 
                        className="w-full text-red-500 font-bold uppercase tracking-[0.2em] text-[10px] bg-red-50 dark:bg-red-500/5 hover:bg-red-100 dark:hover:bg-red-500/10 rounded-2xl transition-all border border-red-500/10 py-4 flex justify-center items-center"
                      >
                        CHIQISH
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => { setShowLoginModal(true); setIsMenuOpen(false); }}
                    className="btn-premium w-full py-6 text-[10px] tracking-[0.3em] shadow-2xl shadow-gold/20 flex justify-center items-center"
                  >
                    <User size={18} className="mr-3" />
                    <span>HAMYONNI ULASH / KIRISH</span>
                  </button>
                )}
              </div>

              {/* Social Links at Bottom */}
              <div className="mt-auto pt-10 pb-12 flex flex-col items-center">
                <div className="flex space-x-6 mb-8">
                  {[
                    { icon: Instagram, href: "#", color: "hover:text-pink-500" },
                    { icon: Send, href: "#", color: "hover:text-blue-400" },
                    { icon: Youtube, href: "#", color: "hover:text-red-500" },
                    { icon: Twitter, href: "#", color: "hover:text-sky-500" }
                  ].map((social, i) => (
                    <motion.a 
                      key={i}
                      href={social.href}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + (i * 0.1) }}
                      className={`w-12 h-12 rounded-full bg-navy/5 dark:bg-white/5 flex items-center justify-center text-navy/40 dark:text-gold/40 ${social.color} hover:bg-white dark:hover:bg-white/10 transition-all duration-300 border border-navy/5 dark:border-gold/10 shadow-sm`}
                    >
                      <social.icon size={20} />
                    </motion.a>
                  ))}
                </div>
                <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-navy/20 dark:text-white/10">TAHQIQ • 2026</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
