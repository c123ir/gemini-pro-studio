# دستورات راه‌اندازی کامل پروژه Gemini Pro Studio

# 1. ایجاد پوشه اصلی پروژه
mkdir gemini-pro-studio
cd gemini-pro-studio

# 2. ایجاد ساختار کلی پوشه‌ها
mkdir frontend backend database docs uploads

# 3. راه‌اندازی Frontend (React + TypeScript)
cd frontend
npx create-react-app . --template typescript
npm install @types/react @types/react-dom

# نصب کتابخانه‌های اصلی Frontend
npm install \
  @emotion/react @emotion/styled \
  @mui/material @mui/icons-material \
  @tanstack/react-query \
  @reduxjs/toolkit react-redux \
  react-router-dom \
  zustand \
  react-hook-form \
  dayjs dayjs-plugin-jalali \
  framer-motion \
  axios \
  socket.io-client \
  react-hot-toast \
  react-dropzone \
  recharts \
  react-markdown \
  @types/node

# نصب Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# 4. راه‌اندازی Backend (Node.js + TypeScript)
cd ../backend
npm init -y
npm install \
  express \
  cors \
  helmet \
  morgan \
  dotenv \
  bcryptjs \
  jsonwebtoken \
  mysql2 \
  @prisma/client \
  multer \
  socket.io \
  winston \
  joi \
  express-rate-limit \
  compression \
  express-validator

# نصب DevDependencies برای Backend
npm install -D \
  @types/express \
  @types/cors \
  @types/bcryptjs \
  @types/jsonwebtoken \
  @types/multer \
  @types/node \
  typescript \
  ts-node \
  nodemon \
  prisma

# راه‌اندازی TypeScript
npx tsc --init

# راه‌اندازی Prisma
npx prisma init

# 5. ایجاد ساختار پوشه‌های Frontend
cd ../frontend/src
mkdir -p \
  components/common \
  components/layout \
  components/chat \
  components/forms \
  components/ui \
  pages/auth \
  pages/dashboard \
  pages/chat \
  pages/media \
  pages/settings \
  hooks \
  services \
  store \
  types \
  utils \
  assets/fonts \
  assets/images \
  assets/icons \
  styles

# 6. ایجاد ساختار پوشه‌های Backend
cd ../../backend
mkdir -p \
  src/controllers \
  src/routes \
  src/middleware \
  src/services \
  src/models \
  src/utils \
  src/types \
  src/config \
  uploads/images \
  uploads/audio \
  uploads/documents \
  logs

# 7. ایجاد ساختار مستندات
cd ../docs
mkdir -p \
  checklists/phase1 \
  checklists/phase2 \
  checklists/phase3 \
  checklists/phase4 \
  api \
  user-guide \
  development

# 8. ایجاد فایل‌های تنظیمات اولیه
cd ../

# ایجاد .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Production builds
/frontend/build
/backend/dist

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
logs
*.log

# Database
*.db
*.sqlite

# Uploads
uploads/*
!uploads/.gitkeep

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# Prisma
/backend/prisma/migrations/
EOF

# ایجاد README.md اصلی
cat > README.md << 'EOF'
# 🤖 Gemini Pro Studio

یک وب‌اپلیکیشن حرفه‌ای و کامل برای استفاده از Google AI Studio API

## 🚀 راه‌اندازی سریع

```bash
# نصب dependencies
cd frontend && npm install
cd ../backend && npm install

# راه‌اندازی دیتابیس
mysql -u root -p123 < database/schema.sql

# اجرا در حالت توسعه
npm run dev
```

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
EOF

# ایجاد package.json اصلی برای مدیریت کل پروژه
cat > package.json << 'EOF'
{
  "name": "gemini-pro-studio",
  "version": "1.0.0",
  "description": "Professional Gemini Pro Studio Application",
  "scripts": {
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:frontend": "cd frontend && npm start",
    "dev:backend": "cd backend && npm run dev",
    "build": "cd frontend && npm run build",
    "install:all": "npm install && cd frontend && npm install && cd ../backend && npm install",
    "db:setup": "cd backend && npx prisma migrate dev",
    "db:seed": "cd backend && npx prisma db seed"
  },
  "devDependencies": {
    "concurrently": "^7.6.0"
  }
}
EOF

# نصب concurrently برای اجرای همزمان
npm install

echo "✅ ساختار پروژه با موفقیت ایجاد شد!"
echo ""
echo "🔧 مراحل بعدی:"
echo "1. cd frontend && npm install"
echo "2. cd ../backend && npm install"
echo "3. راه‌اندازی MySQL و ایجاد دیتابیس"
echo "4. تنظیم فایل .env"
echo "5. اجرای npm run dev"
echo ""
echo "📖 برای اطلاعات بیشتر به docs/project-overview.md مراجعه کنید"