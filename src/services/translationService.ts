import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const translateArticle = async (text: string, targetLang: 'ru' | 'en') => {
  try {
    const model = "gemini-3-flash-preview";
    const prompt = `Translate the following text into ${targetLang === 'ru' ? 'Russian' : 'English'}. 
    The text is a political article or analysis. 
    Maintain a professional, academic, and journalistic tone. 
    Return ONLY the translated text without any explanations or extra characters.
    
    Text to translate:
    ${text}`;

    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }] }],
    });

    return response.text || '';
  } catch (error) {
    console.error('Translation error:', error);
    throw error;
  }
};

export const autoTranslateArticle = async (uzData: { title: string, excerpt: string, body: string }) => {
  const [ruTitle, ruExcerpt, ruBody, enTitle, enExcerpt, enBody] = await Promise.all([
    translateArticle(uzData.title, 'ru'),
    translateArticle(uzData.excerpt, 'ru'),
    translateArticle(uzData.body, 'ru'),
    translateArticle(uzData.title, 'en'),
    translateArticle(uzData.excerpt, 'en'),
    translateArticle(uzData.body, 'en'),
  ]);

  return {
    ru: { title: ruTitle, excerpt: ruExcerpt, body: ruBody },
    en: { title: enTitle, excerpt: enExcerpt, body: enBody }
  };
};
