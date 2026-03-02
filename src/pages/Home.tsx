import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, PlayCircle, BookOpen, MessageSquare } from 'lucide-react';
import { ContentItem } from '../types';

export const Home: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch('/api/content', { credentials: 'include' });
      const data: ContentItem[] = await res.json();
      setContent(data);
      setLoading(false);
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

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div></div>;

  const featured = content.find(i => i.id === 'art-1');
  const latestAnalysis = content.filter(i => i.id !== 'art-1').slice(0, 4);
  const uzbPolitics = content.filter(i => i.category === 'uzbekistan');
  const globalPolitics = content.filter(i => i.category === 'global');
  const speechAnalysis = content.filter(i => i.category === 'speech');
  const historicalAnalysis = content.filter(i => i.category === 'historical');
  const opinionAnalysis = content.filter(i => i.category === 'opinion');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <div className="pb-24 transition-colors duration-500">
      {/* Hero Section */}
      <section className="bg-white dark:bg-dark-card border-b border-navy/5 dark:border-gold/5 transition-colors duration-500">
        <div className="news-container py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Main Spotlight */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-8 group"
            >
              {featured && (
                <Link to={`/article/${featured.id}`} className="block">
                  <div className="relative aspect-[16/9] overflow-hidden mb-8 article-card shadow-2xl">
                    <img 
                      src={`https://picsum.photos/seed/${featured.id}/1200/800`} 
                      alt={getTitle(featured)} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/20 to-transparent opacity-60 dark:opacity-80"></div>
                    <div className="absolute bottom-0 left-0 p-10 w-full">
                      <span className="inline-block bg-gold text-white dark:text-navy px-4 py-1 text-[10px] font-bold uppercase tracking-[0.2em] mb-4 shadow-lg">Featured Analysis</span>
                      <h2 className="text-4xl md:text-5xl font-serif font-bold text-white leading-tight mb-4 group-hover:text-gold transition-colors duration-500">
                        {getTitle(featured)}
                      </h2>
                      <div className="flex items-center space-x-4 text-white/60 text-[10px] font-bold uppercase tracking-widest">
                        <span>{featured.author}</span>
                        <span className="w-1 h-1 bg-gold rounded-full"></span>
                        <span>{new Date(featured.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xl text-navy/70 dark:text-gray-300 font-serif italic leading-relaxed line-clamp-2 border-l-4 border-gold pl-6">
                    {getExcerpt(featured)}
                  </p>
                </Link>
              )}
            </motion.div>

            {/* Side Stories */}
            <div className="lg:col-span-4 space-y-12">
              <h3 className="section-title">Latest Updates</h3>
              <div className="space-y-8">
                {latestAnalysis.map((item, idx) => (
                  <motion.div 
                    key={item.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Link to={`/article/${item.id}`} className="group flex space-x-6 items-start">
                      <div className="w-20 h-20 flex-shrink-0 overflow-hidden article-card shadow-md">
                        <img src={`https://picsum.photos/seed/${item.id}/400/400`} alt={getTitle(item)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                      </div>
                      <div className="flex-grow">
                        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-gold mb-1 block">{item.category}</span>
                        <h4 className="text-sm font-serif font-bold text-navy dark:text-white group-hover:text-gold transition-colors leading-snug">
                          {getTitle(item)}
                        </h4>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
              
              <div className="sidebar-card bg-white dark:bg-gold p-10 text-navy dark:text-navy shadow-2xl relative overflow-hidden group border border-navy/10 dark:border-transparent">
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-gray-50 dark:bg-navy/5 rounded-full group-hover:scale-150 transition-transform duration-1000"></div>
                <h4 className="text-xl font-serif font-bold mb-4 relative z-10">The Weekly Brief</h4>
                <p className="text-xs opacity-80 mb-8 leading-relaxed font-light relative z-10">Get our most rigorous political analysis delivered to your inbox every Sunday morning.</p>
                <form onSubmit={handleSubscribe} className="flex flex-col space-y-4 relative z-10">
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email Address" 
                    className="bg-white dark:bg-navy/10 border border-gray-200 dark:border-navy/20 px-6 py-4 text-xs focus:outline-none focus:border-navy dark:focus:border-navy transition-colors placeholder:text-gray-400 dark:placeholder:text-navy/40 text-navy dark:text-navy" 
                  />
                  <button type="submit" className="bg-navy dark:bg-navy text-white dark:text-white py-4 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-gold dark:hover:bg-navy/80 transition-all shadow-xl active:scale-95">
                    {subscribed ? 'Subscribed!' : 'Subscribe'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Sections */}
      <main className="news-container py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Left Column: Uzbekistan & Global */}
          <div className="lg:col-span-8 space-y-32">
            {/* Uzbekistan Section */}
            <section>
              <div className="flex items-center justify-between mb-12">
                <h2 className="section-title flex-grow">Uzbekistan Politics</h2>
                <Link to="/category/uzbekistan" className="btn-secondary py-2 px-6 text-[9px] ml-8">View Archive</Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {uzbPolitics.map((item, idx) => (
                  <motion.article 
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="group"
                  >
                    <Link to={`/article/${item.id}`}>
                      <div className="aspect-video overflow-hidden mb-6 article-card shadow-lg">
                        <img src={`https://picsum.photos/seed/${item.id}/600/400`} alt={getTitle(item)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" referrerPolicy="no-referrer" />
                      </div>
                      <h3 className="text-xl font-serif font-bold text-navy dark:text-white mb-4 group-hover:text-gold transition-colors leading-tight">
                        {getTitle(item)}
                      </h3>
                      <p className="text-sm text-navy/60 dark:text-gray-400 leading-relaxed line-clamp-3 font-light">
                        {getExcerpt(item)}
                      </p>
                    </Link>
                  </motion.article>
                ))}
              </div>
            </section>

            {/* Featured Video Section */}
            <section className="bg-white dark:bg-dark-card p-12 article-card border border-navy/10 dark:border-gold/20 shadow-2xl text-navy dark:text-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div>
                  <span className="text-[10px] font-bold text-gold uppercase tracking-[0.4em] mb-6 block">Multimedia Insights</span>
                  <h2 className="text-3xl font-serif font-bold mb-6">Decoding Political Speeches</h2>
                  <p className="text-navy/60 dark:text-white/60 text-sm font-light leading-relaxed mb-10">
                    Watch our expert curators break down the hidden meanings and historical context behind recent major addresses.
                  </p>
                  <button className="btn-premium">
                    <PlayCircle size={18} />
                    <span>Watch Analysis</span>
                  </button>
                </div>
                <div className="relative aspect-video article-card overflow-hidden group">
                  <img src="https://picsum.photos/seed/video/800/450" alt="Video" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 opacity-90 dark:opacity-60" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 bg-gold rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
                      <PlayCircle size={40} className="text-white dark:text-navy ml-1" />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Global Section */}
            <section>
              <div className="flex items-center justify-between mb-12">
                <h2 className="section-title flex-grow">Global Perspectives</h2>
                <Link to="/category/global" className="btn-secondary py-2 px-6 text-[9px] ml-8">View Archive</Link>
              </div>
              <div className="space-y-12">
                {globalPolitics.map((item, idx) => (
                  <motion.article 
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="group"
                  >
                    <Link to={`/article/${item.id}`} className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
                      <div className="md:col-span-5 aspect-video overflow-hidden article-card shadow-lg">
                        <img src={`https://picsum.photos/seed/${item.id}/600/400`} alt={getTitle(item)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" referrerPolicy="no-referrer" />
                      </div>
                      <div className="md:col-span-7">
                        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-gold mb-3 block">International Relations</span>
                        <h3 className="text-2xl font-serif font-bold text-navy dark:text-white mb-4 group-hover:text-gold transition-colors leading-tight">
                          {getTitle(item)}
                        </h3>
                        <p className="text-sm text-navy/60 dark:text-gray-400 leading-relaxed line-clamp-2 font-light">
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
              <div className="flex items-center justify-between mb-12">
                <h2 className="section-title flex-grow">Historical Context</h2>
                <Link to="/category/historical" className="btn-secondary py-2 px-6 text-[9px] ml-8">View Archive</Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {historicalAnalysis.map((item, idx) => (
                  <motion.article 
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="group"
                  >
                    <Link to={`/article/${item.id}`}>
                      <div className="aspect-square overflow-hidden mb-6 article-card shadow-md">
                        <img src={`https://picsum.photos/seed/${item.id}/400/400`} alt={getTitle(item)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" referrerPolicy="no-referrer" />
                      </div>
                      <h3 className="text-lg font-serif font-bold text-navy dark:text-white mb-2 group-hover:text-gold transition-colors leading-tight">
                        {getTitle(item)}
                      </h3>
                    </Link>
                  </motion.article>
                ))}
              </div>
            </section>

            {/* Strategic Insights Section - NEW */}
            <section className="border-t border-navy/10 dark:border-gold/10 pt-24">
              <div className="flex items-center justify-between mb-12">
                <h2 className="section-title flex-grow">{t('common.strategic_insights')}</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                <div className="space-y-8">
                  <div className="p-8 bg-white dark:bg-dark-card border-l-4 border-gold shadow-lg article-card">
                    <h4 className="text-xl font-serif font-bold mb-4">The Future of Central Asian Integration</h4>
                    <p className="text-sm text-navy/60 dark:text-gray-400 leading-relaxed font-light">
                      An in-depth look at the economic and political factors driving the new era of cooperation between regional powers.
                    </p>
                    <Link to="/article/art-3" className="text-gold text-[10px] font-bold uppercase tracking-widest mt-6 inline-block hover:underline">{t('common.read_more')}</Link>
                  </div>
                  <div className="p-8 bg-white dark:bg-dark-card border-l-4 border-navy dark:border-white shadow-lg article-card">
                    <h4 className="text-xl font-serif font-bold mb-4">Digital Sovereignty in the 21st Century</h4>
                    <p className="text-sm text-navy/60 dark:text-gray-400 leading-relaxed font-light">
                      How nations are navigating the complexities of data privacy, AI ethics, and technological independence.
                    </p>
                    <Link to="/article/art-5" className="text-gold text-[10px] font-bold uppercase tracking-widest mt-6 inline-block hover:underline">{t('common.read_more')}</Link>
                  </div>
                </div>
                <div className="bg-white dark:bg-dark-card p-10 article-card flex flex-col justify-center text-navy dark:text-white border border-navy/10 dark:border-gold/20 shadow-lg">
                  <MessageSquare size={32} className="text-gold mb-6" />
                  <h3 className="text-2xl font-serif font-bold mb-4">{t('common.join_discussion')}</h3>
                  <p className="text-navy/60 dark:text-white/60 text-sm font-light leading-relaxed mb-8">
                    Our platform is more than just news. It's a community of scholars, analysts, and engaged citizens.
                  </p>
                  <button className="btn-premium w-fit">{t('common.become_member')}</button>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Sidebar */}
          <aside className="lg:col-span-4 space-y-16">
            <div className="sidebar-card shadow-xl">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-navy/30 dark:text-gold/30 mb-8">Opinion & Analysis</h3>
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
                        <span className="text-[10px] font-bold uppercase tracking-widest text-navy/40 dark:text-gold/40">Tahqiq Editorial</span>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="sticky top-32">
              <div className="sidebar-card bg-white dark:bg-dark-bg border-2 border-gold/20 shadow-2xl">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold mb-8">Trending Now</h3>
                <div className="space-y-8">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <div key={num} className="flex space-x-6 items-start group cursor-pointer">
                      <span className="text-3xl font-serif font-black text-navy/5 dark:text-gold/10 group-hover:text-gold/20 transition-colors leading-none">0{num}</span>
                      <p className="text-xs font-bold text-navy dark:text-gray-300 group-hover:text-gold transition-colors leading-relaxed">
                        The shifting dynamics of Central Asian diplomacy in 2026.
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-12 flex justify-center">
                <button className="btn-premium w-full">
                  <BookOpen size={14} />
                  <span>Explore Archives</span>
                </button>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};
