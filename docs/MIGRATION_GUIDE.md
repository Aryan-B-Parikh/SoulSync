# 🔄 Migration Guide - Moving to New Structure

This guide helps you transition from the old project structure to the new refactored version.

## 🚨 Important: Backup First!

```bash
# Create a backup branch before starting
git checkout -b backup-pre-refactor
git push origin backup-pre-refactor

# Return to main work branch
git checkout SRC_A
```

## 📋 Migration Checklist

### Phase 1: Environment Setup

- [ ] **1. Copy environment variables**
  ```bash
  # Your old .env file should still work, but verify:
  cp .env .env.backup
  cp .env.example .env.new
  # Manually copy your keys from .env.backup to .env
  ```

- [ ] **2. Install new dependencies**
  ```bash
  # Root level
  npm install
  
  # Client
  cd client && npm install && cd ..
  ```

### Phase 2: File Migration

#### Files to Keep (Already Migrated)
- ✅ `api/chat.js` - Keep for Vercel deployment
- ✅ `api/chat-fallback.js` - Keep for Vercel deployment
- ✅ `tailwind.config.js` - Updated
- ✅ `postcss.config.js` - Keep as-is
- ✅ `vercel.json` - Updated

#### Files to Archive (Old Structure)
These old files are replaced by the new structure. Move them to an `_archive` folder:

```bash
# Create archive folder
mkdir _archive

# Move old files
mv src/ _archive/src_old
mv public/ _archive/public_old
mv server.js _archive/
mv server-huggingface.js _archive/
mv server-mock.js _archive/
mv build/ _archive/ 2>/dev/null || true
```

#### Files to Delete (Security!)
```bash
# DELETE these if they exist (NEVER commit secrets!)
rm -f key.txt
rm -f *.key
rm -f *.pem
```

### Phase 3: Update Your Workflow

#### Old Commands → New Commands

| Old Command | New Command | Purpose |
|------------|-------------|---------|
| `npm start` | `cd client && npm start` | Run frontend only |
| `npm run server` | `npm run server:dev` | Run backend only |
| `npm run dev` | `npm run dev` | Run both (updated) |
| `npm run build` | `npm run build` | Build frontend |

#### New Available Commands
```bash
npm run dev              # Run frontend + backend concurrently
npm run client:dev       # Run frontend only
npm run server:dev       # Run backend only
npm run server:start     # Run backend (production mode)
npm test                 # Run all tests
npm run test:client      # Run frontend tests only
npm run test:server      # Run backend tests only
npm run lint             # Lint codebase
npm run format           # Format with Prettier
```

### Phase 4: Code Migration (If You Had Custom Changes)

#### If you modified `src/App.js`:

Your changes are likely in one of these categories:

1. **UI/Styling Changes** → Update in `client/src/components/`
2. **State Logic** → Update in `client/src/hooks/useChat.js`
3. **API Calls** → Update in `client/src/utils/api.js`
4. **Configuration** → Update in `client/src/config/constants.js`

#### If you modified server files:

1. **API Routes** → Update in `server/routes/chat.js`
2. **AI Logic** → Update in `server/services/aiService.js`
3. **Middleware** → Update in `server/middleware/`

### Phase 5: Testing Migration

```bash
# Test the new setup
npm run dev

# In another terminal, test backend
curl http://localhost:5001/api/health

# Should return:
# {"status":"healthy","timestamp":"...","uptime":...}

# Test frontend
# Open browser to http://localhost:3000
# Send a test message
```

### Phase 6: Deployment Migration

#### Vercel Deployment

Your Vercel deployment should work with minimal changes:

1. **Update Environment Variables in Vercel Dashboard**:
   - `GROQ_API_KEY` (required)
   - `NODE_ENV=production`
   - `CORS_ORIGIN` (optional, set to your domain)

2. **Deploy**:
   ```bash
   vercel --prod
   ```

#### Manual Deployment (if using other hosting)

1. **Build the frontend**:
   ```bash
   cd client && npm run build
   ```

2. **Deploy `client/build/` as static files**

3. **Deploy server**:
   - Copy entire `server/` directory
   - Set environment variables
   - Run `node server/index.js`

### Phase 7: Git Cleanup

#### Update .gitignore

Your new `.gitignore` is already updated. Verify:

```bash
cat .gitignore
```

Should include:
```gitignore
# Build outputs
build/
client/build/

# Secrets (CRITICAL)
.env
key.txt
*.key
*.pem
```

#### Clean Git History (Optional but Recommended)

```bash
# Remove any accidentally committed build files
git rm -r --cached build/ 2>/dev/null || true
git rm -r --cached client/build/ 2>/dev/null || true
git rm --cached key.txt 2>/dev/null || true

# Commit cleanup
git add .
git commit -m "refactor: migrate to new modular architecture (v2.0.0)"
```

## 🐛 Troubleshooting

### Issue: "Cannot find module 'X'"

**Solution**: Install dependencies
```bash
npm install
cd client && npm install
```

### Issue: "GROQ_API_KEY not configured"

**Solution**: Check your `.env` file
```bash
# Make sure .env exists and has:
GROQ_API_KEY=your_actual_key_here
NODE_ENV=development
PORT=5001
```

### Issue: Frontend can't reach backend

**Solution**: Check ports and proxy
```bash
# Backend should run on port 5001
# Frontend should run on port 3000
# Check client/package.json has:
"proxy": "http://localhost:5001"
```

### Issue: Old files still appearing

**Solution**: Clear build caches
```bash
# Clear node_modules
rm -rf node_modules client/node_modules
npm install
cd client && npm install

# Clear build folders
rm -rf build client/build

# Restart dev server
npm run dev
```

### Issue: Tests failing

**Solution**: Install test dependencies
```bash
npm install --save-dev jest supertest
cd client && npm install
```

## ✅ Verification Steps

After migration, verify everything works:

### 1. Environment Setup
```bash
# Should show no missing required vars
npm run server:dev
# Press Ctrl+C after verification
```

### 2. Frontend Build
```bash
cd client && npm run build
# Should complete without errors
```

### 3. Backend API
```bash
# Start server
npm run server:dev

# In another terminal:
curl -X POST http://localhost:5001/api/health
# Should return health status
```

### 4. Full Application
```bash
npm run dev
# Open http://localhost:3000
# Send a test message
# Should get AI response
```

### 5. Tests
```bash
npm test
# Should run without errors (some tests may be skipped)
```

## 📊 Before vs After Comparison

### Old Structure
```
SoulSync/
├── src/
│   └── App.js (125 lines, everything in one file)
├── public/
├── server.js
├── server-huggingface.js
├── server-mock.js
├── build/ (committed to git ❌)
└── key.txt (security risk ❌)
```

### New Structure
```
SoulSync/
├── client/
│   └── src/
│       ├── components/ (9 files)
│       ├── hooks/
│       ├── utils/
│       └── config/
├── server/
│   ├── routes/
│   ├── services/
│   ├── middleware/
│   └── config/
├── docs/ (4 documentation files)
└── tests/ (4 test files)
```

## 🎉 Migration Complete!

Once all verification steps pass, you've successfully migrated to the new architecture!

### What You've Gained:

- ✅ **Better Organization** - Clear separation of concerns
- ✅ **More Secure** - No secrets in code, rate limiting
- ✅ **More Testable** - Unit and integration tests
- ✅ **Better Documented** - 4 comprehensive docs
- ✅ **More Maintainable** - Modular components
- ✅ **More Scalable** - Clean architecture for growth
- ✅ **More Professional** - Production-ready code

### Recommended Next Steps:

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "refactor: complete v2.0.0 architecture migration"
   git push origin SRC_A
   ```

2. **Update README on GitHub** - The new README is more professional

3. **Test Deployment** - Deploy to Vercel and verify

4. **Share Your Work** - This is now portfolio-worthy!

---

## 📞 Need Help?

If you encounter issues during migration:

1. Check the [ARCHITECTURE.md](ARCHITECTURE.md) for system design
2. Review [API.md](API.md) for endpoint changes
3. See [CONTRIBUTING.md](CONTRIBUTING.md) for code guidelines
4. Check closed issues on GitHub for similar problems

Happy coding! 🚀
