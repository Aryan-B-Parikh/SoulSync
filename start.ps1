# SoulSync AI - Complete Startup Script
# This script checks everything and starts the application

Write-Host "🚀 SoulSync AI - Complete Startup" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check Node.js
Write-Host "1️⃣ Checking Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version
if ($?) {
    Write-Host "   ✅ Node.js $nodeVersion installed" -ForegroundColor Green
} else {
    Write-Host "   ❌ Node.js not found!" -ForegroundColor Red
    exit 1
}

# Step 2: Check MongoDB connection
Write-Host ""
Write-Host "2️⃣ Testing MongoDB connection..." -ForegroundColor Yellow
$dbTest = node test-db.js 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ MongoDB connected successfully" -ForegroundColor Green
} else {
    Write-Host "   ❌ MongoDB connection failed!" -ForegroundColor Red
    Write-Host "   Error: $dbTest" -ForegroundColor Red
    Write-Host ""
    Write-Host "   Please check:" -ForegroundColor Yellow
    Write-Host "   - MONGODB_URI in .env file" -ForegroundColor Yellow
    Write-Host "   - MongoDB Atlas user/password" -ForegroundColor Yellow
    Write-Host "   - Network connectivity" -ForegroundColor Yellow
    exit 1
}

# Step 3: Check environment variables
Write-Host ""
Write-Host "3️⃣ Checking environment variables..." -ForegroundColor Yellow
$envContent = Get-Content .env -Raw
if ($envContent -match "GROQ_API_KEY=gsk_") {
    Write-Host "   ✅ GROQ_API_KEY configured" -ForegroundColor Green
} else {
    Write-Host "   ❌ GROQ_API_KEY missing or invalid!" -ForegroundColor Red
    exit 1
}
if ($envContent -match "JWT_SECRET=") {
    Write-Host "   ✅ JWT_SECRET configured" -ForegroundColor Green
} else {
    Write-Host "   ❌ JWT_SECRET missing!" -ForegroundColor Red
    exit 1
}
if ($envContent -match "MONGODB_URI=mongodb") {
    Write-Host "   ✅ MONGODB_URI configured" -ForegroundColor Green
} else {
    Write-Host "   ❌ MONGODB_URI missing!" -ForegroundColor Red
    exit 1
}

# Step 4: Check dependencies
Write-Host ""
Write-Host "4️⃣ Checking dependencies..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "   ✅ Root dependencies installed" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Installing root dependencies..." -ForegroundColor Yellow
    npm install
}
if (Test-Path "client/node_modules") {
    Write-Host "   ✅ Client dependencies installed" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Installing client dependencies..." -ForegroundColor Yellow
    cd client
    npm install
    cd ..
}

# Step 5: Stop any running instances
Write-Host ""
Write-Host "5️⃣ Stopping any running instances..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host "   ✅ Cleared old processes" -ForegroundColor Green

# Step 6: Start servers
Write-Host ""
Write-Host "6️⃣ Starting servers..." -ForegroundColor Yellow
Write-Host "   🔧 Starting backend on port 5001..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; Write-Host '🚀 SoulSync Backend Server' -ForegroundColor Cyan; Write-Host ''; npm run server:dev"
Start-Sleep -Seconds 5

Write-Host "   🎨 Starting frontend on port 3000..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\client'; Write-Host '🎨 SoulSync Frontend' -ForegroundColor Cyan; Write-Host ''; npm start"
Start-Sleep -Seconds 5

# Step 7: Verify servers are running
Write-Host ""
Write-Host "7️⃣ Verifying servers..." -ForegroundColor Yellow
Start-Sleep -Seconds 5
$backendRunning = Test-NetConnection -ComputerName localhost -Port 5001 -InformationLevel Quiet -WarningAction SilentlyContinue
$frontendRunning = Test-NetConnection -ComputerName localhost -Port 3000 -InformationLevel Quiet -WarningAction SilentlyContinue

if ($backendRunning) {
    Write-Host "   ✅ Backend running on http://localhost:5001" -ForegroundColor Green
} else {
    Write-Host "   ❌ Backend failed to start!" -ForegroundColor Red
}

if ($frontendRunning) {
    Write-Host "   ✅ Frontend running on http://localhost:3000" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Frontend still starting..." -ForegroundColor Yellow
}

# Final message
Write-Host ""
Write-Host "✨ =================================== ✨" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎉 SoulSync Starting!" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Open your browser:" -ForegroundColor Cyan
Write-Host "   http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "👤 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Wait 10-15 seconds for servers to fully start" -ForegroundColor White
Write-Host "   2. Click 'Register' to create an account" -ForegroundColor White
Write-Host "   3. Start chatting with AI!" -ForegroundColor White
Write-Host "   4. Your chats are saved forever 💾" -ForegroundColor White
Write-Host ""
Write-Host "✨ =================================== ✨" -ForegroundColor Cyan
