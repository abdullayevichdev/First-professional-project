import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, Youtube, BookOpen, MessageSquare, Lock } from 'lucide-react';
import { ContentItem, User } from '../types';
import { PageWrapper } from '../components/PageWrapper';
import { db, collection, query, orderBy, onSnapshot } from '../lib/firebase';

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
    if (!db) {
      setError("Firebase setup is incomplete.");
      setLoading(false);
      return;
    }

    // Set up real-time listener for content
    const contentRef = collection(db, 'content');
    const q = query(contentRef, orderBy('created_at', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: ContentItem[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        items.push({
          id: doc.id,
          ...data,
          // Ensure created_at is a string ISO date for the UI
          created_at: data.created_at?.toDate ? data.created_at.toDate().toISOString() : data.created_at || new Date().toISOString()
        } as ContentItem);
      });
      setContent(items);
      setLoading(false);
      setError(null);
    }, (err) => {
      console.error("Content snapshot error:", err);
      // If snapshot fails, it might be permissions or setup
      setError("Ma'lumotlarni real-vaqtda yuklashda xatolik yuz berdi.");
      setLoading(false);
    });

    return () => unsubscribe();
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
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => window.location.reload()}
              className="bg-gold text-navy px-6 py-2 rounded font-bold hover:bg-gold/80 transition-colors"
            >
              Qayta urinish
            </button>
            <a 
              href="/api/debug-firebase" 
              target="_blank" 
              className="text-xs underline opacity-50 hover:opacity-100"
            >
              Server Debug Ma'lumotlarini ko'rish
            </a>
          </div>
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
      <Helmet>
        <title>Tahqiq - Siyosiy Tahlil va Tadqiqotlar Markazi</title>
        <meta name="description" content="O'zbekiston va jahon siyosati, nutq tahlili va strategik tadqiqotlar bo'yicha professional tahliliy portal." />
        <meta property="og:title" content="Tahqiq - Siyosiy Tahlil va Tadqiqotlar Markazi" />
        <meta property="og:description" content="O'zbekiston va jahon siyosati, nutq tahlili va strategik tadqiqotlar bo'yicha professional tahliliy portal." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      {/* Hero Section */}
      <section className="bg-white dark:bg-dark-card border-b border-navy/5 dark:border-gold/5 transition-colors duration-500 overflow-hidden">
        <div className="news-container py-6 sm:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-14">
            {/* Main Spotlight */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="lg:col-span-8 group"
            >
              {featuredContent && (
                <Link to={`/article/${featuredContent.id}`} className="block">
                  <div className="relative aspect-[16/10] sm:aspect-[16/9] overflow-hidden mb-6 sm:mb-10 article-card shadow-2xl rounded-lg">
                    <img 
                      src={featuredContent.image_url || `https://picsum.photos/seed/${featuredContent.id}/1200/800`} 
                      alt={getTitle(featuredContent)} 
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-[2000ms] ease-out"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/60 to-transparent opacity-90"></div>
                    <div className="absolute inset-0 p-6 sm:p-10 lg:p-14 flex flex-col justify-end">
                      <motion.span 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="inline-block bg-gold text-navy px-3 py-1.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.3em] mb-4 shadow-2xl rounded-sm w-fit"
                      >
                        {t('common.featured_analysis')}
                      </motion.span>
                      <h2 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-black text-white leading-[1.1] mb-6 group-hover:text-gold transition-colors duration-500 max-w-4xl line-clamp-3">
                        {getTitle(featuredContent)}
                      </h2>
                      <div className="flex items-center space-x-4 text-white/50 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em]">
                        <span className="text-white/80">{featuredContent.author}</span>
                        <span className="w-1.5 h-1.5 bg-gold rounded-full"></span>
                        <span>{new Date(featuredContent.created_at).toLocaleDateString(i18n.language === 'uz' ? 'uz-UZ' : i18n.language === 'ru' ? 'ru-RU' : 'en-US', { month: 'long', year: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-lg sm:text-2xl text-navy/70 dark:text-gray-300 font-serif italic leading-relaxed line-clamp-3 border-l-4 border-gold pl-8 sm:pl-12 py-2">
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
      <main className="news-container py-6 sm:py-12 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12">
          {/* Left Column: Uzbekistan & Global */}
          <div className="lg:col-span-8 space-y-10 sm:space-y-20">
            {/* Uzbekistan Section */}
            <section>
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-navy/5 dark:border-gold/10 pb-5 mb-8 sm:mb-12 gap-4">
                <div className="relative">
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-serif font-black text-navy dark:text-white uppercase leading-tight tracking-tight">
                    {t('nav.uzb_politics')}
                  </h2>
                  <div className="absolute -bottom-1 left-0 w-12 h-1 bg-gold"></div>
                </div>
                <Link to="/category/uzbekistan" className="group flex items-center space-x-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gold hover:text-navy dark:hover:text-white transition-all duration-300">
                  <span>{t('common.view_archive')}</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
                {uzbPolitics.map((item, idx) => (
                  <motion.article 
                    key={item.id}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ delay: idx * 0.1 }}
                    className="group"
                  >
                    <Link to={`/article/${item.id}`} className="block">
                      <div className="aspect-[16/10] overflow-hidden mb-5 sm:mb-6 article-card shadow-sm group-hover:shadow-xl transition-all duration-500 rounded-sm">
                        <img 
                          src={item.image_url || `https://picsum.photos/seed/${item.id}/600/400`} 
                          alt={getTitle(item)} 
                          className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-1000 ease-out" 
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <h3 className="text-lg sm:text-xl font-serif font-bold text-navy dark:text-white mb-3 group-hover:text-gold transition-colors leading-tight">
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
            <section className="bg-white dark:bg-dark-card p-5 sm:p-10 lg:p-12 article-card border border-navy/5 dark:border-gold/10 shadow-2xl text-navy dark:text-white relative overflow-hidden group">
              {/* Decorative background element */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full -mr-16 -mt-16 transition-transform duration-700 group-hover:scale-150"></div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 sm:gap-14 items-center relative z-10">
                <div className="flex flex-col justify-center items-start">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-[1px] bg-gold"></div>
                    <span className="text-[9px] font-bold text-gold uppercase tracking-[0.4em]">{t('common.multimedia')}</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black mb-4 sm:mb-6 leading-tight max-w-md">
                    {t('common.decoding_speeches')}
                  </h2>
                  <p className="text-navy/60 dark:text-white/60 text-sm sm:text-base font-light leading-relaxed mb-8 max-w-sm">
                    {t('common.decoding_desc')}
                  </p>
                  <a 
                    href="https://youtube.com/@TAHQIQ_OFFICIAL" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="btn-premium py-3 px-7 sm:py-3.5 sm:px-9 text-[10px] w-fit flex items-center justify-center -ml-1 sm:-ml-2 group/btn relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></div>
                    <Youtube size={16} className="mr-3 relative z-10" />
                    <span className="relative z-10">{t('common.watch_analysis')}</span>
                  </a>
                </div>
                <a href="https://youtube.com/@TAHQIQ_OFFICIAL" target="_blank" rel="noreferrer" className="relative aspect-video rounded-lg overflow-hidden group/vid block shadow-2xl-gold">
                  <img 
                    src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=800&h=450" 
                    alt="Video" 
                    className="w-full h-full object-cover group-hover/vid:scale-110 transition-transform duration-1000 opacity-95 dark:opacity-80" 
                    referrerPolicy="no-referrer" 
                  />
                  <div className="absolute inset-0 bg-navy/20 group-hover/vid:bg-navy/0 transition-colors duration-500"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gold/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl group-hover/vid:scale-110 group-hover/vid:bg-gold transition-all duration-300">
                      <div className="relative">
                        <Youtube size={32} className="text-white dark:text-navy ml-1" />
                        <div className="absolute -inset-4 bg-white/20 rounded-full animate-ping opacity-0 group-hover/vid:opacity-100"></div>
                      </div>
                    </div>
                  </div>
                </a>
              </div>
            </section>

            {/* Global Section */}
            <section>
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-navy/5 dark:border-gold/10 pb-5 mb-8 sm:mb-12 gap-4">
                <div className="relative">
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-serif font-black text-navy dark:text-white uppercase leading-tight tracking-tight">
                    {t('nav.global_politics')}
                  </h2>
                  <div className="absolute -bottom-1 left-0 w-12 h-1 bg-gold"></div>
                </div>
                <Link to="/category/global" className="group flex items-center space-x-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gold hover:text-navy dark:hover:text-white transition-all duration-300">
                  <span>{t('common.view_archive')}</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
              <div className="space-y-6 sm:space-y-10">
                {globalPolitics.map((item, idx) => (
                  <motion.article 
                    key={item.id}
                    initial={{ opacity: 0, x: -15 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    className="group"
                  >
                    <Link to={`/article/${item.id}`} className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-8 items-center border-b border-navy/5 dark:border-white/5 pb-6 sm:pb-10 last:border-0 last:pb-0">
                      <div className="md:col-span-5 aspect-video overflow-hidden rounded-sm shadow-sm">
                        <img 
                          src={item.image_url || `https://picsum.photos/seed/${item.id}/600/400`} 
                          alt={getTitle(item)} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="md:col-span-7">
                        <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-gold mb-2 block">{t('common.international_relations')}</span>
                        <h3 className="text-lg sm:text-xl font-serif font-bold text-navy dark:text-white mb-2 sm:mb-3 group-hover:text-gold transition-colors leading-tight">
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
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-navy/5 dark:border-gold/10 pb-5 mb-8 sm:mb-12 gap-4">
                <div className="relative">
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-serif font-black text-navy dark:text-white uppercase leading-tight tracking-tight">
                    {t('common.historical_context')}
                  </h2>
                  <div className="absolute -bottom-1 left-0 w-12 h-1 bg-gold"></div>
                </div>
                <Link to="/category/historical" className="group flex items-center space-x-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gold hover:text-navy dark:hover:text-white transition-all duration-300">
                  <span>{t('common.view_archive')}</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 sm:gap-10">
                {historicalAnalysis.map((item, idx) => (
                  <motion.article 
                    key={item.id}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ delay: idx * 0.1 }}
                    className="group"
                  >
                    <Link to={`/article/${item.id}`}>
                      <div className="aspect-square overflow-hidden mb-3 sm:mb-5 rounded-sm shadow-md group-hover:shadow-xl transition-all duration-500">
                        <img 
                          src={item.image_url || `https://picsum.photos/seed/${item.id}/400/400`} 
                          alt={getTitle(item)} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <h3 className="text-sm sm:text-base font-serif font-bold text-navy dark:text-white mb-2 group-hover:text-gold transition-colors leading-tight line-clamp-2 uppercase tracking-tight text-center">
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
    </PageWrapper>
  );
};
