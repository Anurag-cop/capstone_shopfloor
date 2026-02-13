@echo off
REM Shop Floor Resource Allocation - Quick Start Script
REM This script launches the development server and opens the project in your default browser

title Shop Floor Resource Allocation - Development Server
color 0A

echo.
echo ====================================================================
echo   SHOP FLOOR RESOURCE ALLOCATION - Development Server
echo ====================================================================
echo.
echo Starting development server...
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo Installing dependencies first...
    call npm install
    echo.
)

REM Start the dev server
npm run dev

pause
