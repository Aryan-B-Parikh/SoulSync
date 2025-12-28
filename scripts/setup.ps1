# Setup script for SoulSync development environment (Windows PowerShell)

Write-Host "🚀 Setting up SoulSync development environment..." -ForegroundColor Green

# Check Node.js version
Write-Host "📦 Checking Node.js version..." -ForegroundColor Cyan
$nodeVersion = node -v
Write-Host "Node.js version: $nodeVersion" -ForegroundColor Yellow

# Check if .env exists
if (!(Test-Path .env)) {
    Write-Host "📝 Creating .env file from template..." -ForegroundColor Cyan
    Copy-Item .env.example .env
    Write-Host "⚠️  Please edit .env and add your GROQ_API_KEY" -ForegroundColor Yellow
} else {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
}

# Install root dependencies
Write-Host "📦 Installing root dependencies..." -ForegroundColor Cyan
npm install

# Install client dependencies
Write-Host "📦 Installing client dependencies..." -ForegroundColor Cyan
Set-Location client
npm install
Set-Location ..

Write-Host ""
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Edit .env and add your GROQ_API_KEY"
Write-Host "  2. Run 'npm run dev' to start development"
Write-Host ""
