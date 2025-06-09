# 🤖 Gemini Pro Studio

یک وب‌اپلیکیشن حرفه‌ای و کامل برای استفاده از Google AI Studio API

## 🚀 راه‌اندازی سریع

```bash
# نصب dependencies
cd frontend && npm install
cd ../backend && npm install

# راه‌اندازی دیتابیس (در صورت استفاده از سرور اصلی)
mysql -u root -p123 < database/schema.sql

# اجرا در حالت توسعه
npm run dev
```

### 🔄 استفاده از سرور ساده (بدون نیاز به دیتابیس)

در صورتی که با مشکلات Prisma مواجه هستید، می‌توانید از سرور ساده استفاده کنید:

```bash
# اجرای سرور ساده
cd backend && npm run simple

# اجرای فرانت‌اند
cd frontend && npm run dev
```

برای جزئیات بیشتر به [راهنمای سرور ساده](docs/simple_server_guide.md) مراجعه کنید.

## 📁 ساختار پروژه

- `frontend/` - React TypeScript App (Port: 3150)
- `backend/` - Node.js Express API (Port: 5150)
- `database/` - MySQL Schema و Migrations
- `docs/` - مستندات پروژه

## 🛠️ تکنولوژی‌ها

- Frontend: React 18.2, TypeScript, Tailwind CSS
- Backend: Node.js, Express, MySQL, Prisma
- UI: Material-UI, فونت وزیر
- Real-time: Socket.io

## 📝 مستندات

- [راهنمای توسعه](docs/development_guide.md)
- [راهنمای سرور ساده](docs/simple_server_guide.md)
- [چک‌لیست پروژه](docs/project_checklist_main.md)
- [راه‌حل‌های خطاها](docs/error_solutions.md)
