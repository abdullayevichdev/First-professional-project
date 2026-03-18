import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Youtube, BookOpen, MessageSquare, Lock } from 'lucide-react';
import { ContentItem, User } from '../types';
import { PageWrapper } from '../components/PageWrapper';

interface HomeProps {
  user: User | null;
}

export const Home: React.FC<HomeProps> = ({ user }) => {
  const { t, i18n } = useTranslation();
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      try {
        const res = await fetch('/api/content', { 
          credentials: 'include',
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setContent(data);
            if (data.length === 0) {
              console.warn("No content found in database");
            }
          }
        } else {
          setError(`Server error: ${res.status}`);
        }
      } catch (error: any) {
        if (error.name === 'AbortError') {
          setError("Ulanish vaqti tugadi (30s). Internetni tekshiring.");
        } else {
          console.error("Failed to fetch content:", error);
          setError("Ma'lumotlar bazasiga ulanib bo'lmadi.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getTitle = (item: ContentItem) => {
    if (i18n.language === 'en') return item.title_en;
    if (i18n.language === 'ru') return item.title_ru;
    return item.title_uz;
  };

  const getExcerpt = (item: ContentItem) => {
    if (i18n.language === 'en') return item.excerpt_en;
    if (i18n.language === 'ru') return item.excerpt_ru;
    return item.excerpt_uz;
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-navy"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div></div>;

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-navy text-white p-4">
        <div className="bg-red-500/20 border border-red-500 p-6 rounded-lg max-w-md text-center">
          <h2 className="text-xl font-bold mb-2">Ulanishda xatolik</h2>
          <p className="mb-4 opacity-80">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-gold text-navy px-6 py-2 rounded font-bold hover:bg-gold/80 transition-colors"
          >
            Qayta urinish
          </button>
        </div>
      </div>
    );
  }

  if (content.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-navy text-white p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Ma'lumot topilmadi</h2>
          <p className="opacity-60">Hozircha hech qanday maqola mavjud emas.</p>
        </div>
      </div>
    );
  }
  const featuredContent = content.find(i => i.id === 'art-1') || content[0];
  const latestAnalysis = content.filter(i => i.id !== 'art-1').slice(0, 4);
  const uzbPolitics = content.filter(i => i.category === 'uzbekistan');
  const globalPolitics = content.filter(i => i.category === 'global');
  const speechAnalysis = content.filter(i => i.category === 'speech');
  const historicalAnalysis = content.filter(i => i.category === 'historical');
  const opinionAnalysis = content.filter(i => i.category === 'opinion');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (res.ok) {
        setSubscribed(true);
        setEmail('');
        setTimeout(() => setSubscribed(false), 5000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <PageWrapper className="pb-24 transition-colors duration-500">
      {/* Hero Section */}
      <section className="bg-white dark:bg-dark-card border-b border-navy/5 dark:border-gold/5 transition-colors duration-500">
        <div className="news-container py-6 sm:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12">
            {/* Main Spotlight */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-8 group"
            >
              {featuredContent && (
                <Link to={`/article/${featuredContent.id}`} className="block">
                  <div className="relative aspect-[16/9] overflow-hidden mb-8 article-card shadow-2xl">
                    <img 
                      src={featuredContent.image_url || `https://picsum.photos/seed/${featuredContent.id}/1200/800`} 
                      alt={getTitle(featuredContent)} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (target.src.includes('unsplash.com')) {
                          target.src = `https://picsum.photos/seed/${featuredContent.id}/1200/800`;
                        } else {
                          target.src = `https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=1200&h=800`;
                        }
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/20 to-transparent opacity-60 dark:opacity-80"></div>
                    <div className="absolute bottom-0 left-0 p-6 sm:p-10 w-full">
                      <span className="inline-block bg-gold text-white dark:text-navy px-3 py-1 sm:px-4 sm:py-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] mb-3 sm:mb-4 shadow-lg">{t('common.featured_analysis')}</span>
                      <h2 className="text-2xl sm:text-4xl md:text-5xl font-serif font-bold text-white leading-tight mb-3 sm:mb-4 group-hover:text-gold transition-colors duration-500">
                        {getTitle(featuredContent)}
                      </h2>
                      <div className="flex items-center space-x-3 sm:space-x-4 text-white/60 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">
                        <span>{featuredContent.author}</span>
                        <span className="w-1 h-1 bg-gold rounded-full"></span>
                        <span>{new Date(featuredContent.created_at).toLocaleDateString(i18n.language === 'uz' ? 'uz-UZ' : i18n.language === 'ru' ? 'ru-RU' : 'en-US', { month: 'long', year: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xl text-navy/70 dark:text-gray-300 font-serif italic leading-relaxed line-clamp-2 border-l-4 border-gold pl-6">
                    {getExcerpt(featuredContent)}
                  </p>
                </Link>
              )}
            </motion.div>

            {/* Side Stories */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-4 space-y-8 sm:space-y-12"
            >
              <h3 className="section-title">{t('common.latest_updates')}</h3>
              <div className="space-y-6 sm:space-y-8">
                {latestAnalysis.map((item, idx) => (
                  <motion.div 
                    key={item.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + (idx * 0.1) }}
                  >
                    <Link to={`/article/${item.id}`} className="group flex space-x-4 sm:space-x-6 items-start">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 overflow-hidden article-card shadow-md">
                        <img 
                          src={item.image_url || `https://picsum.photos/seed/${item.id}/400/400`} 
                          alt={getTitle(item)} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            if (target.src.includes('unsplash.com')) {
                              target.src = `https://picsum.photos/seed/${item.id}/400/400`;
                            } else {
                              target.src = `https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=400&h=400`;
                            }
                          }}
                        />
                      </div>
                      <div className="flex-grow">
                        <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.2em] text-gold mb-1 block">{item.category}</span>
                        <h4 className="text-xs sm:text-sm font-serif font-bold text-navy dark:text-white group-hover:text-gold transition-colors leading-snug line-clamp-2">
                          {getTitle(item)}
                        </h4>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
              
              <div className="sidebar-card bg-white dark:bg-gold p-6 sm:p-10 text-navy dark:text-navy shadow-2xl relative overflow-hidden group border border-navy/10 dark:border-transparent">
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-gray-50 dark:bg-navy/5 rounded-full group-hover:scale-150 transition-transform duration-1000"></div>
                <h4 className="text-lg sm:text-xl font-serif font-bold mb-4 relative z-10">{t('common.weekly_brief')}</h4>
                <p className="text-[10px] sm:text-xs opacity-80 mb-6 sm:mb-8 leading-relaxed font-light relative z-10">{t('common.weekly_brief_desc')}</p>
                <form onSubmit={handleSubscribe} className="flex flex-col space-y-3 sm:space-y-4 relative z-10">
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('common.email_placeholder')} 
                    className="bg-white dark:bg-navy/10 border border-gray-200 dark:border-navy/20 px-4 py-3 sm:px-6 sm:py-4 text-[10px] sm:text-xs focus:outline-none focus:border-navy dark:focus:border-navy transition-colors placeholder:text-gray-400 dark:placeholder:text-navy/40 text-navy dark:text-navy" 
                  />
                  <button type="submit" className="bg-navy dark:bg-navy text-white dark:text-white py-3 sm:py-4 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-gold dark:hover:bg-navy/80 transition-all shadow-xl active:scale-95">
                    {subscribed ? t('common.subscribed') : t('common.subscribe')}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content Sections */}
      {user ? (
        <main className="news-container py-12 sm:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-16">
          {/* Left Column: Uzbekistan & Global */}
          <div className="lg:col-span-8 space-y-16 sm:space-y-32">
            {/* Uzbekistan Section */}
            <section>
              <div className="flex items-center justify-between mb-8 sm:mb-12">
                <h2 className="section-title flex-grow">{t('nav.uzb_politics')}</h2>
                <Link to="/category/uzbekistan" className="btn-secondary py-2 px-4 sm:px-6 text-[8px] sm:text-[9px] ml-4 sm:ml-8">{t('common.view_archive')}</Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-12">
                {uzbPolitics.map((item, idx) => (
                  <motion.article 
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ delay: idx * 0.1 }}
                    className="group"
                  >
                    <Link to={`/article/${item.id}`}>
                      <div className="aspect-video overflow-hidden mb-4 sm:mb-6 article-card shadow-lg">
                        <img 
                          src={item.image_url || `https://picsum.photos/seed/${item.id}/600/400`} 
                          alt={getTitle(item)} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            if (target.src.includes('unsplash.com')) {
                              target.src = `https://picsum.photos/seed/${item.id}/600/400`;
                            } else {
                              target.src = `https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=600&h=400`;
                            }
                          }}
                        />
                      </div>
                      <h3 className="text-lg sm:text-xl font-serif font-bold text-navy dark:text-white mb-3 sm:mb-4 group-hover:text-gold transition-colors leading-tight">
                        {getTitle(item)}
                      </h3>
                      <p className="text-xs sm:text-sm text-navy/60 dark:text-gray-400 leading-relaxed line-clamp-3 font-light">
                        {getExcerpt(item)}
                      </p>
                    </Link>
                  </motion.article>
                ))}
              </div>
            </section>

            {/* Featured Video Section */}
            <section className="bg-white dark:bg-dark-card p-6 sm:p-12 article-card border border-navy/10 dark:border-gold/20 shadow-2xl text-navy dark:text-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 items-center">
                <div>
                  <span className="text-[9px] sm:text-[10px] font-bold text-gold uppercase tracking-[0.4em] mb-4 sm:mb-6 block">{t('common.multimedia')}</span>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold mb-4 sm:mb-6">{t('common.decoding_speeches')}</h2>
                  <p className="text-navy/60 dark:text-white/60 text-xs sm:text-sm font-light leading-relaxed mb-6 sm:mb-10">
                    {t('common.decoding_desc')}
                  </p>
                  <a href="https://youtube.com/@TAHQIQ_OFFICIAL" target="_blank" rel="noreferrer" className="btn-premium inline-flex py-3 px-6 sm:py-4 sm:px-8">
                    <Youtube size={16} className="sm:w-[18px] sm:h-[18px]" />
                    <span>{t('common.watch_analysis')}</span>
                  </a>
                </div>
                <a href="https://youtube.com/@TAHQIQ_OFFICIAL" target="_blank" rel="noreferrer" className="relative aspect-video article-card overflow-hidden group block">
                  <img 
                    src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=800&h=450" 
                    alt="Video" 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 opacity-90 dark:opacity-60" 
                    referrerPolicy="no-referrer" 
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 bg-gold rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
                      <Youtube size={40} className="text-white dark:text-navy ml-1" />
                    </div>
                  </div>
                </a>
              </div>
            </section>

            {/* Global Section */}
            <section>
              <div className="flex items-center justify-between mb-8 sm:mb-12">
                <h2 className="section-title flex-grow">{t('nav.global_politics')}</h2>
                <Link to="/category/global" className="btn-secondary py-2 px-4 sm:px-6 text-[8px] sm:text-[9px] ml-4 sm:ml-8">{t('common.view_archive')}</Link>
              </div>
              <div className="space-y-8 sm:space-y-12">
                {globalPolitics.map((item, idx) => (
                  <motion.article 
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    className="group"
                  >
                    <Link to={`/article/${item.id}`} className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-10 items-center">
                      <div className="md:col-span-5 aspect-video overflow-hidden article-card shadow-lg">
                        <img 
                          src={item.image_url || `https://picsum.photos/seed/${item.id}/600/400`} 
                          alt={getTitle(item)} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            if (target.src.includes('unsplash.com')) {
                              target.src = `https://picsum.photos/seed/${item.id}/600/400`;
                            } else {
                              target.src = `https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=600&h=400`;
                            }
                          }}
                        />
                      </div>
                      <div className="md:col-span-7">
                        <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.2em] text-gold mb-2 sm:mb-3 block">{t('common.international_relations')}</span>
                        <h3 className="text-xl sm:text-2xl font-serif font-bold text-navy dark:text-white mb-3 sm:mb-4 group-hover:text-gold transition-colors leading-tight">
                          {getTitle(item)}
                        </h3>
                        <p className="text-xs sm:text-sm text-navy/60 dark:text-gray-400 leading-relaxed line-clamp-2 font-light">
                          {getExcerpt(item)}
                        </p>
                      </div>
                    </Link>
                  </motion.article>
                ))}
              </div>
            </section>

            {/* Historical Context Section */}
            <section>
              <div className="flex items-center justify-between mb-8 sm:mb-12">
                <h2 className="section-title flex-grow">{t('common.historical_context')}</h2>
                <Link to="/category/historical" className="btn-secondary py-2 px-4 sm:px-6 text-[8px] sm:text-[9px] ml-4 sm:ml-8">{t('common.view_archive')}</Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-8">
                {historicalAnalysis.map((item, idx) => (
                  <motion.article 
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ delay: idx * 0.1 }}
                    className="group"
                  >
                    <Link to={`/article/${item.id}`}>
                      <div className="aspect-square overflow-hidden mb-3 sm:mb-6 article-card shadow-md">
                        <img 
                          src={item.image_url || `https://picsum.photos/seed/${item.id}/400/400`} 
                          alt={getTitle(item)} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            if (target.src.includes('unsplash.com')) {
                              target.src = `https://picsum.photos/seed/${item.id}/400/400`;
                            } else {
                              target.src = `https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=400&h=400`;
                            }
                          }}
                        />
                      </div>
                      <h3 className="text-sm sm:text-lg font-serif font-bold text-navy dark:text-white mb-2 group-hover:text-gold transition-colors leading-tight line-clamp-2">
                        {getTitle(item)}
                      </h3>
                    </Link>
                  </motion.article>
                ))}
              </div>
            </section>

            {/* Strategic Insights Section - NEW */}
            <section className="border-t border-navy/10 dark:border-gold/10 pt-12 sm:pt-24">
              <div className="flex items-center justify-between mb-8 sm:mb-12">
                <h2 className="section-title flex-grow">{t('common.strategic_insights')}</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-16">
                <div className="space-y-6 sm:space-y-8">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="p-6 sm:p-8 bg-white dark:bg-dark-card border-l-4 border-gold shadow-lg article-card"
                  >
                    <h4 className="text-lg sm:text-xl font-serif font-bold mb-3 sm:mb-4">{t('common.future_integration')}</h4>
                    <p className="text-xs sm:text-sm text-navy/60 dark:text-gray-400 leading-relaxed font-light">
                      {t('common.future_integration_desc')}
                    </p>
                    <Link to="/article/art-3" className="text-gold text-[9px] sm:text-[10px] font-bold uppercase tracking-widest mt-4 sm:mt-6 inline-block hover:underline">{t('common.read_more')}</Link>
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, delay: 0.1 }}
                    className="p-6 sm:p-8 bg-white dark:bg-dark-card border-l-4 border-navy dark:border-white shadow-lg article-card"
                  >
                    <h4 className="text-lg sm:text-xl font-serif font-bold mb-3 sm:mb-4">{t('common.digital_sovereignty')}</h4>
                    <p className="text-xs sm:text-sm text-navy/60 dark:text-gray-400 leading-relaxed font-light">
                      {t('common.digital_sovereignty_desc')}
                    </p>
                    <Link to="/article/art-5" className="text-gold text-[9px] sm:text-[10px] font-bold uppercase tracking-widest mt-4 sm:mt-6 inline-block hover:underline">{t('common.read_more')}</Link>
                  </motion.div>
                </div>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-white dark:bg-dark-card p-8 sm:p-10 article-card flex flex-col justify-center text-navy dark:text-white border border-navy/10 dark:border-gold/20 shadow-lg"
                >
                  <MessageSquare size={28} className="text-gold mb-4 sm:mb-6 sm:w-[32px] sm:h-[32px]" />
                  <h3 className="text-xl sm:text-2xl font-serif font-bold mb-3 sm:mb-4">{t('common.join_discussion')}</h3>
                  <p className="text-navy/60 dark:text-white/60 text-xs sm:text-sm font-light leading-relaxed mb-6 sm:mb-8">
                    {t('common.community_desc')}
                  </p>
                  <Link to="/contact" className="btn-premium w-fit inline-block text-center">{t('common.become_member')}</Link>
                </motion.div>
              </div>
            </section>
          </div>

          {/* Right Column: Sidebar */}
          <aside className="lg:col-span-4 space-y-16">
            <div className="sidebar-card shadow-xl">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-navy/30 dark:text-gold/30 mb-8">{t('nav.opinion')}</h3>
              <div className="space-y-10">
                {opinionAnalysis.map((item, idx) => (
                  <motion.div 
                    key={item.id}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="border-b border-navy/5 dark:border-gold/5 pb-8 last:border-0 last:pb-0 group"
                  >
                    <Link to={`/article/${item.id}`}>
                      <h4 className="text-lg font-serif font-bold text-navy dark:text-white group-hover:text-gold transition-colors leading-snug mb-3 italic">
                        "{getTitle(item)}"
                      </h4>
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center text-[10px] font-bold text-gold">T</div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-navy/40 dark:text-gold/40">{t('common.editorial')}</span>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="sticky top-32">
              <div className="sidebar-card bg-white dark:bg-dark-bg border-2 border-gold/20 shadow-2xl">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold mb-8">{t('common.trending')}</h3>
                <div className="space-y-8">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <Link to={`/article/art-${num}`} key={num} className="flex space-x-6 items-start group cursor-pointer">
                      <span className="text-3xl font-serif font-black text-navy/5 dark:text-gold/10 group-hover:text-gold/20 transition-colors leading-none">0{num}</span>
                      <p className="text-xs font-bold text-navy dark:text-gray-300 group-hover:text-gold transition-colors leading-relaxed">
                        {t('common.trending_1')}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
              
              <div className="mt-12 flex justify-center">
                <Link to="/category/global" className="btn-premium w-full flex items-center justify-center">
                  <BookOpen size={14} />
                  <span>{t('common.explore_archives')}</span>
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </main>
      ) : (
        <div className="news-container py-24 text-center">
          <div className="max-w-2xl mx-auto bg-white dark:bg-dark-card p-12 article-card border border-navy/10 dark:border-gold/20 shadow-2xl">
            <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-8">
              <Lock size={32} className="text-gold" />
            </div>
            <h2 className="text-3xl font-serif font-bold mb-6 text-navy dark:text-white">
              {t('common.preview_mode')}
            </h2>
            <p className="text-navy/60 dark:text-gray-400 mb-10 text-sm font-light leading-relaxed">
              {t('auth.sign_in_desc')}
            </p>
          </div>
        </div>
      )}
    </PageWrapper>
  );
};
