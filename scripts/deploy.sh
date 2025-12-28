#!/bin/bash
# Deployment script for SoulSync

echo "🚀 Deploying SoulSync to Vercel..."

# Run verification first
echo "🧪 Running verification checks..."
npm run verify

if [ $? -ne 0 ]; then
    echo "❌ Verification failed. Please fix errors before deploying."
    exit 1
fi

# Build production
echo "🏗️  Building production bundle..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix errors before deploying."
    exit 1
fi

# Deploy to Vercel
echo "☁️  Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
