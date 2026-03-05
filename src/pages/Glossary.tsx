import React from 'react';
import { useTranslation } from 'react-i18next';
import { Book, PlayCircle } from 'lucide-react';
import { PageWrapper } from '../components/PageWrapper';

export const Glossary: React.FC = () => {
  const { t } = useTranslation();

  const terms = [
    { term: t('glossary.terms.parliament.term'), def: t('glossary.terms.parliament.def'), video: 'https://youtube.com/watch?v=dQw4w9WgXcQ' },
    { term: t('glossary.terms.referendum.term'), def: t('glossary.terms.referendum.def'), video: 'https://youtube.com/watch?v=dQw4w9WgXcQ' },
    { term: t('glossary.terms.lobbying.term'), def: t('glossary.terms.lobbying.def'), video: 'https://youtube.com/watch?v=dQw4w9WgXcQ' },
    { term: t('glossary.terms.democracy.term'), def: t('glossary.terms.democracy.def'), video: 'https://youtube.com/watch?v=dQw4w9WgXcQ' },
  ];

  return (
    <PageWrapper className="news-container py-32 transition-colors duration-500">
      <div className="max-w-4xl mx-auto">
        <header className="mb-24 text-center">
          <span className="text-[10px] font-bold text-gold uppercase tracking-[0.4em] mb-6 block">{t('glossary.knowledge_base')}</span>
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-navy dark:text-white mb-8">{t('glossary.title')}</h1>
          <p className="text-lg text-navy/50 dark:text-gray-400 font-light leading-relaxed italic">
            {t('glossary.desc')}
          </p>
        </header>

        <div className="space-y-12">
          {terms.map((item, i) => (
            <div key={i} className="sidebar-card group hover:border-gold dark:hover:border-gold transition-all duration-500 bg-white dark:bg-dark-card shadow-xl">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                <div className="flex items-start space-x-6">
                  <div className="w-12 h-12 bg-navy/5 dark:bg-gold/10 flex items-center justify-center text-gold shadow-inner">
                    <Book size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-serif font-bold text-navy dark:text-white mb-3 group-hover:text-gold transition-colors">{item.term}</h3>
                    <p className="text-navy/60 dark:text-gray-400 leading-relaxed font-light">{item.def}</p>
                  </div>
                </div>
                <a
                  href={item.video}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-premium whitespace-nowrap shadow-lg"
                >
                  <PlayCircle size={14} />
                  <span>{t('glossary.watch_explainer')}</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
};
