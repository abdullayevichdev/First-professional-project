import React from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Phone, Instagram, Send, Youtube } from 'lucide-react';

export const Contact: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="news-container py-32 transition-colors duration-500">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-24">
          <span className="text-[10px] font-bold text-gold uppercase tracking-[0.4em] mb-6 block">Get in Touch</span>
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-navy dark:text-white mb-8">{t('nav.contact')}</h1>
          <p className="text-lg text-navy/50 dark:text-gray-400 font-light leading-relaxed max-w-2xl mx-auto italic">
            "For inquiries, academic collaborations, or media requests, please reach out to our editorial team."
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-24">
          <div className="space-y-12">
            <div className="sidebar-card">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-navy/30 dark:text-gold/30 mb-8">Editorial Office</h2>
              <p className="text-sm text-navy dark:text-gray-300 leading-relaxed font-medium">
                Tashkent, Uzbekistan<br />
                Political Analysis Department
              </p>
            </div>
            
            <div className="sidebar-card">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-navy/30 dark:text-gold/30 mb-8">Direct Contact</h2>
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Mail size={18} className="text-gold" />
                  <span className="text-sm font-bold text-navy dark:text-white">editor@tahqiq.com</span>
                </div>
                <div className="flex items-center space-x-4">
                  <Phone size={18} className="text-gold" />
                  <span className="text-sm font-bold text-navy dark:text-white">+998 90 123 45 67</span>
                </div>
              </div>
            </div>

            <div className="pt-12 border-t border-navy/5 dark:border-gold/5">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-navy/30 dark:text-gold/30 mb-8">Connect</h2>
              <div className="flex space-x-6">
                {[
                  { icon: <Youtube size={24} />, url: 'https://youtube.com/@TAHQIQ_OFFICIAL' },
                  { icon: <Send size={24} />, url: 'https://t.me/tahqiq_official' },
                  { icon: <Instagram size={24} />, url: 'https://www.instagram.com/tahqiq.official' }
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
          </div>

          <form className="space-y-10 bg-white dark:bg-dark-card p-12 article-card border border-gold/10 shadow-xl">
            <div className="space-y-4">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-navy/40 dark:text-gold/40">Full Name</label>
              <input type="text" className="w-full bg-white dark:bg-dark-bg border border-navy/10 dark:border-gold/10 px-6 py-5 text-sm focus:outline-none focus:border-gold transition-colors dark:text-white" />
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-navy/40 dark:text-gold/40">Email Address</label>
              <input type="email" className="w-full bg-white dark:bg-dark-bg border border-navy/10 dark:border-gold/10 px-6 py-5 text-sm focus:outline-none focus:border-gold transition-colors dark:text-white" />
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-navy/40 dark:text-gold/40">Message</label>
              <textarea rows={6} className="w-full bg-white dark:bg-dark-bg border border-navy/10 dark:border-gold/10 px-6 py-5 text-sm focus:outline-none focus:border-gold transition-colors resize-none dark:text-white"></textarea>
            </div>
            <button type="submit" className="btn-premium w-full shadow-2xl">
              <Send size={18} />
              <span>Send Inquiry</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
