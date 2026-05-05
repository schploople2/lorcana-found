#!/bin/bash
set -e
cd "$(dirname "$0")"

echo "📦 Installing dependencies..."
npm install

echo ""
echo "✦ Starting Lorcana Found..."
echo "  Backend → http://localhost:3001"
echo "  Frontend → http://localhost:5173"
echo ""

npm run dev
