@echo off
echo.
echo ====================================
echo   SoulSync AI - Quick Start
echo ====================================
echo.
echo Stopping old instances...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 >nul

echo.
echo Starting Backend Server...
start "SoulSync Backend" cmd /k "cd /d %~dp0 && npm run server:dev"
timeout /t 5 >nul

echo.
echo Starting Frontend Client...
start "SoulSync Frontend" cmd /k "cd /d %~dp0client && npm start"

echo.
echo ====================================
echo   Servers Starting...
echo ====================================
echo.
echo Wait 10-15 seconds, then open:
echo   http://localhost:3000
echo.
echo Two windows will open - don't close them!
echo ====================================
