#!/bin/bash
# setup.sh - اسکریپت راه‌اندازی پروژه Gemini Pro Studio

echo "🚀 راه‌اندازی پروژه Gemini Pro Studio"
echo "=====================================\n"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "README.md" ] && [ ! -d "frontend" ] && [ ! -d "backend" ]; then
    print_status "فایل backend/.env ایجاد شد"
else
    print_warning "فایل backend/.env از قبل موجود است"
fi

# Frontend .env
if [ ! -f "frontend/.env" ]; then
    print_info "ایجاد فایل frontend/.env..."
    cat > frontend/.env << EOL
# API Configuration
REACT_APP_API_URL=http://localhost:5150/api
REACT_APP_APP_NAME="Gemini Pro Studio"
REACT_APP_VERSION="1.0.0"

# Development Configuration
GENERATE_SOURCEMAP=true
REACT_APP_NODE_ENV=development
EOL
    print_status "فایل frontend/.env ایجاد شد"
else
    print_warning "فایل frontend/.env از قبل موجود است"
fi

# Check MySQL connection
print_info "بررسی اتصال MySQL..."
mysql -u root -p123 -e "SELECT 1;" 2>/dev/null
if [ $? -eq 0 ]; then
    print_status "اتصال MySQL برقرار است"
    
    # Create database if not exists
    print_info "ایجاد دیتابیس..."
    mysql -u root -p123 -e "CREATE DATABASE IF NOT EXISTS gemini_pro_studio CHARACTER SET utf8mb4 COLLATE utf8mb4_persian_ci;" 2>/dev/null
    if [ $? -eq 0 ]; then
        print_status "دیتابیس ایجاد شد یا از قبل موجود است"
    else
        print_error "خطا در ایجاد دیتابیس"
    fi
else
    print_error "اتصال به MySQL برقرار نیست. لطفاً MySQL را با رمز 123 راه‌اندازی کنید"
    print_info "دستور راه‌اندازی MySQL:"
    print_info "mysql -u root -p"
fi

# Run Prisma migrations
print_info "اجرای Prisma migrations..."
cd backend
npx prisma generate 2>/dev/null
if [ $? -eq 0 ]; then
    print_status "Prisma client تولید شد"
else
    print_warning "خطا در تولید Prisma client - ممکن است بعداً نیاز باشد"
fi

npx prisma db push 2>/dev/null
if [ $? -eq 0 ]; then
    print_status "Schema به دیتابیس push شد"
else
    print_warning "خطا در push کردن schema - بعداً دوباره تلاش کنید"
fi

cd ..

# Create uploads directory
print_info "ایجاد پوشه uploads..."
mkdir -p backend/uploads
mkdir -p backend/uploads/images
mkdir -p backend/uploads/audio
print_status "پوشه‌های uploads ایجاد شدند"

# Create logs directory
print_info "ایجاد پوشه logs..."
mkdir -p backend/logs
print_status "پوشه logs ایجاد شد"

# Setup complete
echo ""
echo "🎉 راه‌اندازی با موفقیت تمام شد!"
echo "=================================="
echo ""
print_info "برای شروع سرور Backend:"
echo "cd backend && npm run dev"
echo ""
print_info "برای شروع Frontend:"
echo "cd frontend && npm start"
echo ""
print_info "آدرس‌های پروژه:"
echo "Frontend: http://localhost:3150"
echo "Backend:  http://localhost:5150"
echo "Health:   http://localhost:5150/health"
echo ""
print_warning "اگر مشکلی با MySQL دارید:"
echo "mysql -u root -p123 -e 'CREATE DATABASE gemini_pro_studio CHARACTER SET utf8mb4 COLLATE utf8mb4_persian_ci;'"
echo ""
print_status "همه چیز آماده است! 🚀"error "لطفاً این اسکریپت را در root directory پروژه اجرا کنید"
    exit 1
fi

print_info "شروع نصب dependencies..."

# Install backend dependencies
print_info "نصب Backend dependencies..."
cd backend
if [ ! -f "package.json" ]; then
    print_error "فایل package.json در backend یافت نشد"
    exit 1
fi

npm install
if [ $? -ne 0 ]; then
    print_error "خطا در نصب Backend dependencies"
    exit 1
fi
print_status "Backend dependencies نصب شدند"

# Install frontend dependencies
print_info "نصب Frontend dependencies..."
cd ../frontend
if [ ! -f "package.json" ]; then
    print_error "فایل package.json در frontend یافت نشد"
    exit 1
fi

npm install
if [ $? -ne 0 ]; then
    print_error "خطا در نصب Frontend dependencies"
    exit 1
fi
print_status "Frontend dependencies نصب شدند"

# Go back to root
cd ..

# Setup environment files
print_info "تنظیم فایل‌های Environment..."

# Backend .env
if [ ! -f "backend/.env" ]; then
    print_info "ایجاد فایل backend/.env..."
    cat > backend/.env << EOL
# Database Configuration
DATABASE_URL="mysql://root:123@localhost:3306/gemini_pro_studio"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# Server Configuration
PORT=5150
NODE_ENV=development
FRONTEND_URL="http://localhost:3150"

# Gemini API Configuration
GEMINI_API_KEY="AIzaSyBukmPng3eujEQQO22PMAF__plue1iKl6Y"

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_DIR="uploads"
EOL
    print_