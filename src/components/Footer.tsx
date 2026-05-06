import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Instagram, Send, Youtube, Mail, Phone } from 'lucide-react';

export const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-white dark:bg-dark-card border-t border-navy/5 dark:border-gold/5 pt-10 sm:pt-16 pb-8 sm:pb-12 transition-colors duration-500">
      <div className="news-container">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 sm:gap-12 items-start">
          {/* Brand */}
          <div className="md:col-span-4 flex flex-col items-center md:items-start text-center md:text-left">
            <Link to="/" className="flex flex-col mb-4 sm:mb-6 group">
              <span className="text-3xl sm:text-4xl font-serif font-black tracking-tighter text-navy dark:text-white leading-none group-hover:text-gold transition-colors duration-500">TAHQIQ</span>
            </Link>
            <p className="text-xs sm:text-sm text-navy/50 dark:text-gray-400 leading-relaxed font-light max-w-xs italic">
              {t('footer.desc')}
            </p>
          </div>

          {/* Links */}
          <div className="md:col-span-4 grid grid-cols-2 gap-8 text-center md:text-left">
            <div className="flex flex-col space-y-2 sm:space-y-3">
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-navy/30 dark:text-gold/30 mb-1 sm:mb-2">{t('footer.platform')}</span>
              <Link to="/about" className="text-xs sm:text-sm font-bold text-navy dark:text-gray-300 hover:text-gold transition-colors">{t('footer.about')}</Link>
              <Link to="/contact" className="text-xs sm:text-sm font-bold text-navy dark:text-gray-300 hover:text-gold transition-colors">{t('footer.contact')}</Link>
              <Link to="/glossary" className="text-xs sm:text-sm font-bold text-navy dark:text-gray-300 hover:text-gold transition-colors">{t('footer.resources')}</Link>
            </div>
            <div className="flex flex-col space-y-2 sm:space-y-3">
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-navy/30 dark:text-gold/30 mb-1 sm:mb-2">{t('footer.legal')}</span>
              <Link to="/privacy" className="text-xs sm:text-sm font-bold text-navy dark:text-gray-300 hover:text-gold transition-colors">{t('footer.privacy')}</Link>
              <Link to="/terms" className="text-xs sm:text-sm font-bold text-navy dark:text-gray-300 hover:text-gold transition-colors">{t('footer.terms')}</Link>
            </div>
          </div>

          {/* Social */}
          <div className="md:col-span-4 flex flex-col items-center md:items-end">
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-navy/30 dark:text-gold/30 mb-4 sm:mb-6">{t('footer.connect')}</span>
            <div className="flex space-x-3 sm:space-x-4">
              {[
                { icon: <Youtube size={18} />, url: 'https://youtube.com/@TAHQIQ_OFFICIAL' },
                { icon: <Send size={18} />, url: 'https://t.me/tahqiq_official' },
                { icon: <Instagram size={18} />, url: 'https://www.instagram.com/tahqiq.official' }
              ].map((social, idx) => (
                <a 
                  key={idx}
                  href={social.url} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="social-btn w-10 h-10 sm:w-12 sm:h-12"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-10 sm:mt-16 pt-8 sm:pt-10 border-t border-navy/5 dark:border-gold/5 flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0 text-center md:text-left">
          <p className="text-[9px] sm:text-[10px] font-bold text-navy/30 dark:text-gold/20 uppercase tracking-[0.2em]">
            © {new Date().getFullYear()} TAHQIQ.com — {t('footer.rights')}
          </p>
          <div className="flex flex-wrap items-center justify-center space-x-4 sm:space-x-8 text-[9px] sm:text-[10px] font-bold text-navy/30 dark:text-gold/20 uppercase tracking-[0.2em]">
            <span className="text-gold/40">v2.1 Debug</span>
            <span className="hidden sm:block w-1 h-1 bg-gold rounded-full"></span>
            <span>{t('footer.designed')}</span>
            <span className="hidden sm:block w-1 h-1 bg-gold rounded-full"></span>
            <span>{t('footer.global_edition')}</span>
            <Link to="/admin" className="opacity-0 hover:opacity-100 transition-opacity duration-500">Admin</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
