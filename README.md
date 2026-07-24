# Golapi Shop Online — Backend API

NestJS + PostgreSQL (Prisma) — Firebase-এর প্রতিস্থাপন হিসেবে বানানো
production-grade backend।

## মোবাইল থেকে Deploy করার ধাপ (Railway.app)

1. এই পুরো ফোল্ডারটা GitHub-এ একটা নতুন repo হিসেবে push করো
   (মোবাইল থেকে: GitHub মোবাইল অ্যাপ দিয়ে সরাসরি না হলেও, "Working Copy"
   (iOS) বা "Termux + git" (Android) দিয়ে সহজে push করা যায়। অথবা সবচেয়ে
   সহজ পথ: আমাকে বলো, আমি zip বানিয়ে দেব, তুমি GitHub web UI দিয়ে
   "Upload files" করে দেবে — কোনো টার্মিনাল লাগবে না)
2. https://railway.app এ যাও (মোবাইল ব্রাউজারেই ওপেন হয়) → GitHub দিয়ে লগইন
3. "New Project" → "Deploy from GitHub repo" → এই repo সিলেক্ট করো
4. "New" → "Database" → "PostgreSQL" যোগ করো (এক ক্লিকে)
5. Backend service-এর "Variables" ট্যাবে গিয়ে:
   - `DATABASE_URL` — PostgreSQL service থেকে কপি করে বসাও (Railway অটো-লিংক করে)
   - `JWT_SECRET` — যেকোনো লম্বা র‍্যান্ডম স্ট্রিং
6. "Settings" → "Deploy" এ Build Command না দিলেও চলবে (postinstall এ prisma generate হয়ে যাবে)
7. প্রথমবার DB সেটআপের জন্য Railway-এর "Shell"/"Command" ফিচার থেকে চালাও:
   ```
   npx prisma migrate deploy
   npx prisma db seed
   ```
8. Deploy শেষে Railway একটা পাবলিক URL দেবে (যেমন golapi-backend.up.railway.app) —
   এটাই তোমার API base URL

## API Endpoints (v1)

- `POST /api/v1/auth/otp/send` — { phone }
- `POST /api/v1/auth/otp/verify` — { phone, code, name? }
- `GET  /api/v1/products?zone=noakhali_sadar&category=grocery`
- `GET  /api/v1/products/:id`
- `POST /api/v1/orders` (auth লাগবে)
- `GET  /api/v1/orders/my` (auth লাগবে)

## পরের ধাপ

- SMS gateway ইন্টিগ্রেশন (auth.service.ts-এর TODO)
- Cloudinary image upload endpoint
- Payment webhook (SSLCommerz/bKash)
- Frontend (Next.js) এই API-এর সাথে কানেক্ট করা
