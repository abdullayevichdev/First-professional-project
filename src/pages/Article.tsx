import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { User as UserIcon, Lock, Calendar, User as AuthorIcon, Share2, Bookmark, X, Loader2 } from 'lucide-react';
import { ContentItem, User } from '../types';
import { PageWrapper } from '../components/PageWrapper';

interface ArticleProps {
  user: User | null;
}

export const Article: React.FC<ArticleProps> = ({ user }) => {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const [item, setItem] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/content/${id}`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setItem(data);
          
          if (user) {
            fetch('/api/activity/log', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                event_type: 'view',
                content_id: id,
                content_title: data.title_uz || data.title_ru || data.title_en || '',
                details: 'Maqolani o\'qidi'
              })
            }).catch(console.error);
          }
        }
      } catch (err) {
        console.error("Failed to fetch article:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id, user]);

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (user && user.saved_articles && id) {
      setIsSaved(user.saved_articles.includes(id));
    }
  }, [user, id]);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: item?.title_uz || 'Tahqiq',
          text: item?.excerpt_uz || '',
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      }
      
      if (user && item) {
        fetch('/api/activity/log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event_type: 'share',
            content_id: id,
            content_title: item.title_uz || item.title_ru || item.title_en || '',
            details: 'Maqolani ulashdi'
          })
        }).catch(console.error);
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  const handleSave = async () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    try {
      const res = await fetch('/api/user/save-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId: id }),
      });
      if (res.ok) {
        const data = await res.json();
        setIsSaved(data.saved_articles.includes(id));
        
        if (item) {
          fetch('/api/activity/log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event_type: 'save',
              content_id: id,
              content_title: item.title_uz || item.title_ru || item.title_en || '',
              details: data.saved_articles.includes(id) ? 'Maqolani saqladi' : 'Maqolani saqlanganlardan olib tashladi'
            })
          }).catch(console.error);
        }
      }
    } catch (err) {
      console.error("Failed to save article:", err);
    }
  };

  const handleLogin = async (provider: 'google' | 'apple') => {
    setIsLoggingIn(true);
    try {
      const { signInWithGoogle, signInWithApple } = await import('../lib/firebase');
      if (provider === 'google') {
        await signInWithGoogle();
      } else {
        await signInWithApple();
      }
      // The page will redirect
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.message?.includes('Firebase is not configured')) {
        alert('Authentication is not configured. Please set up Firebase environment variables.');
      } else {
        alert('An error occurred during login. Please try again.');
      }
      setIsLoggingIn(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
      </div>
    );
  }

  if (!item) return <div className="text-center py-20">{t('article.not_found')}</div>;

  const title = i18n.language === 'en' ? item.title_en : i18n.language === 'ru' ? item.title_ru : item.title_uz;
  const excerpt = i18n.language === 'en' ? item.excerpt_en : i18n.language === 'ru' ? item.excerpt_ru : item.excerpt_uz;
  const body = i18n.language === 'en' ? item.body_en : i18n.language === 'ru' ? item.body_ru : item.body_uz;

  return (
    <PageWrapper className="min-h-screen bg-white dark:bg-dark-bg transition-colors duration-500">
      <article className="pb-32">
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-white dark:bg-dark-card py-12 sm:py-24 border-b border-navy/5 dark:border-gold/5 transition-colors duration-500"
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Link to={`/category/${item.category}`} className="inline-block text-[9px] sm:text-[10px] font-bold text-gold uppercase tracking-[0.4em] mb-6 sm:mb-8 hover:text-navy dark:hover:text-white transition-colors">
                {item.category.replace('_', ' ')}
              </Link>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-3xl sm:text-4xl md:text-6xl font-serif font-bold text-navy dark:text-white leading-tight mb-8 sm:mb-12"
            >
              {title}
            </motion.h1>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-[10px] sm:text-[11px] font-bold text-navy/30 dark:text-gold/30 uppercase tracking-[0.2em]"
            >
              <div className="flex items-center space-x-2 sm:space-x-3">
                <AuthorIcon size={12} className="text-gold sm:w-[14px] sm:h-[14px]" />
                <span className="text-navy dark:text-gray-300">{item.author}</span>
              </div>
              <span className="hidden sm:block w-1 h-1 bg-gold rounded-full"></span>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Calendar size={12} className="text-gold sm:w-[14px] sm:h-[14px]" />
                <span className="text-navy dark:text-gray-300">
                  {new Date(item.created_at).toLocaleDateString(i18n.language === 'uz' ? 'uz-UZ' : i18n.language === 'ru' ? 'ru-RU' : 'en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </motion.div>
          </div>
        </motion.header>

        {/* Content */}
        <div className="news-container mt-8 sm:mt-16">
          <div className="max-w-5xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="aspect-video bg-white dark:bg-black/20 article-card mb-12 sm:mb-20 shadow-2xl"
            >
              <img
                src={item.image_url || `https://picsum.photos/seed/${item.id}/1200/675`}
                alt={title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-20">
              {/* Sidebar Actions */}
              <div className="hidden lg:block lg:col-span-1">
                <div className="sticky top-40 flex flex-col items-center gap-4">
                  <div className="bg-white dark:bg-[#0A0A0B] border border-gray-100 dark:border-white/5 rounded-full p-2 shadow-sm flex flex-col gap-2">
                    <button 
                      onClick={handleShare}
                      className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-navy dark:hover:text-gold hover:bg-gray-50 dark:hover:bg-white/5 transition-all group relative"
                      title={t('article.share')}
                    >
                      <Share2 size={18} />
                      {/* Tooltip */}
                      <span className="absolute left-full ml-4 px-2 py-1 bg-navy dark:bg-white text-white dark:text-navy text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                        {isCopied ? t('article.copied') : t('article.share')}
                      </span>
                    </button>
                    
                    <div className="w-6 h-[1px] bg-gray-100 dark:bg-white/5 mx-auto" />

                    <button 
                      onClick={handleSave}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all group relative ${isSaved ? 'text-gold bg-gold/10' : 'text-gray-400 hover:text-navy dark:hover:text-gold hover:bg-gray-50 dark:hover:bg-white/5'}`}
                      title={t('article.save')}
                    >
                      <Bookmark size={18} fill={isSaved ? "currentColor" : "none"} />
                      {/* Tooltip */}
                      <span className="absolute left-full ml-4 px-2 py-1 bg-navy dark:bg-white text-white dark:text-navy text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                        {isSaved ? t('article.saved') : t('article.save')}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Main Body */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="lg:col-span-11"
              >
                <div className="max-w-3xl">
                  <p className="text-xl sm:text-2xl font-serif italic text-navy/60 dark:text-gray-400 leading-relaxed mb-12 sm:mb-16 border-l-4 border-gold pl-6 sm:pl-10">
                    {excerpt}
                  </p>

                  {item.is_preview ? (
                    <div className="relative">
                      <div className="h-60 bg-gradient-to-t from-white dark:from-dark-bg to-transparent absolute bottom-0 left-0 right-0 z-10" />
                      <div className="opacity-10 pointer-events-none select-none space-y-8 dark:text-white">
                        <p className="text-lg leading-loose">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                        <p className="text-lg leading-loose">Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
                      </div>
                      
                      <div className="mt-12 sm:mt-20 bg-navy dark:bg-dark-card p-8 sm:p-16 text-center relative z-20 article-card border border-gold/20 shadow-2xl">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8">
                          <Lock size={28} className="text-gold sm:w-[32px] sm:h-[32px]" />
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-serif font-bold mb-4 sm:mb-6 text-white">
                          {t('article.exclusive_analysis')}
                        </h2>
                        <p className="text-white/50 dark:text-gray-400 mb-8 sm:mb-10 max-w-sm mx-auto text-[10px] sm:text-sm font-light leading-relaxed uppercase tracking-widest">
                          {t('auth.gmail_only')}
                        </p>
                        <button
                          onClick={() => setShowLoginModal(true)}
                          className="btn-premium px-8 py-4 sm:px-12 sm:py-5"
                        >
                          <UserIcon size={16} className="sm:w-[18px] sm:h-[18px]" />
                          <span>{t('auth.login')}</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="font-sans text-navy/80 dark:text-gray-300 leading-[1.8] sm:leading-[2.2] text-base sm:text-lg space-y-8 sm:space-y-10 font-light">
                      {body?.split('\n').map((p, i) => (
                        <p key={i}>{p}</p>
                      ))}
                      
                      {item.video_url && (
                        <div className="mt-20 aspect-video bg-navy dark:bg-black article-card shadow-2xl">
                          <iframe
                            width="100%"
                            height="100%"
                            src={item.video_url.replace('watch?v=', 'embed/')}
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          ></iframe>
                        </div>
                      )}

                      {/* Mobile Actions */}
                      <div className="lg:hidden mt-12 pt-8 border-t border-gray-100 dark:border-white/5 flex items-center justify-center gap-6">
                        <button 
                          onClick={handleShare}
                          className="flex items-center gap-2 px-6 py-3 rounded-full bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:text-navy dark:hover:text-gold transition-colors"
                        >
                          <Share2 size={18} />
                          <span className="text-sm font-medium">{isCopied ? t('article.copied') : t('article.share')}</span>
                        </button>
                        <button 
                          onClick={handleSave}
                          className={`flex items-center gap-2 px-6 py-3 rounded-full transition-colors ${isSaved ? 'bg-gold/10 text-gold' : 'bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:text-navy dark:hover:text-gold'}`}
                        >
                          <Bookmark size={18} fill={isSaved ? "currentColor" : "none"} />
                          <span className="text-sm font-medium">{isSaved ? t('article.saved') : t('article.save')}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </article>

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
                className="relative bg-white dark:bg-dark-card w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden border border-navy/10 dark:border-gold/10 z-10"
              >
                <div className="p-8 text-center relative">
                  <button 
                    onClick={() => setShowLoginModal(false)}
                    disabled={isLoggingIn}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 hover:text-navy dark:hover:text-gold transition-colors disabled:opacity-50"
                  >
                    <X size={20} />
                  </button>
                  
                  <div className="w-16 h-16 bg-white dark:bg-white/5 border border-gray-200 dark:border-transparent rounded-full flex items-center justify-center mx-auto mb-6">
                    <UserIcon size={32} className="text-navy dark:text-gold" />
                  </div>

                  <h3 className="text-2xl font-serif font-bold text-navy dark:text-white mb-2">{t('auth.welcome_back')}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">{t('auth.sign_in_desc')}</p>
                  
                  <div className="space-y-4">
                    <button
                      onClick={() => handleLogin('google')}
                      disabled={isLoggingIn}
                      className="w-full flex items-center justify-center space-x-3 py-3.5 px-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all duration-300 group hover:border-navy/30 dark:hover:border-gold/30 hover:shadow-lg hover:shadow-navy/5 dark:hover:shadow-gold/5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoggingIn ? (
                        <Loader2 className="w-5 h-5 animate-spin text-navy dark:text-gold" />
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
                          <span className="text-sm font-bold text-gray-700 dark:text-gray-200 group-hover:text-navy dark:group-hover:text-white">{t('auth.continue_google')}</span>
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
                          <span className="text-sm font-bold">{t('auth.continue_apple')}</span>
                        </>
                      )}
                    </button>
                  </div>
                  
                  <p className="mt-8 text-[10px] text-gray-400 uppercase tracking-wider">
                    {t('auth.terms_agree')}
                  </p>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </PageWrapper>
  );
};
