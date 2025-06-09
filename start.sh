#!/bin/bash
# start.sh - اسکریپت شروع پروژه Gemini Pro Studio

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

echo "🚀 شروع Gemini Pro Studio"
echo "========================="
echo ""

# Check if setup was run
if [ ! -f "backend/.env" ] || [ ! -f "frontend/.env" ]; then
    print_warning "فایل‌های .env یافت نشدند. لطفاً ابتدا setup.sh را اجرا کنید"
    echo "bash setup.sh"
    exit 1
fi

# Check if dependencies are installed
if [ ! -d "backend/node_modules" ]; then
    print_error "Backend dependencies نصب نشده‌اند. لطفاً setup.sh را اجرا کنید"
    exit 1
fi

if [ ! -d "frontend/node_modules" ]; then
    print_error "Frontend dependencies نصب نشده‌اند. لطفاً setup.sh را اجرا کنید"
    exit 1
fi

# Function to check if port is in use
check_port() {
    lsof -i :$1 >/dev/null 2>&1
    return $?
}

# Check if ports are available
if check_port 5150; then
    print_warning "پورت 5150 (Backend) در حال استفاده است"
    print_info "برای متوقف کردن: lsof -ti:5150 | xargs kill -9"
fi

if check_port 3150; then
    print_warning "پورت 3150 (Frontend) در حال استفاده است"
    print_info "برای متوقف کردن: lsof -ti:3150 | xargs kill -9"
fi

# Check MySQL connection
print_info "بررسی اتصال MySQL..."
mysql -u root -p123 -e "SELECT 1;" 2>/dev/null
if [ $? -ne 0 ]; then
    print_error "اتصال به MySQL برقرار نیست. لطفاً MySQL را راه‌اندازی کنید"
    exit 1
fi
print_status "MySQL متصل است"

# Start backend in background
print_info "شروع Backend Server..."
cd backend
npm run dev > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait a bit for backend to start
sleep 3

# Check if backend started successfully
if kill -0 $BACKEND_PID 2>/dev/null; then
    print_status "Backend Server در پورت 5150 شروع شد"
else
    print_error "خطا در شروع Backend Server"
    print_info "لاگ Backend را بررسی کنید: tail -f backend.log"
    exit 1
fi

# Start frontend
print_info "شروع Frontend Development Server..."
cd frontend

# Set port for frontend
export PORT=3150

print_info "Frontend در حال بارگذاری... (ممکن است چند دقیقه طول بکشد)"
print_info ""
print_info "🌐 آدرس‌های دسترسی:"
echo "Frontend: http://localhost:3150"
echo "Backend:  http://localhost:5150"
echo "API Health: http://localhost:5150/health"
print_info ""
print_warning "برای توقف: Ctrl+C را فشار دهید"
print_info ""

# Start frontend (this will block)
npm start

# Cleanup when script exits
cleanup() {
    print_info "در حال توقف سرورها..."
    kill $BACKEND_PID 2>/dev/null
    print_status "سرورها متوقف شدند"
}

trap cleanup EXIT