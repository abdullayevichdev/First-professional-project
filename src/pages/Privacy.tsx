import React from 'react';
import { useTranslation } from 'react-i18next';
import { PageWrapper } from '../components/PageWrapper';

export const Privacy: React.FC = () => {
  const { t } = useTranslation();

  return (
    <PageWrapper>
      <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#050505] py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-navy dark:text-white mb-12">
            {t('footer.privacy', 'Maxfiylik siyosati')}
          </h1>
          <div className="prose prose-lg dark:prose-invert max-w-none text-gray-600 dark:text-gray-400">
            <p className="mb-6">
              {t('privacy.intro', 'Biz sizning maxfiyligingizni hurmat qilamiz va shaxsiy ma\'lumotlaringizni himoya qilishga intilamiz.')}
            </p>
            <h2 className="text-2xl font-serif font-bold text-navy dark:text-white mt-12 mb-6">
              {t('privacy.data_collection', 'Ma\'lumotlarni yig\'ish')}
            </h2>
            <p className="mb-6">
              {t('privacy.data_collection_desc', 'Biz faqat xizmatlarimizni taqdim etish va yaxshilash uchun zarur bo\'lgan ma\'lumotlarni yig\'amiz.')}
            </p>
            {/* Add more sections as needed */}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};
