import React from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Phone, Instagram, Send, Youtube } from 'lucide-react';
import { motion } from 'motion/react';
import { PageWrapper } from '../components/PageWrapper';

export const Contact: React.FC = () => {
  const { t } = useTranslation();

  return (
    <PageWrapper className="news-container py-16 sm:py-32 transition-colors duration-500">
      <div className="max-w-6xl mx-auto">
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16 sm:mb-24"
        >
          <span className="text-[9px] sm:text-[10px] font-bold text-gold uppercase tracking-[0.4em] mb-4 sm:mb-6 block">{t('contact.get_in_touch')}</span>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif font-bold text-navy dark:text-white mb-6 sm:mb-8">{t('nav.contact')}</h1>
          <p className="text-base sm:text-lg text-navy/50 dark:text-gray-400 font-light leading-relaxed max-w-2xl mx-auto italic">
            {t('contact.desc')}
          </p>
        </motion.header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 sm:gap-24">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8 sm:space-y-12"
          >
            <div className="sidebar-card">
              <h2 className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.3em] text-navy/30 dark:text-gold/30 mb-6 sm:mb-8">{t('contact.editorial_office')}</h2>
              <p className="text-xs sm:text-sm text-navy dark:text-gray-300 leading-relaxed font-medium">
                {t('contact.address')}<br />
                {t('contact.department')}
              </p>
            </div>
            
            <div className="sidebar-card">
              <h2 className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.3em] text-navy/30 dark:text-gold/30 mb-6 sm:mb-8">{t('contact.direct_contact')}</h2>
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-center space-x-4">
                  <Mail size={18} className="text-gold" />
                  <span className="text-xs sm:text-sm font-bold text-navy dark:text-white">editor@tahqiq.com</span>
                </div>
                <div className="flex items-center space-x-4">
                  <Phone size={18} className="text-gold" />
                  <span className="text-xs sm:text-sm font-bold text-navy dark:text-white">+998 90 123 45 67</span>
                </div>
              </div>
            </div>

            <div className="pt-8 sm:pt-12 border-t border-navy/5 dark:border-gold/5">
              <h2 className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.3em] text-navy/30 dark:text-gold/30 mb-6 sm:mb-8">{t('footer.connect')}</h2>
              <div className="flex space-x-4 sm:space-x-6">
                {[
                  { icon: <Youtube size={20} />, url: 'https://youtube.com/@TAHQIQ_OFFICIAL' },
                  { icon: <Send size={20} />, url: 'https://t.me/tahqiq_official' },
                  { icon: <Instagram size={20} />, url: 'https://www.instagram.com/tahqiq.official' }
                ].map((social, idx) => (
                  <a 
                    key={idx}
                    href={social.url} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="social-btn"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.form 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8 sm:space-y-10 bg-white dark:bg-dark-card p-8 sm:p-12 article-card border border-gold/10 shadow-xl"
          >
            <div className="space-y-3 sm:space-y-4">
              <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-navy/40 dark:text-gold/40">{t('contact.full_name')}</label>
              <input type="text" className="w-full bg-white dark:bg-dark-bg border border-navy/10 dark:border-gold/10 px-4 py-4 sm:px-6 sm:py-5 text-sm focus:outline-none focus:border-gold transition-colors dark:text-white" />
            </div>
            <div className="space-y-3 sm:space-y-4">
              <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-navy/40 dark:text-gold/40">{t('contact.email')}</label>
              <input type="email" className="w-full bg-white dark:bg-dark-bg border border-navy/10 dark:border-gold/10 px-4 py-4 sm:px-6 sm:py-5 text-sm focus:outline-none focus:border-gold transition-colors dark:text-white" />
            </div>
            <div className="space-y-3 sm:space-y-4">
              <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-navy/40 dark:text-gold/40">{t('contact.message')}</label>
              <textarea rows={5} className="w-full bg-white dark:bg-dark-bg border border-navy/10 dark:border-gold/10 px-4 py-4 sm:px-6 sm:py-5 text-sm focus:outline-none focus:border-gold transition-colors resize-none dark:text-white"></textarea>
            </div>
            <button type="submit" className="btn-premium w-full shadow-2xl py-4 sm:py-5">
              <Send size={18} />
              <span>{t('contact.send_inquiry')}</span>
            </button>
          </motion.form>
        </div>
      </div>
    </PageWrapper>
  );
};
