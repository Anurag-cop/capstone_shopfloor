# Shop Floor Resource Allocation - PowerShell Startup Script
# Usage: .\start-project.ps1

param(
    [switch]$NoBrowser = $false,
    [int]$Port = 3002
)

Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host "  SHOP FLOOR RESOURCE ALLOCATION - Development Server" -ForegroundColor Cyan
Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
$nodeCheck = node --version 2>$null
if (-not $nodeCheck) {
    Write-Host "ERROR: Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit..."
    exit 1
}

Write-Host "Node.js version: $nodeCheck" -ForegroundColor Green
Write-Host ""

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
    Write-Host ""
}

Write-Host "Starting development server on port $Port..." -ForegroundColor Green
Write-Host "Once started, open your browser to http://localhost:3003" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start the development server
npm run dev

# Keep window open
Read-Host "Press Enter to close..."
