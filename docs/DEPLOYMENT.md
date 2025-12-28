# Deployment Guide - SoulSync AI

## 📋 Table of Contents
- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Local Deployment](#local-deployment)
- [Vercel Deployment](#vercel-deployment)
- [Environment Variables](#environment-variables)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software
- **Node.js**: v14.0.0 or higher
- **npm**: v6.0.0 or higher
- **Git**: Latest version

### Required Accounts
- **Groq Account**: Get API key at [console.groq.com](https://console.groq.com/)
- **Vercel Account** (for production): [vercel.com](https://vercel.com/)

---

## Environment Setup

### 1. Clone Repository
```bash
git clone https://github.com/Aryan-B-Parikh/SoulSync.git
cd SoulSync
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

### 3. Configure Environment Variables
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your API key
# GROQ_API_KEY=your_actual_api_key_here
```

**Required Variables:**
- `GROQ_API_KEY` - Your Groq API key
- `NODE_ENV` - Set to `development` or `production`
- `PORT` - Server port (default: 5001)

---

## Local Deployment

### Development Mode

Run both frontend and backend with hot reload:

```bash
npm run dev
```

This will start:
- **Backend**: http://localhost:5001
- **Frontend**: http://localhost:3000

### Backend Only
```bash
npm run server:dev
```

### Frontend Only
```bash
npm run client:dev
```

### Production Build (Local)
```bash
# Build frontend
npm run build

# Start production server
npm run start:prod
```

### Verify Installation
```bash
# Run all tests
npm test

# Run linter
npm run lint

# Check build
npm run build
```

---

## Vercel Deployment

### Option 1: Vercel CLI (Recommended)

#### Install Vercel CLI
```bash
npm install -g vercel
```

#### Deploy
```bash
# First deployment (creates project)
vercel

# Production deployment
vercel --prod
```

#### Set Environment Variables
```bash
# Add environment variables via CLI
vercel env add GROQ_API_KEY production
vercel env add NODE_ENV production
```

Or set them in the Vercel Dashboard:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add required variables

### Option 2: GitHub Integration

#### Connect Repository
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Select "SoulSync"
4. Configure project:
   - **Framework Preset**: Create React App
   - **Build Command**: `cd client && npm run build`
   - **Output Directory**: `client/build`
   - **Install Command**: `npm install && cd client && npm install`

#### Set Environment Variables
In Vercel Dashboard → Settings → Environment Variables:
- `GROQ_API_KEY` = your_api_key
- `NODE_ENV` = production
- `PORT` = 5001 (optional)

#### Deploy
Push to your main branch, and Vercel will automatically deploy.

---

## Environment Variables

### Complete List

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GROQ_API_KEY` | Yes | - | Groq API key for AI completions |
| `NODE_ENV` | Yes | development | Environment mode |
| `PORT` | No | 5001 | Backend server port |
| `CORS_ORIGIN` | No | * | Allowed CORS origins |
| `RATE_LIMIT_WINDOW` | No | 15 | Rate limit window (minutes) |
| `RATE_LIMIT_MAX_REQUESTS` | No | 100 | Max requests per window |
| `REACT_APP_API_URL` | No | /api | Frontend API endpoint |

### Development (.env)
```env
GROQ_API_KEY=your_development_key
NODE_ENV=development
PORT=5001
REACT_APP_API_URL=http://localhost:5001
```

### Production (Vercel)
```env
GROQ_API_KEY=your_production_key
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com
```

---

## Deployment Checklist

### Pre-Deployment
- [ ] All tests pass: `npm test`
- [ ] Linter passes: `npm run lint`
- [ ] Build succeeds: `npm run build`
- [ ] No `.env` or `key.txt` in repo
- [ ] `.gitignore` is up to date
- [ ] Environment variables documented

### Post-Deployment
- [ ] Health check works: `GET /api/health`
- [ ] Chat endpoint works: `POST /api/chat`
- [ ] Frontend loads correctly
- [ ] No console errors
- [ ] Rate limiting active
- [ ] Error handling works

---

## Troubleshooting

### Common Issues

#### 1. "GROQ_API_KEY not found"
**Solution**: Ensure `.env` file exists with valid API key
```bash
# Check if .env exists
ls -la | grep .env

# Verify content (without exposing key)
cat .env | grep GROQ_API_KEY
```

#### 2. "Port already in use"
**Solution**: Change port or kill existing process
```bash
# Windows
netstat -ano | findstr :5001
taskkill /PID <process_id> /F

# macOS/Linux
lsof -ti:5001 | xargs kill
```

#### 3. Build fails
**Solution**: Clear cache and reinstall
```bash
# Clean install
npm run clean
npm install
cd client && npm install
```

#### 4. Rate limit errors in development
**Solution**: Increase rate limits in `.env`
```env
RATE_LIMIT_MAX_REQUESTS=1000
```

#### 5. Vercel deployment fails
**Solutions**:
- Check build logs in Vercel dashboard
- Verify environment variables are set
- Ensure `vercel.json` is properly configured
- Check that all dependencies are in `package.json`

---

## Health Checks

### API Health Check
```bash
curl https://your-domain.vercel.app/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-12-28T10:00:00.000Z",
  "uptime": 3600.5
}
```

### Test Chat Endpoint
```bash
curl -X POST https://your-domain.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello"}]}'
```

---

## Production Monitoring

### Recommended Tools
- **Error Tracking**: [Sentry](https://sentry.io/)
- **Logging**: [LogRocket](https://logrocket.com/)
- **Analytics**: [PostHog](https://posthog.com/)
- **Uptime**: [UptimeRobot](https://uptimerobot.com/)

### Vercel Analytics
Enable in Vercel Dashboard → Analytics

---

## Rollback Procedure

### Vercel
```bash
# List recent deployments
vercel ls

# Rollback to specific deployment
vercel rollback [deployment-url]
```

### Manual Rollback
```bash
# Revert to previous commit
git revert HEAD
git push origin main
```

---

## Security Checklist

- [ ] API keys stored in environment variables only
- [ ] CORS properly configured
- [ ] Rate limiting active
- [ ] Input validation working
- [ ] Error messages don't expose sensitive data
- [ ] HTTPS enforced in production
- [ ] Dependencies up to date: `npm audit`

---

## Performance Optimization

### Frontend
- Code splitting enabled ✅
- Assets minified ✅
- Lazy loading components (optional)
- CDN for static assets (Vercel default)

### Backend
- Request timeout: 30 seconds
- Connection pooling (future)
- Response caching (future)

---

## Support

For deployment issues:
1. Check [troubleshooting](#troubleshooting) section
2. Review [Vercel docs](https://vercel.com/docs)
3. Open an issue on [GitHub](https://github.com/Aryan-B-Parikh/SoulSync/issues)

---

**Last Updated**: December 28, 2025
**Version**: 2.0.0
