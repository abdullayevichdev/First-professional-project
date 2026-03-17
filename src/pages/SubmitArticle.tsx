import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Send, Image as ImageIcon, Video, AlertCircle, CheckCircle, Loader2, Languages, Sparkles } from 'lucide-react';
import { PageWrapper } from '../components/PageWrapper';
import { User } from '../types';
import { autoTranslateArticle } from '../services/translationService';

interface SubmitArticleProps {
  user: User | null;
}

export const SubmitArticle: React.FC<SubmitArticleProps> = ({ user }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title_uz: '',
    title_ru: '',
    title_en: '',
    excerpt_uz: '',
    excerpt_ru: '',
    excerpt_en: '',
    body_uz: '',
    body_ru: '',
    body_en: '',
    category: 'uzbekistan',
    image_url: '',
    video_url: ''
  });

  if (!user) {
    return (
      <PageWrapper className="py-24 text-center">
        <div className="max-w-md mx-auto bg-white dark:bg-dark-card p-12 rounded-2xl shadow-2xl border border-navy/10 dark:border-gold/10">
          <AlertCircle size={48} className="text-gold mx-auto mb-6" />
          <h2 className="text-2xl font-serif font-bold mb-4 text-navy dark:text-white">{t('submit_article.login_required')}</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">{t('submit_article.login_required_desc')}</p>
          <button onClick={() => navigate('/')} className="btn-premium w-full">{t('submit_article.back_home')}</button>
        </div>
      </PageWrapper>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAutoTranslate = async () => {
    if (!formData.title_uz || !formData.excerpt_uz || !formData.body_uz) {
      setError("Iltimos, avval o'zbekcha maydonlarni to'ldiring.");
      return;
    }

    setTranslating(true);
    setError(null);
    try {
      const translations = await autoTranslateArticle({
        title: formData.title_uz,
        excerpt: formData.excerpt_uz,
        body: formData.body_uz
      });

      setFormData(prev => ({
        ...prev,
        title_ru: translations.ru.title,
        excerpt_ru: translations.ru.excerpt,
        body_ru: translations.ru.body,
        title_en: translations.en.title,
        excerpt_en: translations.en.excerpt,
        body_en: translations.en.body,
      }));
    } catch (err: any) {
      setError("Tarjima qilishda xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.");
    } finally {
      setTranslating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setSuccess(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => navigate('/profile'), 3000);
      } else {
        const data = await res.json();
        throw new Error(data.error || 'Xatolik yuz berdi');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <PageWrapper className="py-24 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto bg-white dark:bg-dark-card p-12 rounded-2xl shadow-2xl border border-gold/20"
        >
          <CheckCircle size={64} className="text-emerald-500 mx-auto mb-6" />
          <h2 className="text-3xl font-serif font-bold mb-4 text-navy dark:text-white">{t('submit_article.success_title')}</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            {t('submit_article.success_desc')}
          </p>
          <div className="text-sm text-gold font-bold uppercase tracking-widest animate-pulse">
            {t('submit_article.redirecting')}
          </div>
        </motion.div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper className="py-8 sm:py-16 bg-gray-50 dark:bg-dark-bg transition-colors duration-500">
      <div className="news-container max-w-4xl px-4 sm:px-6">
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 sm:mb-12 text-center"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-navy dark:text-white mb-4 sm:mb-6">{t('submit_article.title')}</h1>
          <div className="bg-gold/10 border border-gold/20 p-4 sm:p-6 rounded-xl inline-block max-w-2xl">
            <p className="text-gold text-sm sm:text-base font-medium italic">
              "{t('submit_article.subtitle')}"
            </p>
          </div>
        </motion.header>

        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-dark-card p-6 sm:p-8 rounded-2xl shadow-xl border border-navy/5 dark:border-gold/10 space-y-6 sm:space-y-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 dark:border-white/5 pb-4 gap-4">
              <h2 className="text-lg sm:text-xl font-serif font-bold text-navy dark:text-white">{t('submit_article.content_title')}</h2>
              <button
                type="button"
                onClick={handleAutoTranslate}
                disabled={translating}
                className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-gold/10 hover:bg-gold/20 text-gold rounded-xl text-[9px] sm:text-[10px] font-bold uppercase tracking-widest transition-all disabled:opacity-50 w-full sm:w-auto"
              >
                {translating ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Sparkles size={14} />
                )}
                <span>{translating ? t('submit_article.translating') : t('submit_article.auto_translate')}</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Uzbek */}
              <div className="space-y-4 sm:space-y-6">
                <h3 className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gold border-b border-gold/10 pb-2">{t('submit_article.uzbek')}</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-navy/40 dark:text-gold/40 mb-2">{t('submit_article.label_title')}</label>
                    <input required name="title_uz" value={formData.title_uz} onChange={handleChange} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 px-4 py-3 rounded-lg focus:outline-none focus:border-gold transition-colors text-sm dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-navy/40 dark:text-gold/40 mb-2">{t('submit_article.label_excerpt')}</label>
                    <textarea required name="excerpt_uz" value={formData.excerpt_uz} onChange={handleChange} rows={3} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 px-4 py-3 rounded-lg focus:outline-none focus:border-gold transition-colors text-sm dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-navy/40 dark:text-gold/40 mb-2">{t('submit_article.label_body')}</label>
                    <textarea required name="body_uz" value={formData.body_uz} onChange={handleChange} rows={10} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 px-4 py-3 rounded-lg focus:outline-none focus:border-gold transition-colors text-sm dark:text-white" />
                  </div>
                </div>
              </div>

              {/* Russian */}
              <div className="space-y-4 sm:space-y-6">
                <h3 className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gold border-b border-gold/10 pb-2">{t('submit_article.russian')}</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-navy/40 dark:text-gold/40 mb-2">{t('submit_article.label_title')}</label>
                    <input required name="title_ru" value={formData.title_ru} onChange={handleChange} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 px-4 py-3 rounded-lg focus:outline-none focus:border-gold transition-colors text-sm dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-navy/40 dark:text-gold/40 mb-2">{t('submit_article.label_excerpt')}</label>
                    <textarea required name="excerpt_ru" value={formData.excerpt_ru} onChange={handleChange} rows={3} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 px-4 py-3 rounded-lg focus:outline-none focus:border-gold transition-colors text-sm dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-navy/40 dark:text-gold/40 mb-2">{t('submit_article.label_body')}</label>
                    <textarea required name="body_ru" value={formData.body_ru} onChange={handleChange} rows={10} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 px-4 py-3 rounded-lg focus:outline-none focus:border-gold transition-colors text-sm dark:text-white" />
                  </div>
                </div>
              </div>

              {/* English */}
              <div className="space-y-4 sm:space-y-6">
                <h3 className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gold border-b border-gold/10 pb-2">{t('submit_article.english')}</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-navy/40 dark:text-gold/40 mb-2">{t('submit_article.label_title')}</label>
                    <input required name="title_en" value={formData.title_en} onChange={handleChange} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 px-4 py-3 rounded-lg focus:outline-none focus:border-gold transition-colors text-sm dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-navy/40 dark:text-gold/40 mb-2">{t('submit_article.label_excerpt')}</label>
                    <textarea required name="excerpt_en" value={formData.excerpt_en} onChange={handleChange} rows={3} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 px-4 py-3 rounded-lg focus:outline-none focus:border-gold transition-colors text-sm dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-navy/40 dark:text-gold/40 mb-2">{t('submit_article.label_body')}</label>
                    <textarea required name="body_en" value={formData.body_en} onChange={handleChange} rows={10} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 px-4 py-3 rounded-lg focus:outline-none focus:border-gold transition-colors text-sm dark:text-white" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Metadata */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-dark-card p-6 sm:p-8 rounded-2xl shadow-xl border border-navy/5 dark:border-gold/10 grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            <div className="space-y-6">
              <h2 className="text-lg sm:text-xl font-serif font-bold border-b border-gray-100 dark:border-white/5 pb-4 text-navy dark:text-white">{t('submit_article.category_media')}</h2>
              <div>
                <label className="block text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-navy/40 dark:text-gold/40 mb-2">{t('submit_article.category')}</label>
                <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 px-4 py-3 rounded-lg focus:outline-none focus:border-gold transition-colors text-sm dark:text-white">
                  <option value="uzbekistan">O'zbekiston siyosati</option>
                  <option value="global">Global siyosat</option>
                  <option value="speech">Nutq tahlili</option>
                  <option value="opinion">Mulohaza va tahlil</option>
                  <option value="historical">Tarixiy tahlil</option>
                </select>
              </div>
              <div>
                <label className="block text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-navy/40 dark:text-gold/40 mb-2">{t('submit_article.image_url')}</label>
                <div className="relative">
                  <ImageIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gold" />
                  <input name="image_url" value={formData.image_url} onChange={handleChange} placeholder="https://example.com/image.jpg" className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 pl-12 pr-4 py-3 rounded-lg focus:outline-none focus:border-gold transition-colors text-sm dark:text-white" />
                </div>
              </div>
              <div>
                <label className="block text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-navy/40 dark:text-gold/40 mb-2">{t('submit_article.video_url')}</label>
                <div className="relative">
                  <Video size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gold" />
                  <input name="video_url" value={formData.video_url} onChange={handleChange} placeholder="https://youtube.com/watch?v=..." className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 pl-12 pr-4 py-3 rounded-lg focus:outline-none focus:border-gold transition-colors text-sm dark:text-white" />
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center items-center p-6 sm:p-8 bg-navy/5 dark:bg-white/5 rounded-xl border border-dashed border-navy/10 dark:border-gold/20">
              <AlertCircle size={24} className="text-gold mb-4 sm:w-[32px] sm:h-[32px]" />
              <h4 className="text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-2 text-navy dark:text-white">{t('submit_article.note_title')}</h4>
              <p className="text-[10px] sm:text-xs text-center text-gray-500 dark:text-gray-400 leading-relaxed">
                {t('submit_article.note_desc')}
              </p>
            </div>
          </motion.div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-xl flex items-center space-x-3 text-red-600 dark:text-red-400">
              <AlertCircle size={20} />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || translating}
              className="btn-premium px-12 py-4 flex items-center space-x-3"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Send size={20} />
              )}
              <span>{t('submit_article.submit_btn')}</span>
            </button>
          </div>
        </form>
      </div>
    </PageWrapper>
  );
};
