#!/bin/bash
# install-deps.sh - نصب Dependencies مفقود

echo "📦 نصب Dependencies مفقود..."

cd frontend

# نصب testing dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event

# نصب web-vitals
npm install web-vitals

# نصب سایر dependencies مفقود
npm install @types/jest

echo "✅ Dependencies نصب شدند!"
echo ""
echo "🚀 حالا می‌تونید پروژه رو اجرا کنید:"
echo "npm start"