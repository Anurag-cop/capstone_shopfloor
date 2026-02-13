#!/bin/bash
# Shop Floor Resource Allocation - Quick Start Script (macOS/Linux)
# This script launches the development server for the project

echo "===================================================================="
echo "  SHOP FLOOR RESOURCE ALLOCATION - Development Server"
echo "===================================================================="
echo ""
echo "Starting development server..."
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies first..."
    npm install
    echo ""
fi

# Start the dev server
npm run dev

# Keep terminal open on exit
read -p "Press Enter to close..."
