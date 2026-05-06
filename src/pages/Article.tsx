import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { User as UserIcon, Lock, Calendar, Share2, Bookmark } from 'lucide-react';
import { ContentItem, User } from '../types';
import { PageWrapper } from '../components/PageWrapper';
import { db, doc, onSnapshot } from '../lib/firebase';
import { AuthModal } from '../components/AuthModal';

interface ArticleProps {
  user: User | null;
}

export const Article: React.FC<ArticleProps> = ({ user }) => {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const [item, setItem] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isSaved, setIsSaved] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!id || !db) return;

    setLoading(true);
    const unsub = onSnapshot(doc(db, "content", id), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setItem({
          id: snap.id,
          ...data,
          created_at: data.created_at?.toDate ? data.created_at.toDate().toISOString() : data.created_at || null
        } as ContentItem);
      }
      setLoading(false);
    });

    return () => unsub();
  }, [id]);

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
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  const handleSave = async () => {
    if (!user) {
      setAuthMode('login');
      setShowAuthModal(true);
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
      }
    } catch (err) {
      console.error("Failed to save article:", err);
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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(i18n.language === 'uz' ? 'uz-UZ' : i18n.language === 'ru' ? 'ru-RU' : 'en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <PageWrapper className="min-h-screen bg-white dark:bg-dark-bg transition-colors duration-500">
      <Helmet>
        <title>{`${title || 'Tahqiq'} | Tahqiq`}</title>
        <meta name="description" content={excerpt || ''} />
      </Helmet>
      
      <article className="pb-32">
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative py-12 sm:py-24 lg:py-32 border-b border-navy/5 dark:border-gold/5 bg-gray-50/50 dark:bg-white/5 transition-colors duration-500 overflow-hidden"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(198,161,91,0.05),transparent)] pointer-events-none" />
          <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Link to={`/category/${item.category}`} className="inline-block text-[10px] sm:text-[12px] font-bold text-gold uppercase tracking-[0.5em] mb-8 sm:mb-10 hover:text-navy dark:hover:text-white transition-colors">
                {item.category.replace('_', ' ')}
              </Link>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-3xl sm:text-5xl lg:text-7xl font-serif font-black text-navy dark:text-white leading-[1.1] mb-10 sm:mb-16"
            >
              {title}
            </motion.h1>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-[10px] sm:text-[12px] font-bold text-navy/30 dark:text-gold/40 uppercase tracking-[0.2em]"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-gold">
                  <UserIcon size={14} />
                </div>
                <span className="text-navy dark:text-gray-300">{item.author}</span>
              </div>
              <div className="w-1.5 h-1.5 bg-gold/30 rounded-full"></div>
              <div className="flex items-center space-x-3">
                <Calendar size={14} className="text-gold/50" />
                <span className="text-navy dark:text-gray-300">
                  {formatDate(item.created_at)}
                </span>
              </div>
            </motion.div>
          </div>
        </motion.header>

        {/* Hero Image */}
        <div className="news-container -mt-10 sm:-mt-20 relative z-20">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="aspect-[16/9] overflow-hidden article-card shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] rounded-xl"
          >
            <img
              src={item.image_url || `https://picsum.photos/seed/${item.id}/2000/1200`}
              alt={title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </motion.div>
        </div>

        <div className="news-container py-12 sm:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 sm:gap-20">
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
                <p className="text-xl sm:text-3xl font-serif italic text-navy/70 dark:text-gray-300 leading-relaxed mb-12 sm:mb-20 border-l-4 border-gold pl-8 sm:pl-12 py-4">
                  {excerpt}
                </p>

                {!user && item.is_locked ? (
                  <div className="relative">
                    <div className="font-sans text-navy/80 dark:text-gray-300 leading-[1.8] sm:leading-[2.4] text-lg sm:text-2xl space-y-12 font-light relative">
                      <p>{body?.split('\n')[0]}</p>
                      <div className="h-64 bg-gradient-to-t from-white dark:from-dark-bg via-white/80 dark:via-dark-bg/80 to-transparent absolute bottom-0 left-0 right-0 z-10" />
                    </div>
                    
                    <div className="mt-12 bg-white dark:bg-dark-card p-8 sm:p-20 text-center relative z-20 border border-navy/5 dark:border-gold/10 rounded-2xl shadow-3xl">
                      <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-10 shadow-inner">
                        <Lock size={32} className="text-gold" />
                      </div>
                      <h2 className="text-3xl sm:text-5xl font-serif font-black mb-8 text-navy dark:text-white">
                        {t('article.exclusive_analysis') || "Eksklyuziv Tahlil"}
                      </h2>
                      <p className="text-base sm:text-xl text-navy/60 dark:text-gray-400 mb-12 sm:mb-16 max-w-lg mx-auto font-light leading-relaxed">
                        Ushbu maqolaning to'liq matni va chuqur siyosiy tahlilini o'qish uchun tizimga kirishingiz lozim.
                      </p>
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-12">
                        <button
                          onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
                          className="group relative flex items-center gap-6 px-12 py-6 sm:px-16 sm:py-7 bg-navy dark:bg-dark-card rounded-full overflow-hidden transition-all duration-500 hover:shadow-[0_12px_40px_-5px_rgba(212,175,55,0.4)] border border-navy/20 dark:border-white/10 active:scale-95 shadow-3xl w-full sm:w-fit"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-gold/0 via-gold/20 to-gold/0 translate-x-[-100%] group-hover:animate-shimmer"></div>
                          <UserIcon size={24} className="text-gold group-hover:scale-110 transition-transform duration-500" />
                          <span className="text-base font-bold uppercase tracking-[0.4em] text-white group-hover:text-gold transition-colors duration-500">
                            {t('auth.login') || "Kirish"}
                          </span>
                        </button>
                        <Link to="/" className="text-sm font-bold uppercase tracking-[0.3em] text-navy/30 dark:text-gold/30 hover:text-gold transition-all duration-500 hover:translate-x-2 py-4">
                          Bosh sahifaga qaytish →
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="font-sans text-navy/80 dark:text-gray-300 leading-[1.8] sm:leading-[2.4] text-lg sm:text-2xl space-y-10 sm:space-y-16 font-light">
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

                    <div className="lg:hidden mt-12 pt-8 border-t border-gray-100 dark:border-white/5 flex items-center justify-center gap-6">
                      <button onClick={handleShare} className="flex items-center gap-2 px-6 py-3 rounded-full bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-300">
                        <Share2 size={18} />
                        <span className="text-sm font-medium">{isCopied ? t('article.copied') : t('article.share')}</span>
                      </button>
                      <button onClick={handleSave} className={`flex items-center gap-2 px-6 py-3 rounded-full ${isSaved ? 'bg-gold/10 text-gold' : 'bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-300'}`}>
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
      </article>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          window.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, window.location.origin);
          setShowAuthModal(false);
        }}
        initialMode={authMode}
      />
    </PageWrapper>
  );
};
