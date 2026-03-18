import React from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Globe, User, LogOut, Menu, X, Sun, Moon, Lock, Loader2, Search } from 'lucide-react';
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
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
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
      <div className="news-container py-6 flex justify-between items-center">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center space-x-4 sm:space-x-12"
        >
          <Link to="/" className="flex flex-col group">
            <motion.span 
              whileHover={{ scale: 1.02 }}
              className="text-3xl sm:text-4xl md:text-5xl font-serif font-black tracking-tighter text-navy dark:text-white leading-none group-hover:text-gold transition-colors duration-500"
            >
              TAHQIQ
            </motion.span>
          </Link>
          
          <div className="hidden md:block h-12 w-[1px] bg-navy/10 dark:bg-gold/10"></div>
          
          <div className="hidden md:flex flex-col">
            <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-navy/40 dark:text-gold/30">{t('common.current_edition')}</span>
            <span className="text-xs font-serif italic text-navy/80 dark:text-gold/60">{new Date().toLocaleDateString(i18n.language === 'uz' ? 'uz-UZ' : i18n.language === 'ru' ? 'ru-RU' : 'en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </motion.div>

        <div className="flex items-center space-x-3 sm:space-x-8">
          {/* Search Button */}
          <button 
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="p-1.5 sm:p-2 rounded-full border border-navy/5 dark:border-gold/10 text-navy dark:text-gold hover:bg-navy/5 dark:hover:bg-gold/5 transition-all duration-300"
          >
            <Search size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>

          {/* Admin Access */}
          <Link 
            to="/admin"
            className="p-1.5 sm:p-2 rounded-full border border-navy/5 dark:border-gold/10 text-navy dark:text-gold hover:bg-navy/5 dark:hover:bg-gold/5 transition-all duration-300 opacity-30 hover:opacity-100"
            title="Admin Access"
          >
            <Lock size={16} className="sm:w-[18px] sm:h-[18px]" />
          </Link>

          <div className="flex items-center space-x-2 sm:space-x-4 text-[9px] sm:text-[10px] font-bold font-sans text-navy/40 dark:text-gold/30">
            {['uz', 'en', 'ru'].map((lng, idx) => (
              <React.Fragment key={lng}>
                <button
                  onClick={() => changeLanguage(lng)}
                  className={`uppercase hover:text-navy dark:hover:text-gold transition-all tracking-[0.1em] sm:tracking-[0.2em] ${i18n.language === lng ? 'text-navy dark:text-gold border-b border-gold' : ''}`}
                >
                  {lng === 'ru' ? 'PYC' : lng === 'en' ? 'ENG' : 'UZ'}
                </button>
                {idx < 2 && <span className="text-navy/10 dark:text-gold/10">/</span>}
              </React.Fragment>
            ))}
          </div>
          
          <div className="hidden sm:block h-6 w-[1px] bg-navy/10 dark:bg-gold/10"></div>
          
          {user ? (
            <div className="flex items-center space-x-3 sm:space-x-6">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-navy/40 dark:text-gold/30">{t('common.member')}</span>
                <span className="text-xs font-bold text-navy dark:text-white">{user.name}</span>
              </div>
              <div className="relative group">
                <Link to="/profile">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-gold/20 shadow-lg group-hover:border-gold transition-all duration-300 cursor-pointer flex items-center justify-center bg-gold text-white font-bold text-sm sm:text-base">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
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
              className="btn-premium py-2 sm:py-2.5 px-4 sm:px-8 text-[9px] sm:text-[10px] shadow-none hover:shadow-gold/20 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
              <User size={14} className="sm:w-4 sm:h-4 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
              <span className="relative z-10">{t('auth.login')}</span>
            </button>
          )}
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
            
            <div className="lg:hidden flex items-center justify-between w-full">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-navy/40 dark:text-gold/40">Menu</span>
              <button className="text-navy dark:text-gold p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="lg:hidden bg-white dark:bg-dark-card border-t border-navy/5 dark:border-gold/5 shadow-2xl overflow-hidden"
          >
            <div className="px-4 py-8 space-y-4">
              {navItems.map((item, idx) => (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Link
                    to={item.path}
                    className="block px-6 py-3 text-[11px] font-bold uppercase tracking-[0.2em] text-navy dark:text-white hover:bg-navy/5 dark:hover:bg-gold/5 rounded-full transition-all"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                </motion.div>
              ))}
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: navItems.length * 0.05 }}
                className="pt-4 border-t border-navy/5 dark:border-gold/5"
              >
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
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
