# 📋 مستندات کامل پروژه Gemini Pro Studio

## 🎯 معرفی پروژه

**Gemini Pro Studio** یک وب‌اپلیکیشن حرفه‌ای و کامل برای استفاده از تمامی امکانات Google AI Studio API است که با تکنولوژی‌های مدرن و رابط کاربری زیبا طراحی شده است. این برنامه کاملاً ماژولار و با استفاده از فارسی به عنوان زبان اصلی پیاده‌سازی شده است.

## 🛠️ تکنولوژی‌های استفاده شده

### Frontend
- **React 18.2** - کتابخانه اصلی UI
- **TypeScript** - برای Type Safety
- **Tailwind CSS** - برای Styling
- **MUI (Material UI)** - برای کامپوننت‌های پایه
- **Framer Motion** - برای انیمیشن‌ها
- **React Query** - برای مدیریت State و Cache
- **React Router** - برای مسیریابی
- **Zustand** - برای مدیریت State گلوبال
- **React Hook Form** - برای مدیریت فرم‌ها
- **Moment-Jalaali** - برای تاریخ شمسی
- **PWA** - برای قابلیت نصب

### Backend
- **Node.js + Express.js** - سرور اصلی
- **TypeScript** - برای Type Safety
- **MySQL 8.0** - دیتابیس اصلی (پسورد root = 123)
- **Prisma ORM** - برای مدیریت دیتابیس
- **Multer** - برای آپلود فایل
- **Socket.io** - برای ارتباط Real-time
- **Winston** - برای Logging
- **Helmet + CORS** - برای امنیت
- **Redis** - برای caching و rate limiting
- **JWT** - برای احراز هویت

### UI/UX
- **فونت وزیر** - فونت اصلی فارسی
- **Material-UI Icons** - آیکون‌ها
- **Responsive Design** - طراحی ریسپانسیو
- **Dark/Light Theme** - تم شب و روز (پیش‌فرض حالت روشن)
- **PWA Ready** - آماده برای نصب به عنوان اپ
- **اعلان‌ها** - سیستم نوتیفیکیشن جامع

## 🎨 ویژگی‌های اصلی

### 1. 💬 سیستم چت پیشرفته
- چت تعاملی با Gemini Pro
- پشتیبانی از Markdown/RTF
- ذخیره تاریخچه مکالمات در دیتابیس
- دسته‌بندی چت‌ها با برچسب رنگی
- جستجوی پیشرفته در تاریخچه
- Export چت به PDF/Text/Word
- امکان استفاده از پرومپت‌های آماده
- امکان ذخیره پرومپت‌ها برای استفاده مجدد

### 2. 🎤 پردازش صوتی
- Speech to Text با دقت بالا
- Text to Speech با صداهای متنوع
- تحلیل فایل‌های صوتی
- ضبط صدا مستقیم از مرورگر
- پشتیبانی از فرمت‌های MP3، WAV، OGG و...
- ذخیره فایل‌های صوتی در سرور با لینک در دیتابیس
- تحلیل احساسات در صوت

### 3. 🖼️ پردازش تصویری
- تحلیل و توصیف تصاویر با Gemini Vision
- OCR (استخراج متن از تصویر) چندزبانه
- تشخیص اشیا، افراد و متن در تصاویر
- مقایسه تصاویر
- آپلود و ذخیره تصاویر در سرور
- ویرایش و بهینه‌سازی تصاویر
- ذخیره تصاویر در سرور با لینک در دیتابیس

### 4. 📝 تولید محتوا
- تولید مقاله و وبلاگ
- نوشتن شعر و داستان
- ترجمه متن
- خلاصه‌سازی
- تولید کد برنامه‌نویسی
- تولید ایمیل و نامه
- قالب‌های آماده برای انواع محتوا
- تنظیم پارامترهای دقیق تولید (دما، تنوع و...)

### 5. 📊 تحلیل و آمار
- آمار مصرف API
- تحلیل توکن‌ها و مانده اعتبار
- نمودار مصرف روزانه/ماهانه با نمایش گرافیکی
- گزارش‌گیری تفصیلی
- پیش‌بینی هزینه
- امکان Export گزارش‌ها به اکسل و PDF

### 6. 🏷️ سیستم برچسب‌گذاری حرفه‌ای
- ایجاد برچسب با رنگ دلخواه
- تخصیص رنگ تصادفی به هر برچسب (قابل تغییر)
- دسته‌بندی محتوا با برچسب‌ها
- فیلتر کردن بر اساس برچسب
- مدیریت برچسب‌ها (ویرایش، حذف، ادغام)
- امکان برچسب‌گذاری برای تمامی انواع محتوا

### 7. ⚙️ تنظیمات پیشرفته
- مدیریت API Keys برای Gemini
- تنظیمات مدل‌های AI
- کنترل پارامترهای تولید محتوا
- تنظیمات نمایش و رابط کاربری
- مدیریت کاربران و دسترسی‌ها
- پشتیبان‌گیری و بازیابی داده‌ها
- تنظیم تم و استایل برنامه

### 8. 🔐 امنیت و احراز هویت
- ورود با ایمیل/رمز عبور
- ورود با احراز هویت دو مرحله‌ای
- مدیریت نشست‌ها و توکن‌ها
- رمزگذاری داده‌های حساس
- سیستم مجوزهای چندسطحی
- گزارش‌های امنیتی

### 9. 📱 قابلیت‌های PWA
- نصب روی موبایل و دسکتاپ
- کار آفلاین با ذخیره داده‌ها
- اعلان‌های Push برای رویدادها
- مدیریت Cache برای سرعت بالا
- بروزرسانی خودکار
- سازگاری کامل با موبایل

### 10. 🌐 فارسی‌سازی کامل
- رابط کاربری کاملاً فارسی
- راست‌چین بودن تمام قسمت‌ها
- تاریخ شمسی با فرمت‌های متنوع
- فونت وزیر برای خوانایی بهتر
- پشتیبانی از اعداد فارسی/عربی
- قالب‌های تاریخ و زمان شمسی

## 🗂️ ساختار دیتابیس

### جداول اصلی:
- **users** - اطلاعات کاربران
  - `id` (PK)
  - `name`
  - `email`
  - `password` (hashed)
  - `role` (user, admin)
  - `isActive`
  - `createdAt`
  - `updatedAt`

- **api_keys** - کلیدهای API
  - `id` (PK)
  - `userId` (FK)
  - `name`
  - `key`
  - `isActive`
  - `createdAt`
  - `expiresAt`

- **conversations** - مکالمات چت
  - `id` (PK)
  - `userId` (FK)
  - `title`
  - `systemPrompt`
  - `modelName`
  - `temperature`
  - `maxTokens`
  - `createdAt`
  - `updatedAt`
  - `lastMessageAt`

- **messages** - پیام‌های چت
  - `id` (PK)
  - `conversationId` (FK)
  - `role` (user, assistant, system)
  - `content`
  - `contentType` (text, image, audio)
  - `fileUrl`
  - `createdAt`

- **files** - فایل‌های آپلود شده
  - `id` (PK)
  - `userId` (FK)
  - `filename`
  - `originalName`
  - `type` (image, audio, document)
  - `path`
  - `size`
  - `mimeType`
  - `createdAt`

- **tags** - برچسب‌ها
  - `id` (PK)
  - `userId` (FK)
  - `name`
  - `color`
  - `createdAt`
  - `updatedAt`

- **taggables** - ارتباط برچسب‌ها با سایر جداول
  - `tagId` (FK)
  - `taggableId`
  - `taggableType` (conversation, message, file)

- **usage_stats** - آمار مصرف
  - `id` (PK)
  - `userId` (FK)
  - `modelName`
  - `promptTokens`
  - `completionTokens`
  - `totalTokens`
  - `endpoint` (chat, vision, audio)
  - `createdAt`

- **settings** - تنظیمات
  - `id` (PK)
  - `userId` (FK)
  - `key`
  - `value`
  - `updatedAt`

- **templates** - قالب‌های آماده
  - `id` (PK)
  - `userId` (FK)
  - `name`
  - `content`
  - `category`
  - `createdAt`
  - `updatedAt`

## 📁 ساختار فایل‌ها

```
gemini-pro-studio/
├── 📁 frontend/                 # React App (Port: 3150)
│   ├── 📁 public/
│   │   ├── 📄 index.html
│   │   ├── 📄 manifest.json
│   │   ├── 📄 serviceworker.js
│   │   ├── 📄 favicon.ico
│   │   └── 📁 assets/
│   ├── 📁 src/
│   │   ├── 📁 components/       # کامپوننت‌های قابل استفاده مجدد
│   │   │   ├── 📁 chat/         # کامپوننت‌های چت
│   │   │   │   ├── 📄 ChatBubble.tsx
│   │   │   │   ├── 📄 ChatInput.tsx
│   │   │   │   ├── 📄 ChatHeader.tsx
│   │   │   │   └── 📄 MessageList.tsx
│   │   │   ├── 📁 ui/           # کامپوننت‌های UI پایه
│   │   │   │   ├── 📄 Button.tsx
│   │   │   │   ├── 📄 Input.tsx
│   │   │   │   ├── 📄 Modal.tsx
│   │   │   │   ├── 📄 Select.tsx
│   │   │   │   ├── 📄 LoadingSpinner.tsx
│   │   │   │   ├── 📄 LoadingButton.tsx
│   │   │   │   ├── 📄 ErrorBoundary.tsx
│   │   │   │   └── 📄 ThemeToggle.tsx
│   │   │   ├── 📁 forms/        # فرم‌ها
│   │   │   │   ├── 📄 LoginForm.tsx
│   │   │   │   ├── 📄 RegisterForm.tsx
│   │   │   │   └── 📄 SettingsForm.tsx
│   │   │   ├── 📁 layout/       # لایوت‌ها
│   │   │   │   ├── 📄 AppLayout.tsx
│   │   │   │   ├── 📄 Sidebar.tsx
│   │   │   │   ├── 📄 Header.tsx
│   │   │   │   └── 📄 Footer.tsx
│   │   │   ├── 📁 common/       # کامپوننت‌های عمومی
│   │   │   │   ├── 📄 Badge.tsx
│   │   │   │   ├── 📄 Card.tsx
│   │   │   │   ├── 📄 Avatar.tsx
│   │   │   │   └── 📄 Tooltip.tsx
│   │   │   ├── 📁 tags/         # کامپوننت‌های برچسب
│   │   │   │   ├── 📄 TagPicker.tsx
│   │   │   │   ├── 📄 TagManager.tsx
│   │   │   │   └── 📄 TagList.tsx
│   │   │   └── 📁 media/        # کامپوننت‌های رسانه
│   │   │       ├── 📄 AudioRecorder.tsx
│   │   │       ├── 📄 ImageUploader.tsx
│   │   │       └── 📄 FileViewer.tsx
│   │   ├── 📁 pages/           # صفحات اصلی
│   │   │   ├── 📁 auth/        # صفحات احراز هویت
│   │   │   │   ├── 📄 Login.tsx
│   │   │   │   ├── 📄 Register.tsx
│   │   │   │   ├── 📄 ForgotPassword.tsx
│   │   │   │   └── 📄 ResetPassword.tsx
│   │   │   ├── 📁 dashboard/   # صفحات داشبورد
│   │   │   │   ├── 📄 Dashboard.tsx
│   │   │   │   └── 📄 Analytics.tsx
│   │   │   ├── 📁 chat/        # صفحات چت
│   │   │   │   ├── 📄 Chat.tsx
│   │   │   │   ├── 📄 NewChat.tsx
│   │   │   │   └── 📄 ChatHistory.tsx
│   │   │   ├── 📁 settings/    # صفحات تنظیمات
│   │   │   │   ├── 📄 Settings.tsx
│   │   │   │   ├── 📄 Profile.tsx
│   │   │   │   └── 📄 ApiKeys.tsx
│   │   │   ├── 📁 image/       # صفحات پردازش تصویر
│   │   │   │   ├── 📄 ImageAnalysis.tsx
│   │   │   │   └── 📄 Ocr.tsx
│   │   │   ├── 📁 audio/       # صفحات پردازش صوتی
│   │   │   │   ├── 📄 SpeechToText.tsx
│   │   │   │   └── 📄 TextToSpeech.tsx
│   │   │   └── 📁 content/     # صفحات تولید محتوا
│   │   │       ├── 📄 ContentGenerator.tsx
│   │   │       └── 📄 Templates.tsx
│   │   ├── 📁 hooks/           # Custom Hooks
│   │   │   ├── 📄 useAuth.ts
│   │   │   ├── 📄 useChat.ts
│   │   │   ├── 📄 useToast.ts
│   │   │   └── 📄 useTheme.ts
│   │   ├── 📁 store/           # مدیریت State
│   │   │   ├── 📄 authStore.ts
│   │   │   ├── 📄 chatStore.ts
│   │   │   ├── 📄 settingsStore.ts
│   │   │   └── 📄 uiStore.ts
│   │   ├── 📁 services/        # API Calls
│   │   │   ├── 📄 apiService.ts
│   │   │   ├── 📄 authService.ts
│   │   │   ├── 📄 chatService.ts
│   │   │   ├── 📄 geminiService.ts
│   │   │   ├── 📄 fileService.ts
│   │   │   └── 📄 tagService.ts
│   │   ├── 📁 types/           # TypeScript Types
│   │   │   ├── 📄 api.types.ts
│   │   │   ├── 📄 chat.types.ts
│   │   │   ├── 📄 user.types.ts
│   │   │   └── 📄 common.types.ts
│   │   ├── 📁 utils/           # ابزارهای کمکی
│   │   │   ├── 📄 dateUtils.ts
│   │   │   ├── 📄 formatters.ts
│   │   │   ├── 📄 validators.ts
│   │   │   └── 📄 storage.ts
│   │   ├── 📁 assets/          # فایل‌های استاتیک
│   │   │   ├── 📁 fonts/
│   │   │   │   └── 📄 Vazir.ttf
│   │   │   ├── 📁 images/
│   │   │   └── 📁 icons/
│   │   ├── 📄 App.tsx          # کامپوننت اصلی
│   │   ├── 📄 index.tsx        # نقطه ورود
│   │   ├── 📄 theme.ts         # تنظیمات تم
│   │   └── 📄 routes.tsx       # تعریف مسیرها
│   ├── 📄 package.json
│   ├── 📄 tsconfig.json
│   ├── 📄 tailwind.config.js
│   └── 📄 .env
├── 📁 backend/                  # Node.js API (Port: 5150)
│   ├── 📁 src/
│   │   ├── 📁 routes/          # مسیرهای API
│   │   │   ├── 📄 auth.ts      # مسیرهای احراز هویت
│   │   │   ├── 📄 users.ts     # مسیرهای کاربران
│   │   │   ├── 📄 conversations.ts # مسیرهای گفتگو
│   │   │   ├── 📄 messages.ts  # مسیرهای پیام
│   │   │   ├── 📄 files.ts     # مسیرهای فایل
│   │   │   ├── 📄 tags.ts      # مسیرهای برچسب
│   │   │   ├── 📄 ai.ts        # مسیرهای هوش مصنوعی
│   │   │   └── 📄 health.ts    # مسیر بررسی وضعیت
│   │   ├── 📁 controllers/     # کنترلرها
│   │   │   ├── 📄 authController.ts
│   │   │   ├── 📄 userController.ts
│   │   │   ├── 📄 conversationController.ts
│   │   │   ├── 📄 messageController.ts
│   │   │   ├── 📄 fileController.ts
│   │   │   ├── 📄 tagController.ts
│   │   │   └── 📄 aiController.ts
│   │   ├── 📁 models/          # مدل‌های دیتابیس (Prisma)
│   │   │   └── 📄 index.ts
│   │   ├── 📁 middleware/      # میدل‌ویرها
│   │   │   ├── 📄 errorHandler.ts # مدیریت خطاها
│   │   │   ├── 📄 rateLimiter.ts  # محدودیت درخواست
│   │   │   ├── 📄 auth.ts         # احراز هویت
│   │   │   ├── 📄 upload.ts       # آپلود فایل
│   │   │   └── 📄 notFound.ts     # مدیریت 404
│   │   ├── 📁 services/        # سرویس‌ها
│   │   │   ├── 📄 geminiService.ts
│   │   │   ├── 📄 fileService.ts
│   │   │   ├── 📄 mailService.ts
│   │   │   └── 📄 socketService.ts
│   │   ├── 📁 config/          # تنظیمات
│   │   │   ├── 📄 database.ts  # تنظیمات MySQL
│   │   │   ├── 📄 redis.ts     # تنظیمات Redis
│   │   │   ├── 📄 socket.ts    # تنظیمات Socket.io
│   │   │   ├── 📄 multer.ts    # تنظیمات آپلود فایل
│   │   │   └── 📄 logger.ts    # تنظیمات لاگ
│   │   ├── 📁 utils/           # ابزارهای کمکی
│   │   │   ├── 📄 jwt.ts       # توابع JWT
│   │   │   ├── 📄 logger.ts    # سیستم لاگ
│   │   │   ├── 📄 validators.ts # اعتبارسنجی
│   │   │   ├── 📄 formatters.ts # فرمت‌کننده‌ها
│   │   │   └── 📄 helpers.ts   # توابع کمکی
│   │   ├── 📁 types/           # TypeScript Types
│   │   │   ├── 📄 gemini.d.ts  # تعاریف API گوگل
│   │   │   ├── 📄 express.d.ts # تعاریف اکسپرس
│   │   │   └── 📄 morgan.d.ts  # تعریف نوع Morgan
│   │   ├── 📄 server.ts        # فایل اصلی سرور
│   │   └── 📄 simple-server.js # سرور ساده بدون Prisma
│   ├── 📁 uploads/             # فایل‌های آپلود شده
│   │   ├── 📁 images/          # تصاویر
│   │   ├── 📁 audio/           # فایل‌های صوتی
│   │   └── 📁 documents/       # اسناد
│   ├── 📁 prisma/              # اسکیما و مایگریشن‌های دیتابیس
│   │   ├── 📄 schema.prisma
│   │   └── 📁 migrations/
│   ├── 📄 package.json
│   ├── 📄 tsconfig.json
│   ├── 📄 .env                 # متغیرهای محیطی
│   └── 📄 nodemon.json
├── 📁 database/                 # فایل‌های دیتابیس
│   ├── 📄 schema.sql           # اسکیمای MySQL
│   └── 📄 migrations.sql       # مایگریشن‌های دستی
├── 📁 docs/                     # مستندات
│   ├── 📄 project_documentation.md # مستندات کلی
│   ├── 📄 project_checklist_main.md # چک لیست اصلی
│   ├── 📄 error_solutions.md   # راه‌حل‌های خطاها
│   ├── 📄 next_steps_guide.md  # راهنمای گام‌های بعدی
│   ├── 📄 simple_server_guide.md # راهنمای سرور ساده
│   ├── 📁 development/         # مستندات توسعه
│   │   ├── 📄 coding_standards.md
│   │   ├── 📄 api_documentation.md
│   │   └── 📄 database_schema.md
│   ├── 📁 user-guide/          # راهنمای کاربر
│   │   ├── 📄 getting_started.md
│   │   ├── 📄 chat_guide.md
│   │   └── 📄 settings_guide.md
│   └── 📁 checklists/          # چک‌لیست‌های فازها
│       ├── 📄 phase1_checklist.md
│       ├── 📄 phase2_checklist.md
│       ├── 📄 phase3_checklist.md
│       └── 📄 phase4_checklist.md
└── 📄 README.md
```

## 🚀 وضعیت اجرایی فعلی (۲۵ خرداد ۱۴۰۳)

### پیشرفت کلی:
- **فاز 1:** ⬛⬛⬛⬛⬛⬜⬜⬜⬜⬜ (50%)
- **کل پروژه:** ⬛⬛⬜⬜⬜⬜⬜⬜⬜⬜ (20%)

### ویژگی‌های اجرا شده:
- ✅ راه‌اندازی کامل ساختار پروژه
- ✅ پیکربندی TypeScript
- ✅ میدل‌ویرهای اصلی بک‌اند
- ✅ روت‌های اولیه API
- ✅ کامپوننت‌های UI پایه (LoadingSpinner, LoadingButton, ErrorBoundary)
- ✅ سیستم احراز هویت با JWT
- ✅ سرور ساده برای توسعه بدون نیاز به دیتابیس
- ✅ API های پایه برای احراز هویت، گفتگو و پیام‌ها

### در حال اجرا:
- 🔄 اتصال دیتابیس MySQL با Prisma
- 🔄 کامپوننت‌های اصلی UI (Button, Input, Modal)
- 🔄 صفحات پایه فرانت‌اند
- 🔄 پیاده‌سازی تم شب/روز

### گام‌های بعدی:
- 🔜 تکمیل کامپوننت‌های UI پایه
- 🔜 پیاده‌سازی صفحه داشبورد
- 🔜 پیاده‌سازی سیستم چت
- 🔜 اتصال به API Gemini
- 🔜 سیستم برچسب‌گذاری

## 🎯 اهداف پروژه

### کوتاه مدت (فاز 1):
- راه‌اندازی کامل زیرساخت پروژه
- طراحی UI/UX اصلی با پشتیبانی از فارسی
- پیاده‌سازی سیستم احراز هویت
- اتصال به دیتابیس MySQL
- پیاده‌سازی تم شب/روز

### میان مدت (فاز 2):
- پیاده‌سازی سیستم چت کامل
- اتصال به تمام API های Gemini
- پیاده‌سازی پردازش تصویری و صوتی
- سیستم فایل و ذخیره‌سازی رسانه
- تولید محتوا با پارامترهای قابل تنظیم

### بلند مدت (فاز 3-4):
- سیستم برچسب‌گذاری با رنگ‌های تصادفی
- تحلیل و آمار مصرف
- تاریخ شمسی در تمام بخش‌ها
- بهینه‌سازی عملکرد
- قابلیت‌های پیشرفته PWA

## 🔧 نصب و راه‌اندازی

### پیش‌نیازها:
- Node.js 18+
- MySQL 8.0 (پسورد root = 123)
- npm/yarn
- Git

### دستورات راه‌اندازی:

```bash
# کلون کردن مخزن
git clone https://github.com/username/gemini-pro-studio.git
cd gemini-pro-studio

# نصب وابستگی‌های فرانت‌اند
cd frontend
npm install
cd ..

# نصب وابستگی‌های بک‌اند
cd backend
npm install

# راه‌اندازی دیتابیس
mysql -u root -p123 < database/schema.sql

# راه‌اندازی سرور ساده (بدون نیاز به دیتابیس)
npm run simple
# یا با قابلیت بارگذاری مجدد خودکار
npm run dev:simple

# در ترمینال جدید، راه‌اندازی فرانت‌اند
cd ../frontend
npm start
```

سپس برنامه در آدرس‌های زیر در دسترس خواهد بود:
- فرانت‌اند: http://localhost:3150
- بک‌اند: http://localhost:5150

## 📊 مدیریت توکن و اعتبار API

برنامه دارای سیستم مدیریت توکن و مانیتورینگ اعتبار API Gemini است:

- نمایش تعداد توکن استفاده شده در هر درخواست
- نمایش مانده اعتبار حساب
- هشدار برای اتمام اعتبار
- گزارش‌های مصرف روزانه/هفتگی/ماهانه
- تخمین هزینه بر اساس تعرفه‌های فعلی گوگل
- تنظیمات محدودیت مصرف برای جلوگیری از اتمام ناگهانی اعتبار
- پشتیبانی از چند API Key برای تقسیم بار

## 🌙 تم شب و روز

سیستم تم شب و روز به صورت یکپارچه در تمام برنامه پیاده‌سازی شده:

- تغییر خودکار بر اساس تنظیمات سیستم عامل
- امکان تغییر دستی توسط کاربر
- ذخیره تنظیمات در حافظه محلی
- پالت رنگی سازگار با چشم برای حالت شب
- طراحی متریال با سایه‌های مناسب برای هر حالت

## 🔒 حریم خصوصی و امنیت

- تمام داده‌های کاربران رمزگذاری شده
- پردازش در سمت سرور
- عدم ذخیره داده‌های حساس
- سیستم مجوز دسترسی چندسطحی
- محافظت در برابر حملات رایج (CSRF, XSS, SQL Injection)