# 🐞 مستندات خطاها و راه‌حل‌های پروژه Gemini Pro Studio

## 🔍 خطاهای شناسایی شده و راه‌حل‌ها

### ۱. خطای TypeScript - عدم پیدا کردن ماژول morgan

**خطا:**
```
TSError: ⨯ Unable to compile TypeScript:
src/server.ts(8,20): error TS7016: Could not find a declaration file for module 'morgan'.
```

**راه‌حل:**
```bash
npm install --save-dev @types/morgan
```

**توضیحات:** این خطا به دلیل عدم وجود فایل‌های تعریف TypeScript برای کتابخانه morgan بود. با نصب بسته @types/morgan و ایجاد فایل تعریف نوع سفارشی در `types/morgan.d.ts`، این مشکل رفع شد.

---

### ۲. خطای فایل‌های ماژول - عدم پیدا کردن فایل‌های وارد شده

**خطا:**
```
error TS2307: Cannot find module './middleware/rateLimiter' or its corresponding type declarations.
error TS2307: Cannot find module './config/redis' or its corresponding type declarations.
error TS2307: Cannot find module './middleware/errorHandler' or its corresponding type declarations.
```

**راه‌حل:**
1. ایجاد فایل‌های مورد نیاز که وجود نداشتند:
   - `backend/src/middleware/errorHandler.ts`
   - `backend/src/config/redis.ts`
   - `backend/src/config/socket.ts`
   - `backend/src/utils/jwt.ts`
   - `backend/src/utils/logger.ts`
   - و سایر فایل‌های import شده

**توضیحات:** این خطاها به دلیل عدم وجود فایل‌های مورد نیاز بود. با ایجاد این فایل‌ها، مشکل رفع شد.

---

### ۳. خطای React - allowedHosts

**خطا:**
```
Invalid options object. Dev Server has been initialized using an options object that does not match the API schema.
 - options.allowedHosts[0] should be a non-empty string.
```

**راه‌حل:**
اضافه کردن `DANGEROUSLY_DISABLE_HOST_CHECK=true` به اسکریپت استارت در `package.json`:

```json
"start": "GENERATE_SOURCEMAP=false PORT=3150 DANGEROUSLY_DISABLE_HOST_CHECK=true react-scripts start"
```

**توضیحات:** این خطا به دلیل محدودیت‌های سرور توسعه React در تنظیمات میزبان‌های مجاز بود. با اضافه کردن این متغیر محیطی، بررسی میزبان غیرفعال می‌شود.

---

### ۴. فایل‌های پایه ناقص در Backend

**مشکل:**
بسیاری از فایل‌های اصلی در بک‌اند ایجاد نشده بودند یا خالی بودند.

**راه‌حل:**
1. ایجاد فایل‌های routes:
   - `auth.ts`
   - `users.ts`
   - `health.ts`
   - و سایر فایل‌های route

2. ایجاد فایل‌های کانفیگ:
   - `redis.ts`
   - `socket.ts`

3. ایجاد فایل‌های middleware:
   - `errorHandler.ts`
   - `notFound.ts`
   - `auth.ts`
   - `rateLimiter.ts`

4. ایجاد فایل‌های utility:
   - `jwt.ts`
   - `logger.ts`

**توضیحات:** این مشکل به دلیل تکمیل نشدن ساختار پایه بک‌اند بود. با ایجاد فایل‌های مورد نیاز، ساختار پایه تکمیل شد.

---

### ۵. خطای TypeScript در کامپوننت Login

**خطا:**
```
Property 'loading' does not exist on type '...'. Did you mean 'isLoading'?
```

**راه‌حل:**
1. اصلاح کامپوننت LoginButton در Login.tsx:
   - تغییر prop `loading` به `isLoading`
   - استفاده از `text` به جای `children`

2. ایجاد کامپوننت LoadingButton در LoadingSpinner.tsx:
   - اضافه کردن کامپوننت LoadingButton با props مناسب

**توضیحات:** این خطا به دلیل تطابق نداشتن props استفاده شده با نوع تعریف شده بود. با ایجاد کامپوننت LoadingButton و تنظیم props مناسب، این مشکل رفع شد.

---

### ۶. خطای کامپایل TypeScript در فایل db_config.ts

**خطا:**
```
SyntaxError: Unterminated regular expression literal
```

**راه‌حل:**
- بررسی و اصلاح کدهای منبع در فایل db_config.ts
- تکمیل بلاک‌های کامنت ناقص
- اصلاح اشتباهات نحوی در عبارات منظم

**توضیحات:** این خطا به دلیل یک بلاک کامنت ناقص در فایل db_config.ts بود که باعث ایجاد یک عبارت منظم ناتمام شده بود.

---

### ۷. خطای تداخل فایل‌های دیتابیس در بک‌اند

**خطا:**
```
Multiple @prisma/client imports detected
```

**راه‌حل:**
- حذف فایل اضافی database.ts
- اصلاح و یکپارچه‌سازی منطق دیتابیس در db_config.ts
- اصلاح مسیرهای import در سایر فایل‌ها

**توضیحات:** این مشکل به دلیل وجود دو فایل تنظیمات دیتابیس (database.ts و db_config.ts) بود که هر دو Prisma Client را import می‌کردند و باعث تداخل می‌شدند.

---

### ۸. خطای اجرای Prisma (prisma generate)

**خطا:**
```
Error validating datasource `db`: the URL must not be empty
```

**راه‌حل:**
- بررسی و اصلاح فایل .env برای اطمینان از وجود DATABASE_URL
- اضافه کردن DATABASE_URL به .env:
```
DATABASE_URL="mysql://root:123@localhost:3306/gemini_pro_studio"
```

**توضیحات:** این خطا به دلیل عدم تنظیم صحیح متغیر محیطی DATABASE_URL در فایل .env بود.

---

### ۹. خطای اسکیمای Prisma

**خطا:**
```
Error: A unique constraint covering the columns `[userId,name]` on the table `Tag` already exists.
```

**راه‌حل:**
- اصلاح schema.prisma با افزودن پارامترهای map برای relation‌ها
- رفع مشکل تعریف constraint‌های تکراری
- اصلاح نام‌های خارجی و اضافه کردن فیلدهای مفقود

**توضیحات:** این خطا به دلیل تعریف نادرست روابط در اسکیما و وجود constraint‌های تکراری بود.

---

### ۱۰. خطای اجرای سرور TypeScript

**خطا:**
```
Error: @prisma/client did not initialize yet
```

**راه‌حل:**
1. ایجاد یک نسخه شبیه‌سازی شده موقت از Prisma client:
```typescript
// db_config.ts
export const prisma: any = {
  $connect: async () => {
    console.log('[FAKE_PRISMA] $connect called');
    return Promise.resolve();
  },
  // ...سایر متدها
};
```

2. ایجاد یک سرور ساده بدون وابستگی به Prisma:
- ایجاد فایل simple-server.js با Express بدون نیاز به TypeScript و Prisma

**توضیحات:** این راه‌حل موقت اجازه می‌دهد سرور بدون وابستگی به Prisma اجرا شود، در حالی که همچنان روی رفع مشکلات Prisma کار می‌کنیم.

---

## 📋 لیست خطاهای باقی‌مانده

1. **مشکلات پیکربندی Prisma**:
   - نیاز به تکمیل و اصلاح schema.prisma
   - نیاز به انجام مایگریشن‌ها
   - **راه‌حل:** انجام مایگریشن‌های Prisma و اصلاح اسکیما

2. **خطاهای مرتبط با دیتابیس**:
   - نیاز به راه‌اندازی صحیح MySQL با رمز 123
   - نیاز به اصلاح متغیرهای محیطی دیتابیس
   - **راه‌حل:** اطمینان از تنظیمات صحیح MySQL و متغیرهای محیطی

3. **خطاهای مرتبط با احراز هویت**:
   - با تکمیل نشدن فایل‌های کنترلر احراز هویت، ممکن است خطاهایی در مسیرهای احراز هویت ظاهر شود.
   - **راه‌حل:** تکمیل `authController.ts` و `middleware/auth.ts`.

---

## 🛠️ اقدامات پیشگیرانه

1. **اضافه کردن تست‌های واحد**:
   - برای جلوگیری از بروز خطاهای مشابه در آینده، باید تست‌های واحد اضافه شوند.

2. **استفاده از CI/CD**:
   - راه‌اندازی سیستم CI/CD برای شناسایی خطاها قبل از merge کردن تغییرات.

3. **پیاده‌سازی Linting**:
   - استفاده از ESLint و Prettier برای جلوگیری از خطاهای رایج.

4. **بررسی مستمر کد**:
   - بررسی منظم کد برای شناسایی و رفع خطاهای احتمالی.

5. **استفاده از سرورهای ساده موقت**:
   - برای توسعه مستقل بخش‌های مختلف، از سرورهای ساده استفاده کنید.

---

## 📅 بروزرسانی آخرین وضعیت (۲۳ خرداد ۱۴۰۳)

- **تعداد کل خطاهای شناسایی شده:** ۱۰
- **تعداد خطاهای رفع شده:** ۷
- **تعداد خطاهای باقی‌مانده:** ۳

پیشرفت قابل توجهی در رفع خطاها داشته‌ایم. بیشتر مشکلات ساختاری با ایجاد فایل‌های مورد نیاز و اصلاح کانفیگ‌ها حل شده است. برای مشکلات Prisma، یک راه‌حل موقت با ایجاد یک سرور ساده بدون وابستگی به Prisma و شبیه‌سازی Prisma client ایجاد شده است. این به ما اجازه می‌دهد تا روی اصلاح مشکلات Prisma کار کنیم، در حالی که سرور همچنان در دسترس است. 