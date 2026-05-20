import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Phone, Instagram, Send, Youtube, CheckCircle, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PageWrapper } from '../components/PageWrapper';

export const Contact: React.FC = () => {
  const { t } = useTranslation();
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<{
    loading: boolean;
    success: boolean;
    error: string | null;
  }>({
    loading: false,
    success: false,
    error: null
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !message.trim()) {
      setStatus({ 
        loading: false, 
        success: false, 
        error: "Iltimos, barcha maydonlarni to'ldiring." 
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setStatus({ 
        loading: false, 
        success: false, 
        error: "Iltimos, to'g'ri elektron pochta manzilini kiriting." 
      });
      return;
    }

    setStatus({ loading: true, success: false, error: null });

    try {
      const response = await fetch('/api/contact/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          message: message.trim()
        }),
      });

      if (response.ok) {
        setStatus({ loading: false, success: true, error: null });
        setFullName('');
        setEmail('');
        setMessage('');
      } else {
        const errData = await response.json().catch(() => ({}));
        setStatus({ 
          loading: false, 
          success: false, 
          error: errData.error || "Xabar yuborishda xatolik yuz berdi. Iltimos keyinroq qayta urinib ko'ring." 
        });
      }
    } catch (err) {
      console.error(err);
      setStatus({ 
        loading: false, 
        success: false, 
        error: "Tarmoq ulanishida xatolik yuz berdi. Internet aloqangizni tekshiring." 
      });
    }
  };

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
                  <a href="mailto:mansur.ox7@gmail.com" className="text-xs sm:text-sm font-bold text-navy dark:text-white hover:text-gold transition-colors">
                    mansur.ox7@gmail.com
                  </a>
                </div>
                <div className="flex items-center space-x-4">
                  <Phone size={18} className="text-gold" />
                  <a href="tel:+998942641800" className="text-xs sm:text-sm font-bold text-navy dark:text-white hover:text-gold transition-colors">
                    +998 94 2641800
                  </a>
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

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white dark:bg-dark-card p-8 sm:p-12 article-card border border-gold/10 shadow-xl relative min-h-[400px] flex flex-col justify-center animate-card"
          >
            <AnimatePresence mode="wait">
              {status.success ? (
                <motion.div 
                  key="success-state"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="text-center py-8 space-y-6"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 mb-2">
                    <CheckCircle size={36} />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-navy dark:text-white">Xabaringiz Yuborildi!</h3>
                  <p className="text-sm text-navy/60 dark:text-gray-400 font-light leading-relaxed max-w-sm mx-auto">
                    Murojaatingiz uchun tashakkur. Siyosiy tahlillar va hamkorlik masalalari boʻyicha tahririyatimiz tez orada siz bilan bog'lanadi.
                  </p>
                  <button 
                    onClick={() => setStatus({ loading: false, success: false, error: null })}
                    className="btn-premium px-6 py-3 text-xs uppercase tracking-wider"
                  >
                    Yangi xabar yuborish
                  </button>
                </motion.div>
              ) : (
                <form 
                  key="form-state"
                  onSubmit={handleSubmit}
                  className="space-y-8 sm:space-y-10"
                >
                  <div className="space-y-3 sm:space-y-4">
                    <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-navy/40 dark:text-gold/40">{t('contact.full_name')}</label>
                    <input 
                      type="text" 
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      disabled={status.loading}
                      placeholder="Ilyos Mansurov"
                      className="w-full bg-white dark:bg-dark-bg border border-navy/10 dark:border-gold/10 px-4 py-4 sm:px-6 sm:py-5 text-sm focus:outline-none focus:border-gold transition-colors dark:text-white disabled:opacity-50" 
                    />
                  </div>
                  <div className="space-y-3 sm:space-y-4">
                    <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-navy/40 dark:text-gold/40">{t('contact.email')}</label>
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={status.loading}
                      placeholder="mansur.ox7@gmail.com"
                      className="w-full bg-white dark:bg-dark-bg border border-navy/10 dark:border-gold/10 px-4 py-4 sm:px-6 sm:py-5 text-sm focus:outline-none focus:border-gold transition-colors dark:text-white disabled:opacity-50" 
                    />
                  </div>
                  <div className="space-y-3 sm:space-y-4">
                    <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-navy/40 dark:text-gold/40">{t('contact.message')}</label>
                    <textarea 
                      rows={5} 
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      disabled={status.loading}
                      placeholder="Murojaatingiz matnini bu yerga yozing..."
                      className="w-full bg-white dark:bg-dark-bg border border-navy/10 dark:border-gold/10 px-4 py-4 sm:px-6 sm:py-5 text-sm focus:outline-none focus:border-gold transition-colors resize-none dark:text-white disabled:opacity-50"
                    ></textarea>
                  </div>

                  {status.error && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start space-x-2 text-red-500 text-xs sm:text-sm bg-red-50 dark:bg-red-500/10 p-3 sm:p-4 rounded-lg"
                    >
                      <AlertTriangle className="flex-shrink-0 mt-0.5" size={16} />
                      <span>{status.error}</span>
                    </motion.div>
                  )}

                  <button 
                    type="submit" 
                    disabled={status.loading}
                    className="btn-premium w-full shadow-2xl py-4 sm:py-5 flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {status.loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send size={18} />
                        <span>{t('contact.send_inquiry')}</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </PageWrapper>
  );
};
