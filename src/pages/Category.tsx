import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { ContentItem } from '../types';
import { PageWrapper } from '../components/PageWrapper';

export const Category: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/content?category=${id}`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setItems(data);
          }
        }
      } catch (error) {
        console.error("Failed to fetch category items:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [id]);

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

  return (
    <PageWrapper className="news-container py-12 sm:py-24 transition-colors duration-500">
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 sm:mb-20 border-b border-navy/5 dark:border-gold/5 pb-8 sm:pb-12"
      >
        <span className="text-[9px] sm:text-[10px] font-bold text-gold uppercase tracking-[0.4em] mb-4 block">{t('category.archive_explorer')}</span>
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif font-bold text-navy dark:text-white capitalize mb-4 sm:mb-6">
          {id?.replace('_', ' ')}
        </h1>
        <p className="text-base sm:text-lg text-navy/50 dark:text-gray-400 max-w-2xl font-light leading-relaxed italic">
          {t('category.desc', { category: id?.replace('_', ' ') })}
        </p>
      </motion.header>

      {loading ? (
        <div className="flex justify-center py-24 sm:py-40">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-gold"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 sm:gap-16">
          {items.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <Link to={`/article/${item.id}`} className="group flex flex-col">
                <div className="aspect-video bg-white dark:bg-black/20 article-card mb-6 sm:mb-8 shadow-lg">
                  <img
                    src={item.image_url || `https://picsum.photos/seed/${item.id}/800/450`}
                    alt={getTitle(item)}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-navy dark:text-white group-hover:text-gold transition-colors leading-tight mb-3 sm:mb-4">
                  {getTitle(item)}
                </h2>
                <p className="text-xs sm:text-sm text-navy/60 dark:text-gray-400 line-clamp-3 leading-relaxed font-light mb-4 sm:mb-6">
                  {getExcerpt(item)}
                </p>
                <div className="mt-auto flex items-center text-[9px] sm:text-[10px] font-bold text-navy/30 dark:text-gold/30 uppercase tracking-[0.2em]">
                  <span className="text-navy dark:text-gray-300">{item.author}</span>
                  <span className="mx-2 sm:mx-3 w-1 h-1 bg-gold rounded-full"></span>
                  <span className="text-navy dark:text-gray-300">
                    {new Date(item.created_at).toLocaleDateString(i18n.language === 'uz' ? 'uz-UZ' : i18n.language === 'ru' ? 'ru-RU' : 'en-US', { month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </PageWrapper>
  );
};
