# ✅ چک‌لیست فاز ۱: راه‌اندازی زیرساخت

## 📊 اطلاعات کلی فاز
- **مدت زمان:** هفته ۱-۲
- **اولویت:** بحرانی 🔴
- **تیم مسئول:** Backend + Frontend
- **پیش‌نیازها:** Node.js, MySQL, Git

---

## 🛠️ بخش ۱: راه‌اندازی پروژه

### مرحله ۱.۱: ایجاد ساختار فولدرها
- [ ] ایجاد پوشه اصلی `gemini-pro-studio`
- [ ] ایجاد زیرپوشه‌های `frontend`, `backend`, `database`, `docs`
- [ ] ایجاد پوشه‌های `uploads`, `logs` در backend
- [ ] تنظیم `.gitignore` مناسب
- [ ] ایجاد `README.md` اولیه

**زمان تخمینی:** ۳۰ دقیقه  
**مسئول:** Developer  
**وضعیت:** ⬜ در انتظار

---

### مرحله ۱.۲: راه‌اندازی Backend
- [ ] ایجاد پروژه Node.js جدید
- [ ] نصب کتابخانه‌های اصلی (Express, TypeScript, etc.)
- [ ] تنظیم `package.json` با scripts مناسب
- [ ] راه‌اندازی TypeScript configuration
- [ ] ایجاد ساختار فولدرهای src
- [ ] تنظیم ESLint و Prettier
- [ ] ایجاد فایل `.env.example`
- [ ] تست اولیه سرور Express

**زمان تخمینی:** ۲ ساعت  
**مسئول:** Backend Developer  
**وضعیت:** ⬜ در انتظار

**نکات مهم:**
- حتماً از پورت ۵۱۵۰ استفاده کنید
- فایل‌های حساس را در `.env` قرار دهید
- ساختار مجزا برای routes, controllers, services

---

### مرحله ۱.۳: راه‌اندازی Frontend
- [ ] ایجاد پروژه React با TypeScript template
- [ ] نصب کتابخانه‌های UI (Material-UI, Tailwind)
- [ ] تنظیم Tailwind CSS
- [ ] اضافه کردن فونت وزیر
- [ ] تنظیم React Router
- [ ] ایجاد ساختار فولدرهای اصلی
- [ ] راه‌اندازی React Query
- [ ] تنظیم پورت ۳۱۵۰

**زمان تخمینی:** ۲ ساعت  
**مسئول:** Frontend Developer  
**وضعیت:** ⬜ در انتظار

**نکات مهم:**
- استفاده از React 18.2
- Lazy loading برای صفحات
- Error boundaries برای مدیریت خطا

---

## 🗄️ بخش ۲: طراحی و راه‌اندازی دیتابیس

### مرحله ۲.۱: طراحی Schema
- [ ] تحلیل نیازمندی‌های دیتا
- [ ] طراحی ERD (Entity Relationship Diagram)
- [ ] تعریف جداول اصلی (users, conversations, messages, etc.)
- [ ] تعریف روابط بین جداول
- [ ] تعیین ایندکس‌های مناسب
- [ ] بررسی نرمال‌سازی دیتابیس

**زمان تخمینی:** ۳ ساعت  
**مسئول:** Database Designer  
**وضعیت:** ⬜ در انتظار

**جداول اصلی:**
- users (کاربران)
- api_keys (کلیدهای API)
- conversations (مکالمات)
- messages (پیام‌ها)
- files (فایل‌ها)
- tags (برچسب‌ها)
- usage_stats (آمار استفاده)
- settings (تنظیمات)

---

### مرحله ۲.۲: ایجاد دیتابیس
- [ ] نصب MySQL 8.0
- [ ] ایجاد دیتابیس `gemini_pro_studio`
- [ ] تنظیم کاراکتر ست UTF8MB4
- [ ] ایجاد کاربر MySQL مخصوص پروژه
- [ ] اجرای فایل schema.sql
- [ ] بررسی جداول ایجاد شده
- [ ] ایجاد دیتای نمونه (seed data)

**زمان تخمینی:** ۱ ساعت  
**مسئول:** Database Administrator  
**وضعیت:** ⬜ در انتظار

**تنظیمات MySQL:**
```sql
CREATE DATABASE gemini_pro_studio 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_persian_ci;
```

---

### مرحله ۲.۳: راه‌اندازی Prisma ORM
- [ ] نصب Prisma CLI
- [ ] راه‌اندازی Prisma در پروژه
- [ ] تنظیم `schema.prisma`
- [ ] اجرای `prisma generate`
- [ ] ایجاد migration اولیه
- [ ] تست اتصال به دیتابیس
- [ ] راه‌اندازی Prisma Studio

**زمان تخمینی:** ۱.۵ ساعت  
**مسئول:** Backend Developer  
**وضعیت:** ⬜ در انتظار

---

## 🎨 بخش ۳: UI Framework و Theme

### مرحله ۳.۱: راه‌اندازی Theme System
- [ ] ایجاد Theme Provider
- [ ] تعریف رنگ‌های اصلی و فرعی
- [ ] پیاده‌سازی Dark/Light mode
- [ ] تنظیم فونت وزیر
- [ ] ایجاد متغیرهای CSS
- [ ] تست تغییر تم

**زمان تخمینی:** ۲ ساعت  
**مسئول:** UI/UX Developer  
**وضعیت:** ⬜ در انتظار

**رنگ‌های اصلی:**
- Primary: #2196F3 (آبی گوگل)
- Secondary: #22C55E (سبز)
- Accent: #F97316 (نارنجی)
- Error: #EF4444 (قرمز)

---

### مرحله ۳.۲: کامپوننت‌های پایه
- [ ] ایجاد Button components
- [ ] ایجاد Input components
- [ ] ایجاد Modal components
- [ ] ایجاد Loading Spinner
- [ ] ایجاد Toast notifications
- [ ] ایجاد Card components
- [ ] تست تمام کامپوننت‌ها

**زمان تخمینی:** ۳ ساعت  
**مسئول:** Frontend Developer  
**وضعیت:** ⬜ در انتظار

---

### مرحله ۳.۳: Layout و Navigation
- [ ] طراحی Layout اصلی
- [ ] ایجاد Sidebar navigation
- [ ] ایجاد Header component
- [ ] ایجاد Breadcrumb
- [ ] پیاده‌سازی Responsive design
- [ ] تست در سایزهای مختلف

**زمان تخمینی:** ۴ ساعت  
**مسئول:** Frontend Developer  
**وضعیت:** ⬜ در انتظار

---

## 🔐 بخش ۴: سیستم احراز هویت

### مرحله ۴.۱: Backend Authentication
- [ ] ایجاد User model
-