# Tahqiq Application

Ushbu loyiha Express + Vite (React) stackida qurilgan.

## Vercel orqali deploy qilish

Saytni Vercel orqali deploy qilish uchun quyidagi qadamlarni bajaring:

1.  Ushbu loyihani GitHub repozitoriyangizga yuklang.
2.  Vercel boshqaruv panelida yangi loyiha yarating va repozitoriyani tanlang.
3.  **Environment Variables** bo'limida quyidagi o'zgaruvchilarni sozlang (qiymatlarni o'zingizning Firebase loyihangizdan oling):

    *   `VITE_JWT_SECRET`: Istalgan maxfiy kalit so'z.
    *   `VITE_FIREBASE_API_KEY`
    *   `VITE_FIREBASE_AUTH_DOMAIN`
    *   `VITE_FIREBASE_PROJECT_ID`
    *   `VITE_FIREBASE_STORAGE_BUCKET`
    *   `VITE_FIREBASE_MESSAGING_SENDER_ID`
    *   `VITE_FIREBASE_APP_ID`
    *   `VITE_FIREBASE_MEASUREMENT_ID`
    *   `FIREBASE_DATABASE_ID`: (Agar default bo'lmasa)

4.  Deploy tugmasini bosing.

## "tahqiq.uz" domenini ulash

1.  Vercel loyihangizga o'ting: **Settings > Domains**.
2.  `tahqiq.uz` domenini kiriting va **Add** bosing.
3.  Vercel ko'rsatgan DNS yozuvlarini (A record yoki CNAME) domen provayderingiz paneli orqali sozlang.

## Maxsus serverga (VPS) joylashtirish

Agar loyihani VPS serverga (Ubuntu/Debian) joylashtirmoqchi bo'lsangiz:

1.  Serverga Node.js va npm o'rnating.
2.  Kodlarni serverga ko'chiring.
3.  `npm install` qiling.
4.  `.env` faylini yarating va environment variablelarni kiriting.
5.  `npm run build` orqali loyihani build qiling.
6.  `pm2 start npm --name "tahqiq" -- run start` orqali serverni ishga tushiring.
7.  Nginx oraqli 3000 portni `tahqiq.uz` domeniga yo'naltiring.

## Admin panel

Admin panelga kirish uchun quyidagi email manzillari huquqiga ega:
*   mansur.ox7@gmail.com
*   abdulxayavazxanov2012@gmail.com
