@echo off
:: 🚀 Padma Catering - Local Development Launcher (Windows)
:: Run this script to start all development servers

setlocal enabledelayedexpansion

echo.
echo ========================================
echo 🚀 Padma Catering - Development Launch
echo ========================================
echo.

:: Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js not installed. Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)

echo ✓ Node.js found: 
node --version

:: Check if .env exists
if not exist "server\.env" (
    echo.
    echo ⚠️  Warning: server\.env not found
    echo Please copy server\.env.example to server\.env and fill in your values
    echo.
    pause
    exit /b 1
)

echo ✓ Environment file exists
echo.

:: Verify dependencies
echo Checking dependencies...
if not exist "server\node_modules" (
    echo Installing server dependencies...
    cd server
    call npm install
    cd ..
)

if not exist "booking-portal\node_modules" (
    echo Installing booking portal dependencies...
    cd booking-portal
    call npm install
    cd ..
)

if not exist "main-site\node_modules" (
    echo Installing main site dependencies...
    cd main-site
    call npm install
    cd ..
)

echo ✓ Dependencies ready
echo.

:: Start services
echo.
echo ========================================
echo ⏱️  Starting Services...
echo ========================================
echo.
echo Opening new terminals for each service...
echo.

start cmd /k "cd server && npm run dev"
timeout /t 2 /nobreak

start cmd /k "cd main-site && npm run dev"
timeout /t 2 /nobreak

start cmd /k "cd booking-portal && npm run dev"
timeout /t 2 /nobreak

echo.
echo ========================================
echo ✅ Services Starting!
echo ========================================
echo.
echo 📍 URLs to access:
echo.
echo   🏠 Main Site:        http://localhost:5173/padmacateringsite/
echo   📅 Booking Portal:   http://localhost:5174/booking/
echo   🔧 API:              http://localhost:3001/api
echo   👨‍💼 Admin Panel:      http://localhost:5173/padmacateringsite/admin/
echo.
echo 🔑 Admin Credentials:
echo   Email: admin@padmacatering.com
echo   Password: admin123
echo.
echo 📋 Logs will appear in terminal windows above
echo.
echo ⏹️  To stop: Close each terminal window or press Ctrl+C
echo.
echo ========================================
echo.

pause
