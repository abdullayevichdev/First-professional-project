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
    return item.title_en || item.title_uz || item.title_ru || '';
  };

  const getExcerpt = (item: ContentItem) => {
    return item.excerpt_en || item.excerpt_uz || item.excerpt_ru || '';
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
  const latestAnalysis = content.filter(i => i.id !== featuredContent?.id).slice(0, 4);
  const uzbPolitics = content.filter(i => i.category === 'uzbekistan' && i.id !== featuredContent?.id);
  const globalPolitics = content.filter(i => i.category === 'global' && i.id !== featuredContent?.id);
  const speechAnalysis = content.filter(i => i.category === 'speech' && i.id !== featuredContent?.id);
  const historicalAnalysis = content.filter(i => i.category === 'historical' && i.id !== featuredContent?.id);
  const opinionAnalysis = content.filter(i => i.category === 'opinion' && i.id !== featuredContent?.id);

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
              className="lg:col-span-12 group"
            >
              {featuredContent && (
                <Link to={`/article/${featuredContent.id}`} className="block">
                  <div className="relative aspect-[4/3] sm:aspect-[16/9] overflow-hidden mb-6 sm:mb-10 article-card shadow-2xl rounded-lg">
                    <img 
                      src={featuredContent.image_url || `https://picsum.photos/seed/${featuredContent.id}/1200/800`} 
                      alt={getTitle(featuredContent)} 
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-[2000ms] ease-out"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/60 to-transparent opacity-90"></div>
                    <div className="absolute inset-0 p-5 sm:p-10 lg:p-14 flex flex-col justify-end">
                      <motion.span 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="inline-block bg-gold text-navy px-3 py-1.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.3em] mb-3 sm:mb-4 shadow-2xl rounded-sm w-fit"
                      >
                        {t('common.featured_analysis')}
                      </motion.span>
                      <h2 className="text-xl sm:text-4xl lg:text-5xl font-serif font-black text-white leading-[1.1] mb-4 sm:mb-6 group-hover:text-gold transition-colors duration-500 max-w-4xl line-clamp-3">
                        {getTitle(featuredContent)}
                      </h2>
                      <div className="flex items-center space-x-3 sm:space-x-4 text-white/50 text-[9px] sm:text-[11px] font-bold uppercase tracking-[0.2em]">
                        <span className="text-white/80">{featuredContent.author}</span>
                        <span className="w-1.5 h-1.5 bg-gold rounded-full"></span>
                        <span>{new Date(featuredContent.created_at).toLocaleDateString(i18n.language === 'uz' ? 'uz-UZ' : i18n.language === 'ru' ? 'ru-RU' : 'en-US', { month: 'long', year: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm sm:text-2xl text-navy/70 dark:text-gray-300 font-serif italic leading-relaxed line-clamp-3 border-l-4 border-gold pl-4 sm:pl-12 py-2">
                    {getExcerpt(featuredContent)}
                  </p>
                </Link>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content Sections */}
      <main className="news-container py-4 sm:py-8 overflow-hidden">
        <div className="space-y-12 sm:space-y-16">
          
          {/* Uzbekistan Section - Full Width Grid */}
          {uzbPolitics.length > 0 && (
            <section>
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-navy/5 dark:border-gold/10 pb-4 mb-6 sm:mb-8 gap-3">
                <div className="relative">
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-serif font-black text-navy dark:text-white uppercase leading-tight tracking-tight">
                    {t('nav.uzb_politics')}
                  </h2>
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: 48 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="absolute -bottom-1 left-0 h-1 bg-gold"
                  ></motion.div>
                </div>
                <Link to="/category/uzbekistan" className="group flex items-center space-x-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gold hover:text-navy dark:hover:text-white transition-all duration-300">
                  <span>{t('common.view_archive')}</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
              {uzbPolitics.length === 1 ? (
                <motion.article 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="group bg-white dark:bg-dark-card p-5 sm:p-6 md:p-8 rounded-2xl border border-navy/5 dark:border-white/5 shadow-md hover:shadow-2xl hover:shadow-gold/5 transition-all duration-300 max-w-5xl mx-auto"
                >
                  <Link to={`/article/${uzbPolitics[0].id}`} className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-center">
                    <div className="md:col-span-5 aspect-[16/10] sm:aspect-video overflow-hidden article-card shadow-md rounded-xl">
                      <img 
                        src={uzbPolitics[0].image_url || `https://picsum.photos/seed/${uzbPolitics[0].id}/800/500`} 
                        alt={getTitle(uzbPolitics[0])} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1.5s] ease-out" 
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="md:col-span-7 flex flex-col justify-between h-full py-1 text-left">
                      <div>
                        <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.2em] text-gold mb-2 block">{t('common.featured_analysis')}</span>
                        <h3 className="text-lg sm:text-2xl font-serif font-bold text-navy dark:text-white mb-3 group-hover:text-gold transition-colors leading-tight">
                          {getTitle(uzbPolitics[0])}
                        </h3>
                        <p className="text-xs sm:text-sm text-navy/65 dark:text-gray-400 leading-relaxed font-light mb-5">
                          {getExcerpt(uzbPolitics[0])}
                        </p>
                      </div>
                      <div className="text-[10px] font-bold text-gold group-hover:translate-x-1 transition-transform flex items-center space-x-1.5 mt-auto uppercase tracking-wider">
                        <span>{t('common.read_more')}</span>
                        <span>→</span>
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ) : (
                <div className={`grid grid-cols-1 ${uzbPolitics.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-6 sm:gap-8`}>
                  {uzbPolitics.map((item, idx) => (
                    <motion.article 
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      whileHover={{ y: -6, transition: { duration: 0.2 } }}
                      transition={{ delay: idx * 0.08, duration: 0.5 }}
                      className="group bg-white dark:bg-dark-card p-4 rounded-xl border border-navy/5 dark:border-white/5 shadow-sm hover:shadow-xl hover:shadow-gold/5 transition-all duration-300"
                    >
                      <Link to={`/article/${item.id}`} className="block h-full flex flex-col justify-between">
                        <div>
                          <div className="aspect-[16/10] overflow-hidden mb-4 article-card shadow-sm rounded-lg">
                            <img 
                              src={item.image_url || `https://picsum.photos/seed/${item.id}/600/400`} 
                              alt={getTitle(item)} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1.5s] ease-out" 
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <h3 className="text-base sm:text-lg font-serif font-bold text-navy dark:text-white mb-2.5 group-hover:text-gold transition-colors leading-tight">
                            {getTitle(item)}
                          </h3>
                          <p className="text-xs text-navy/65 dark:text-gray-400 leading-relaxed line-clamp-3 font-light mb-4">
                            {getExcerpt(item)}
                          </p>
                        </div>
                        <div className="text-[10px] font-bold text-gold/80 group-hover:text-gold flex items-center space-x-1.5 mt-auto uppercase tracking-wider">
                          <span>{t('common.read_more')}</span>
                          <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </div>
                      </Link>
                    </motion.article>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Featured Video Section */}
          <section className="bg-white dark:bg-dark-card p-4 sm:p-8 lg:p-10 rounded-2xl border border-navy/5 dark:border-gold/10 shadow-2xl text-navy dark:text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full -mr-16 -mt-16 transition-transform duration-[1.5s] group-hover:scale-[2]"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 sm:gap-10 items-center relative z-10">
              <div className="md:col-span-5 flex flex-col justify-center items-start">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-[1px] bg-gold"></div>
                  <span className="text-[9px] font-bold text-gold uppercase tracking-[0.4em]">{t('common.multimedia')}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-serif font-black mb-4 leading-tight max-w-md">
                  {t('common.decoding_speeches')}
                </h2>
                <p className="text-navy/60 dark:text-white/60 text-xs sm:text-sm font-light leading-relaxed mb-6 max-w-sm">
                  {t('common.decoding_desc')}
                </p>
                <motion.a 
                  href="https://youtube.com/@TAHQIQ_OFFICIAL" 
                  target="_blank" 
                  rel="noreferrer" 
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-premium py-2.5 px-6 text-[10px] w-fit flex items-center justify-center group/btn relative overflow-hidden shadow-lg"
                >
                  <Youtube size={16} className="mr-2 relative z-10" />
                  <span className="relative z-10 font-bold uppercase tracking-wider">{t('common.watch_analysis')}</span>
                </motion.a>
              </div>
              
              <div className="md:col-span-7">
                <a href="https://youtube.com/@TAHQIQ_OFFICIAL" target="_blank" rel="noreferrer" className="relative aspect-video rounded-xl overflow-hidden group/vid block shadow-2xl">
                  <img 
                    src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=800&h=450" 
                    alt="Video Preview" 
                    className="w-full h-full object-cover group-hover/vid:scale-[1.03] transition-transform duration-[2s] opacity-95 dark:opacity-80" 
                    referrerPolicy="no-referrer" 
                  />
                  <div className="absolute inset-0 bg-navy/20 group-hover/vid:bg-navy/0 transition-colors duration-500"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div 
                      whileHover={{ scale: 1.15 }}
                      transition={{ type: "spring", stiffness: 300, damping: 15 }}
                      className="w-14 h-14 sm:w-16 sm:h-16 bg-gold/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl group-hover/vid:bg-gold transition-colors"
                    >
                      <Youtube size={26} className="text-white dark:text-navy ml-1" />
                    </motion.div>
                  </div>
                </a>
              </div>
            </div>
          </section>

          {/* Global Section - Full Width 2-Column Grid */}
          {globalPolitics.length > 0 && (
            <section>
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-navy/5 dark:border-gold/10 pb-4 mb-6 sm:mb-8 gap-3">
                <div className="relative">
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-serif font-black text-navy dark:text-white uppercase leading-tight tracking-tight">
                    {t('nav.global_politics')}
                  </h2>
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: 48 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="absolute -bottom-1 left-0 h-1 bg-gold"
                  ></motion.div>
                </div>
                <Link to="/category/global" className="group flex items-center space-x-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gold hover:text-navy dark:hover:text-white transition-all duration-300">
                  <span>{t('common.view_archive')}</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
              
              {globalPolitics.length === 1 ? (
                <motion.article 
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="group bg-white dark:bg-dark-card p-5 sm:p-6 md:p-8 rounded-2xl border border-navy/5 dark:border-white/5 shadow-md hover:shadow-2xl hover:shadow-gold/5 transition-all duration-300 max-w-5xl mx-auto"
                >
                  <Link to={`/article/${globalPolitics[0].id}`} className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-center h-full">
                    <div className="md:col-span-5 aspect-[16/10] sm:aspect-video overflow-hidden rounded-xl shadow-md">
                      <img 
                        src={globalPolitics[0].image_url || `https://picsum.photos/seed/${globalPolitics[0].id}/800/500`} 
                        alt={getTitle(globalPolitics[0])} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" 
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="md:col-span-7 flex flex-col justify-between h-full py-1 text-left">
                      <div>
                        <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-gold mb-2 block">{t('common.international_relations')}</span>
                        <h3 className="text-lg sm:text-2xl font-serif font-bold text-navy dark:text-white mb-3 group-hover:text-gold transition-colors leading-tight">
                          {getTitle(globalPolitics[0])}
                        </h3>
                        <p className="text-xs sm:text-sm text-navy/60 dark:text-gray-400 leading-relaxed font-light mb-5">
                          {getExcerpt(globalPolitics[0])}
                        </p>
                      </div>
                      <div className="text-[10px] font-bold text-gold group-hover:translate-x-1 transition-transform flex items-center space-x-1.5 mt-auto uppercase tracking-wider">
                        <span>{t('common.read_more')}</span>
                        <span>→</span>
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                  {globalPolitics.map((item, idx) => (
                    <motion.article 
                      key={item.id}
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      whileHover={{ y: -4, transition: { duration: 0.2 } }}
                      className="group bg-white dark:bg-dark-card p-4 rounded-xl border border-navy/5 dark:border-white/5 shadow-sm hover:shadow-lg transition-all"
                    >
                      <Link to={`/article/${item.id}`} className="block h-full flex flex-col justify-between">
                        <div>
                          <div className="aspect-[16/10] overflow-hidden mb-4 article-card shadow-sm rounded-lg">
                            <img 
                              src={item.image_url || `https://picsum.photos/seed/${item.id}/600/400`} 
                              alt={getTitle(item)} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" 
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-gold mb-1.5 block">{t('common.international_relations')}</span>
                          <h3 className="text-base sm:text-lg font-serif font-bold text-navy dark:text-white mb-2 group-hover:text-gold transition-colors leading-tight line-clamp-2">
                            {getTitle(item)}
                          </h3>
                          <p className="text-xs text-navy/60 dark:text-gray-400 leading-relaxed line-clamp-3 font-light mb-4">
                            {getExcerpt(item)}
                          </p>
                        </div>
                        <div className="text-[10px] font-bold text-gold/80 group-hover:text-gold flex items-center space-x-1.5 mt-auto uppercase tracking-wider">
                          <span>{t('common.read_more')}</span>
                          <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </div>
                      </Link>
                    </motion.article>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Historical Context Section - Compact Horizonal Blocks */}
          {historicalAnalysis.length > 0 && (
            <section>
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-navy/5 dark:border-gold/10 pb-4 mb-6 sm:mb-8 gap-3">
                <div className="relative">
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-serif font-black text-navy dark:text-white uppercase leading-tight tracking-tight">
                    {t('common.historical_context')}
                  </h2>
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: 48 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="absolute -bottom-1 left-0 h-1 bg-gold"
                  ></motion.div>
                </div>
                <Link to="/category/historical" className="group flex items-center space-x-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gold hover:text-navy dark:hover:text-white transition-all duration-300">
                  <span>{t('common.view_archive')}</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
              
              {historicalAnalysis.length === 1 ? (
                <motion.article 
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="group bg-white dark:bg-dark-card p-5 sm:p-6 md:p-8 rounded-2xl border border-navy/5 dark:border-white/5 shadow-md hover:shadow-2xl hover:shadow-gold/5 transition-all duration-300 max-w-5xl mx-auto"
                >
                  <Link to={`/article/${historicalAnalysis[0].id}`} className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-center h-full">
                    <div className="md:col-span-5 aspect-[16/10] sm:aspect-video overflow-hidden rounded-xl shadow-md">
                      <img 
                        src={historicalAnalysis[0].image_url || `https://picsum.photos/seed/${historicalAnalysis[0].id}/800/500`} 
                        alt={getTitle(historicalAnalysis[0])} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" 
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="md:col-span-7 flex flex-col justify-between h-full py-1 text-left">
                      <div>
                        <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.2em] text-gold mb-2 block">{t('common.historical_context')}</span>
                        <h3 className="text-lg sm:text-2xl font-serif font-bold text-navy dark:text-white mb-3 group-hover:text-gold transition-colors leading-tight">
                          {getTitle(historicalAnalysis[0])}
                        </h3>
                        <p className="text-xs sm:text-sm text-navy/65 dark:text-gray-400 leading-relaxed font-light mb-5">
                          {getExcerpt(historicalAnalysis[0])}
                        </p>
                      </div>
                      <div className="text-[10px] font-bold text-gold group-hover:translate-x-1 transition-transform flex items-center space-x-1.5 mt-auto uppercase tracking-wider">
                        <span>{t('common.read_more')}</span>
                        <span>→</span>
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ) : (
                <div className={`grid grid-cols-2 ${historicalAnalysis.length === 2 ? 'sm:grid-cols-2 max-w-xl mx-auto' : historicalAnalysis.length === 3 ? 'sm:grid-cols-3 max-w-4xl mx-auto' : 'sm:grid-cols-4'} gap-4 sm:gap-6`}>
                  {historicalAnalysis.map((item, idx) => (
                    <motion.article 
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      whileHover={{ y: -5, transition: { duration: 0.2 } }}
                      transition={{ delay: idx * 0.05 }}
                      className="group bg-white dark:bg-dark-card p-3 rounded-lg border border-navy/5 dark:border-white/5 shadow-sm text-center"
                    >
                      <Link to={`/article/${item.id}`} className="block">
                        <div className="aspect-square overflow-hidden mb-3.5 rounded-md shadow-sm">
                          <img 
                            src={item.image_url || `https://picsum.photos/seed/${item.id}/400/400`} 
                            alt={getTitle(item)} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <h3 className="text-xs sm:text-sm font-serif font-bold text-navy dark:text-white mb-1 group-hover:text-gold transition-colors leading-tight line-clamp-2 uppercase tracking-tight">
                          {getTitle(item)}
                        </h3>
                      </Link>
                    </motion.article>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Strategic Insights Section */}
          <section className="border-t border-navy/5 dark:border-gold/10 pt-8 sm:pt-12">
            <div className="relative mb-6 sm:mb-8">
              <h2 className="section-title">{t('common.strategic_insights')}</h2>
              <motion.div 
                initial={{ width: 0 }}
                whileInView={{ width: 48 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="absolute -bottom-1 left-0 h-1 bg-gold"
              ></motion.div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              <motion.div 
                whileHover={{ y: -6 }}
                transition={{ duration: 0.2 }}
                className="p-5 sm:p-6 bg-white dark:bg-dark-card border-l-4 border-gold shadow-md hover:shadow-xl transition-all duration-300 rounded-r-lg"
              >
                <h4 className="text-base sm:text-lg font-serif font-bold mb-2.5 text-navy dark:text-white">{t('common.future_integration')}</h4>
                <p className="text-xs text-navy/60 dark:text-gray-400 leading-relaxed font-light mb-4">
                  {t('common.future_integration_desc')}
                </p>
                <Link to="/category/uzbekistan" className="text-gold text-[9px] font-bold uppercase tracking-widest inline-block hover:underline">{t('common.read_more')} →</Link>
              </motion.div>
              
              <motion.div 
                whileHover={{ y: -6 }}
                transition={{ duration: 0.2 }}
                className="p-5 sm:p-6 bg-white dark:bg-dark-card border-l-4 border-navy dark:border-white shadow-md hover:shadow-xl transition-all duration-300 rounded-r-lg"
              >
                <h4 className="text-base sm:text-lg font-serif font-bold mb-2.5 text-navy dark:text-white">{t('common.digital_sovereignty')}</h4>
                <p className="text-xs text-navy/60 dark:text-gray-400 leading-relaxed font-light mb-4">
                  {t('common.digital_sovereignty_desc')}
                </p>
                <Link to="/category/global" className="text-gold text-[9px] font-bold uppercase tracking-widest inline-block hover:underline">{t('common.read_more')} →</Link>
              </motion.div>

              <motion.div 
                whileHover={{ y: -6 }}
                transition={{ duration: 0.2 }}
                className="bg-white dark:bg-dark-card p-5 sm:p-6 rounded-lg flex flex-col justify-between text-navy dark:text-white border border-navy/5 dark:border-gold/10 shadow-md hover:shadow-xl transition-all duration-300"
              >
                <div>
                  <MessageSquare size={24} className="text-gold mb-3" />
                  <h3 className="text-base sm:text-lg font-serif font-bold mb-2">{t('common.join_discussion')}</h3>
                  <p className="text-navy/65 dark:text-white/60 text-xs font-light leading-relaxed mb-4">
                    {t('common.community_desc')}
                  </p>
                </div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link to="/contact" className="btn-premium py-2 w-full inline-block text-center text-[10px] font-bold tracking-wider">{t('common.become_member')}</Link>
                </motion.div>
              </motion.div>
            </div>
          </section>

          {/* Trending Today horizontal strip at the bottom */}
          <section className="bg-navy !text-white dark:bg-dark-card p-6 rounded-2xl border border-navy/10 dark:border-gold/10 shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full -mr-16 -mt-16 duration-1000 group-hover:scale-150"></div>
            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-[1px] bg-gold"></div>
                <span className="text-[9px] font-bold text-gold uppercase tracking-[0.4em]">{t('common.trending')}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((num) => (
                  <motion.div 
                    key={num} 
                    whileHover={{ x: 4 }}
                    className="flex space-x-4 items-start group/trend cursor-pointer"
                  >
                    <span className="text-3xl font-serif font-black text-gold/30 group-hover/trend:text-gold transition-colors leading-none">0{num}</span>
                    <Link to={`/article/art-${num}`} className="block">
                      <p className="text-xs font-serif italic text-white/80 group-hover/trend:text-gold transition-all duration-300 leading-relaxed mb-1">
                        "{t('common.trending_1')}"
                      </p>
                      <span className="text-[9px] text-white/40 tracking-widest border-b border-white/5 pb-0.5 uppercase">Tahlil • 0{num}</span>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

        </div>
      </main>
    </PageWrapper>
  );
};
