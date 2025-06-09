#!/bin/bash
# final-setup.sh - نصب نهایی پروژه Gemini Pro Studio

echo "🔧 نصب نهایی پروژه Gemini Pro Studio"
echo "===================================="

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 1. پاک کردن فایل‌های مشکل‌دار
print_info "پاک کردن فایل‌های قدیمی..."

# حذف فایل‌های TypeScript که باید TSX باشند
find frontend/src -name "*.ts" -not -path "*/node_modules/*" | while read file; do
    if [[ "$file" != *"types"* ]] && [[ "$file" != *"utils"* ]] && [[ "$file" != *"services"* ]] && [[ "$file" != *"store"* ]]; then
        print_warning "حذف فایل مشکل‌دار: $file"
        rm -f "$file"
    fi
done

print_status "فایل‌های قدیمی پاک شدند"

# 2. نصب dependencies
print_info "نصب Frontend dependencies..."
cd frontend

# حذف node_modules و package-lock
rm -rf node_modules package-lock.json

# نصب dependencies اصلی
npm install react@18.2.0 react-dom@18.2.0 typescript@4.9.5
npm install react-router-dom@6.20.1 @types/react-router-dom
npm install zustand@4.4.7 axios@1.6.2 react-hot-toast@2.4.1
npm install @types/node @types/react @types/react-dom
npm install react-scripts@5.0.1 web-vitals

# نصب dev dependencies
npm install --save-dev tailwindcss@3.3.6 autoprefixer postcss

print_status "Frontend dependencies نصب شدند"

cd ..

# 3. Backend dependencies
print_info "نصب Backend dependencies..."
cd backend

rm -rf node_modules package-lock.json

npm install express@4.18.2 @types/express
npm install cors@2.8.5 @types/cors
npm install bcryptjs@2.4.3 @types/bcryptjs
npm install jsonwebtoken@9.0.2 @types/jsonwebtoken
npm install mysql2@3.6.5 @prisma/client@5.7.1
npm install dotenv@16.3.1 helmet@7.1.0
npm install express-rate-limit@7.1.5 compression@1.7.4
npm install winston@3.11.0 morgan@1.10.0 @types/morgan

# Dev dependencies
npm install --save-dev typescript@5.3.3 ts-node@10.9.1
npm install --save-dev nodemon@3.0.2 prisma@5.7.1
npm install --save-dev @types/node

print_status "Backend dependencies نصب شدند"

cd ..

# 4. ایجاد فایل‌های پیکربندی
print_info "ایجاد فایل‌های پیکربندی..."

# Frontend .env
cat > frontend/.env << 'EOF'
REACT_APP_API_URL=http://localhost:5150/api
REACT_APP_APP_NAME="Gemini Pro Studio"
GENERATE_SOURCEMAP=false
PORT=3150
EOF

# Backend .env
cat > backend/.env << 'EOF'
# Database
DATABASE_URL="mysql://root:123@localhost:3306/gemini_pro_studio"

# JWT
JWT_SECRET="gemini-pro-studio-secret-key-2024"
JWT_EXPIRES_IN="7d"

# Server
PORT=5150
NODE_ENV=development
FRONTEND_URL="http://localhost:3150"

# Gemini API
GEMINI_API_KEY="AIzaSyBukmPng3eujEQQO22PMAF__plue1iKl6Y"
EOF

# Tailwind config
cat > frontend/tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
EOF

# PostCSS config
cat > frontend/postcss.config.js << 'EOF'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF

print_status "فایل‌های پیکربندی ایجاد شدند"

# 5. ایجاد index.css
print_info "ایجاد فایل CSS..."

cat > frontend/src/index.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

/* RTL Support */
body {
  direction: rtl;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}
EOF

print_status "فایل CSS ایجاد شد"

# 6. ایجاد پوشه‌های مورد نیاز
print_info "ایجاد ساختار پوشه‌ها..."

mkdir -p frontend/src/components/ui
mkdir -p frontend/src/components/routing
mkdir -p frontend/src/pages/auth
mkdir -p frontend/src/services
mkdir -p frontend/src/store
mkdir -p backend/src/controllers
mkdir -p backend/src/routes
mkdir -p backend/src/middleware
mkdir -p backend/uploads
mkdir -p backend/logs

print_status "ساختار پوشه‌ها ایجاد شد"

# 7. تست MySQL
print_info "تست اتصال MySQL..."
if mysql -u root -p123 -e "SELECT 1;" 2>/dev/null; then
    mysql -u root -p123 -e "CREATE DATABASE IF NOT EXISTS gemini_pro_studio CHARACTER SET utf8mb4 COLLATE utf8mb4_persian_ci;"
    print_status "دیتابیس MySQL آماده است"
else
    print_error "MySQL متصل نیست. لطفاً MySQL را با رمز 123 راه‌اندازی کنید"
fi

# 8. Prisma setup
print_info "راه‌اندازی Prisma..."
cd backend
if [ -f "prisma/schema.prisma" ]; then
    npx prisma generate 2>/dev/null || print_warning "Prisma generate failed"
    npx prisma db push 2>/dev/null || print_warning "Prisma db push failed"
fi
cd ..

echo ""
print_status "🎉 نصب نهایی تکمیل شد!"
echo ""
print_info "برای شروع پروژه:"
echo "  1. Terminal اول: cd backend && npm run dev"
echo "  2. Terminal دوم: cd frontend && npm start"
echo ""
print_info "آدرس‌ها:"
echo "  Frontend: http://localhost:3150"
echo "  Backend:  http://localhost:5150"
echo ""
print_warning "اگر مشکلی بود، فایل‌های artifacts را جایگزین کنید"