import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { PageWrapper } from '../components/PageWrapper';

export const About: React.FC = () => {
  const { t } = useTranslation();

  return (
    <PageWrapper className="transition-colors duration-500">
      <section className="bg-white dark:bg-dark-card py-32 border-b border-navy/5 dark:border-gold/5 transition-colors duration-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[10px] font-bold text-gold uppercase tracking-[0.4em] mb-6 block"
          >
            {t('about.philosophy')}
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-serif font-bold text-navy dark:text-white mb-8"
          >
            {t('nav.about')}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl text-navy/40 dark:text-gold/30 leading-relaxed font-serif italic"
          >
            "{t('hero.slogan')}"
          </motion.p>
        </div>
      </section>

      <section className="news-container py-32 space-y-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-serif font-bold text-navy dark:text-white mb-8">{t('common.mission')}</h2>
            <div className="text-navy/70 dark:text-gray-400 leading-[2] font-light text-lg space-y-6">
              <p>
                {t('about.mission_p1')}
              </p>
              <p>
                {t('about.mission_p2')}
              </p>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="aspect-square bg-navy/5 dark:bg-black/20 article-card shadow-2xl"
          >
            <img src="https://picsum.photos/seed/mission/800/800" alt="Mission" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="order-2 md:order-1 aspect-square bg-navy/5 dark:bg-black/20 article-card shadow-2xl"
          >
            <img src="https://picsum.photos/seed/why/800/800" alt="Why it matters" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="order-1 md:order-2"
          >
            <h2 className="text-3xl font-serif font-bold text-navy dark:text-white mb-8">{t('common.why_matters')}</h2>
            <div className="text-navy/70 dark:text-gray-400 leading-[2] font-light text-lg space-y-6">
              <p>
                {t('about.why_p1')}
              </p>
              <p>
                {t('about.why_p2')}
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </PageWrapper>
  );
};
