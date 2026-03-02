import React from 'react';
import { useTranslation } from 'react-i18next';
import { Book, PlayCircle } from 'lucide-react';

export const Glossary: React.FC = () => {
  const { t } = useTranslation();

  const terms = [
    { term: 'Parlament', def: 'Davlat hokimiyatining oliy vakillik va qonun chiqaruvchi organi.', video: 'https://youtube.com/watch?v=dQw4w9WgXcQ' },
    { term: 'Referendum', def: 'Davlat ahamiyatiga molik eng muhim masalalar bo‘yicha o‘tkaziladigan umumxalq ovoz berishi.', video: 'https://youtube.com/watch?v=dQw4w9WgXcQ' },
    { term: 'Lobbizm', def: 'Siyosiy qarorlar qabul qilinishiga ta’sir ko‘rsatish maqsadida davlat organlariga bosim o‘tkazish faoliyati.', video: 'https://youtube.com/watch?v=dQw4w9WgXcQ' },
    { term: 'Demokratiya', def: 'Xalq hokimiyatiga asoslangan davlat boshqaruvi shakli.', video: 'https://youtube.com/watch?v=dQw4w9WgXcQ' },
  ];

  return (
    <div className="news-container py-32 transition-colors duration-500">
      <div className="max-w-4xl mx-auto">
        <header className="mb-24 text-center">
          <span className="text-[10px] font-bold text-gold uppercase tracking-[0.4em] mb-6 block">Knowledge Base</span>
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-navy dark:text-white mb-8">Political Glossary</h1>
          <p className="text-lg text-navy/50 dark:text-gray-400 font-light leading-relaxed italic">
            "Essential terminology explained for students, researchers, and global citizens."
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
                  <span>Watch Explainer</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
