import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';

export const About: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="pb-32 transition-colors duration-500">
      <section className="bg-white dark:bg-dark-card py-32 border-b border-navy/5 dark:border-gold/5 transition-colors duration-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[10px] font-bold text-gold uppercase tracking-[0.4em] mb-6 block"
          >
            Our Philosophy
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
                Tahqiq is a professional platform dedicated to the evidence-based analysis of political speeches and global issues. Our mission is to educate both Uzbek and international audiences by balancing neutral curation with strong analytical commentary.
              </p>
              <p>
                We believe that in an era of information overload, the ability to decode the true meaning behind political rhetoric is essential for a healthy democracy and an informed citizenry.
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
                Our project matters because it provides a bridge between history and the present. By analyzing the influences of history's pages, we offer prospects for the present time.
              </p>
              <p>
                This platform is particularly valuable for students, researchers, and anyone interested in PPE (Politics, Philosophy, and Economics) applications, providing academic depth and reliable source citations.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="news-container mt-32 text-center"
      >
        <div className="bg-white dark:bg-dark-card p-20 article-card shadow-2xl border border-gold/10">
          <h2 className="text-4xl font-serif font-bold text-navy dark:text-white mb-8">Join Our Community</h2>
          <p className="text-navy/60 dark:text-gray-400 mb-12 max-w-xl mx-auto font-light leading-relaxed text-lg">
            Stay informed with our latest analytical insights, decoding the complexities of global politics and historical perspectives.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <button className="btn-premium px-12">Subscribe to Newsletter</button>
            <button className="btn-secondary px-12">Contact Editorial</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
