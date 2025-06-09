# 🔄 مراحل بعدی پروژه Gemini Pro Studio

## 📋 وضعیت فعلی
✅ **تکمیل شده (۴۰% فاز ۱):**
- مستندات کامل
- Backend infrastructure اصلی
- Frontend setup اولیه  
- Database schema
- Auth system foundation
- میدل‌ویرهای اصلی بک‌اند
- روت‌های اساسی API
- کامپوننت LoadingButton
- پیکربندی typeScript
- ایجاد سرور ساده (simple-server.js)
- شبیه‌سازی موقت Prisma client

⏳ **در حال انجام:**
- تکمیل کامپوننت‌های UI
- API endpoints اصلی
- Frontend pages
- اتصال دیتابیس
- اصلاح مشکلات Prisma

---

## 🎯 فایل‌های بعدی که باید ایجاد شوند:

### 1. Backend API Routes (۱۰ فایل)
- [x] `auth.ts` - مسیرهای احراز هویت
- [x] `users.ts` - مدیریت کاربران
- [x] `health.ts` - بررسی وضعیت API
- [ ] `conversations.ts` - مدیریت مکالمات
- [ ] `messages.ts` - مدیریت پیام‌ها
- [ ] `files.ts` - مدیریت فایل‌ها
- [ ] `ai.ts` - API های هوش مصنوعی
- [ ] `tags.ts` - مدیریت برچسب‌ها
- [ ] `templates.ts` - قالب‌های آماده
- [ ] `stats.ts` - آمار و گزارش‌گیری
- [ ] `settings.ts` - تنظیمات

### 2. Backend Controllers (۱۰ فایل)
- [ ] `authController.ts`
- [ ] `userController.ts`
- [ ] `conversationController.ts`
- [ ] `messageController.ts`
- [ ] `fileController.ts`
- [ ] `aiController.ts`
- [ ] و غیره...

### 3. Frontend Services (۸ فایل)
- [ ] `authService.ts` - سرویس احراز هویت
- [ ] `apiService.ts` - HTTP client اصلی
- [ ] `conversationService.ts`
- [ ] `aiService.ts`
- [ ] `fileService.ts`
- [ ] و غیره...

### 4. Frontend Components (۳۰+ فایل)
- [x] `LoadingSpinner.tsx` / `LoadingButton.tsx`
- [x] `ErrorBoundary.tsx`
- [ ] `Button.tsx` (variants)
- [ ] `Input.tsx`
- [ ] `Modal.tsx`
- [ ] `Toast.tsx`
- [ ] `LoginForm.tsx`
- [ ] `RegisterForm.tsx`
- [ ] `ChatInterface.tsx`
- [ ] `MessageBubble.tsx`
- [ ] `FileUpload.tsx`
- [ ] `TagSelector.tsx`
- [ ] و غیره...

### 5. Frontend Pages (۱۲ فایل)
- [x] `Login.tsx` (نیاز به تکمیل)
- [ ] `Register.tsx`
- [ ] `Dashboard.tsx`
- [ ] `Chat.tsx`
- [ ] `MediaAnalysis.tsx`
- [ ] `Settings.tsx`
- [ ] و غیره...

---

## 🗂️ فایل‌های اولویت‌دار (مرحله بعدی):

### فوری (برنامه این هفته):
1. **Authentication Service** - برای تکمیل auth store و اتصال به بک‌اند
2. **API Service** - HTTP client اصلی با استفاده از axios
3. **Register Form** - صفحه ثبت‌نام و تکمیل صفحه ورود
4. **Database Connection** - پیکربندی کامل دیتابیس و تست اتصال
5. **Prisma Client Fix** - اصلاح مشکلات Prisma و schema.prisma

### مهم (برنامه هفته آینده):
1. **Chat Interface** - رابط اصلی چت
2. **Dashboard** - صفحه اصلی
3. **File Upload** - آپلود فایل
4. **Settings Page** - تنظیمات

---

## 🛠️ دستورات اجرایی:

### نصب Dependencies:
```bash
# Frontend
cd frontend && npm install axios react-hook-form zod @hookform/resolvers

# Backend  
cd backend && npm install jsonwebtoken bcrypt

# Prisma
cd backend && npm install -D prisma && npm install @prisma/client
```

### راه‌اندازی دیتابیس:
```bash
# MySQL (با رمز 123)
mysql -u root -p123 -e "CREATE DATABASE gemini_pro_studio CHARACTER SET utf8mb4 COLLATE utf8mb4_persian_ci;"

# Prisma
cd backend
npx prisma migrate dev --name init
npx prisma generate
```

### اجرای پروژه:
```bash
# اجرای سرور ساده (بدون نیاز به Prisma)
cd backend && node src/simple-server.js  # Port 5150

# یا اجرای سرور اصلی (پس از حل مشکلات Prisma)
cd backend && npm run dev  # Port 5150

# اجرای فرانت‌اند
cd frontend && npm start   # Port 3150
```

---

## 🔄 استراتژی توسعه موازی:

برای افزایش سرعت پیشرفت، استراتژی توسعه موازی در نظر گرفته شده است:

1. **کار با سرور ساده**: توسعه فرانت‌اند و قابلیت‌های API پایه با استفاده از simple-server.js
2. **اصلاح مشکلات Prisma**: همزمان کار بر روی رفع مشکلات اسکیما و ارتباط با دیتابیس
3. **یکپارچه‌سازی تدریجی**: انتقال تدریجی قابلیت‌ها از سرور ساده به سرور اصلی پس از حل مشکلات

---

## ⚡ اولویت‌های این هفته:

### 1. تکمیل Authentication (۲ ساعت)
- ایجاد `authService.ts`
- ایجاد `apiService.ts`  
- تست login/register flow

### 2. صفحات اولیه (۳ ساعت)
- تکمیل صفحه Login
- ایجاد صفحه Register
- ایجاد صفحه Dashboard ساده

### 3. اصلاح مشکلات Prisma (۳ ساعت)
- اصلاح relation‌ها در schema.prisma
- رفع خطاهای constraint
- تنظیم صحیح متغیرهای محیطی دیتابیس
- تست مایگریشن و اتصال

### 4. تکمیل API های اصلی در سرور ساده (۲ ساعت)
- افزودن endpoint‌های ضروری به simple-server.js
- ایجاد API مناسب برای احراز هویت
- تست API ها با Postman

---

## 🎨 UI Components مورد نیاز:

### اولویت بالا:
- [x] LoadingSpinner / LoadingButton ✅
- [x] ErrorBoundary ✅
- [ ] Button variants
- [ ] Input components
- [ ] Modal/Dialog
- [ ] Toast notifications
- [ ] Card components

### اولویت متوسط:
- [ ] Navigation/Sidebar
- [ ] Header component
- [ ] Avatar component
- [ ] Badge/Tag component
- [ ] Dropdown/Select

---

## 📝 چک‌لیست به‌روزشده این هفته:

### Backend:
- [ ] تکمیل auth controller
- [ ] تکمیل user controller
- [ ] اصلاح مشکلات Prisma و schema.prisma
- [ ] تکمیل API های اصلی در سرور ساده
- [ ] تست پایانی endpoint های auth

### Frontend:
- [ ] ایجاد authService
- [ ] ایجاد apiService
- [ ] تکمیل صفحه Login
- [ ] ایجاد صفحه Register
- [ ] ایجاد Dashboard ساده
- [ ] اتصال به سرور ساده

### Integration:
- [ ] تست اتصال frontend به سرور ساده
- [ ] تست سیستم احراز هویت
- [ ] رفع خطاهای باقی‌مانده TypeScript

---

## 🎯 اهداف دو هفته آینده:

### هفته ۲ (فعلی):
- تکمیل authentication system
- اصلاح مشکلات Prisma و دیتابیس
- صفحات Login/Register/Dashboard
- رفع خطاهای TypeScript باقیمانده
- توسعه سرور ساده برای تست فرانت‌اند

### هفته ۳:
- رابط اصلی چت
- آپلود و مدیریت فایل
- اتصال به Gemini API
- ادغام سرور ساده و سرور اصلی

---

## 💡 نکات مهم و یادآوری‌ها:

1. **فونت وزیر** را در `public/fonts/` قرار دهید
2. **Environment variables** را از `.env.example` کپی کنید
3. **API Key** خود را در تنظیمات قرار دهید
4. **MySQL** باید با رمز `123` راه‌اندازی شود
5. **Ports** حتماً ۳۱۵۰ و ۵۱۵۰ باشند
6. **Types** را برای همه اجزا به دقت تعریف کنید
7. **PropTypes** را برای کامپوننت‌های React تعریف کنید
8. **تا زمان حل مشکلات Prisma** از سرور ساده استفاده کنید

---

## 🆘 در صورت مشکل:

### مشکلات رایج:
1. **CORS Error** → بررسی CORS settings در backend
2. **Database Connection** → بررسی MySQL و connection string
3. **TypeScript Errors** → بررسی types و imports
4. **Port Conflicts** → kill processes on ports 3150/5150
5. **Prisma Errors** → استفاده از سرور ساده تا رفع مشکلات

### Debug Commands:
```bash
# بررسی پورت‌ها
lsof -i :3150
lsof -i :5150

# کشتن پروسس‌های قدیمی
kill -9 $(lsof -t -i:3150)
kill -9 $(lsof -t -i:5150)

# لاگ‌های دیتابیس
mysql -u root -p123 -e "SHOW DATABASES;"

# تست API سرور ساده
curl http://localhost:5150/health

# اجرای سرور ساده
node backend/src/simple-server.js
```

---

**با توجه به پیشرفت‌های اخیر، استراتژی ما تغییر کرده است: ادامه توسعه با سرور ساده برای بخش فرانت‌اند و API های پایه، همزمان با اصلاح مشکلات Prisma و دیتابیس در بک‌اند.** 🚀