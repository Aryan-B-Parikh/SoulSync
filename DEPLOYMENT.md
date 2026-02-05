# 🚀 SoulSync Deployment Guide

Complete guide for deploying SoulSync to production.

---

## 📋 Deployment Overview

| Component | Platform | URL |
|-----------|----------|-----|
| **Frontend** | Vercel | `https://your-app.vercel.app` |
| **Backend** | Railway / Render | `https://your-api.railway.app` |
| **Database** | Neon PostgreSQL | Serverless |
| **Vector DB** | Pinecone | Free tier |

---

## 🔧 Prerequisites

Before deploying, ensure you have:

- [x] GitHub repository with your code
- [x] Neon PostgreSQL database (production)
- [x] Pinecone account with index created
- [x] Groq API key
- [x] OpenAI API key

---

## Step 1: Prepare Production Database (Neon)

### 1.1 Create Production Database

1. Go to [neon.tech](https://neon.tech)
2. Create a new project: `soulsync-production`
3. Copy the connection string:
   ```
   postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
   ```

### 1.2 Initialize Schema

```bash
cd backend

# Set production DATABASE_URL temporarily
export DATABASE_URL="your-neon-production-url"

# Push schema
npx prisma db push
```

---

## Step 2: Deploy Backend (Railway)

### 2.1 Create Railway Project

1. Go to [railway.app](https://railway.app)
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your `SoulSync` repository
4. Set root directory to: `backend`

### 2.2 Configure Environment Variables

In Railway dashboard → **Variables**, add:

```env
# Database
DATABASE_URL=postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require

# AI Services
GROQ_API_KEY=gsk_your_groq_api_key
OPENAI_API_KEY=sk-your_openai_api_key
EMBEDDING_MODEL=text-embedding-3-small

# Vector Database
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=soulsync-memories

# Authentication
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_EXPIRES_IN=7d

# Server
NODE_ENV=production
PORT=5001
```

### 2.3 Configure Build Settings

In Railway → **Settings**:

| Setting | Value |
|---------|-------|
| Root Directory | `backend` |
| Build Command | `npm install && npx prisma generate` |
| Start Command | `npm start` |

### 2.4 Generate Domain

1. Go to **Settings** → **Networking**
2. Click **"Generate Domain"**
3. Copy your URL: `https://soulsync-backend-production.up.railway.app`

---

## Step 3: Deploy Frontend (Vercel)

### 3.1 Create Vercel Project

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repository
4. Set root directory to: `frontend`

### 3.2 Configure Build Settings

| Setting | Value |
|---------|-------|
| Framework Preset | Vite |
| Root Directory | `frontend` |
| Build Command | `npm run build` |
| Output Directory | `dist` |

### 3.3 Add Environment Variables

In Vercel → **Settings** → **Environment Variables**:

```env
VITE_API_URL=https://soulsync-backend-production.up.railway.app/api
```

> ⚠️ Replace with your actual Railway backend URL!

### 3.4 Deploy

Click **"Deploy"** - Vercel will build and deploy automatically.

Your frontend will be live at: `https://soulsync.vercel.app`

---

## Step 4: Configure CORS (Backend)

Update `backend/index.js` to allow your Vercel domain:

```javascript
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'https://soulsync.vercel.app',  // Add your Vercel URL
    'https://your-custom-domain.com'
  ],
  credentials: true
};
```

Commit and push - Railway will auto-redeploy.

---

## Step 5: Verify Deployment

### 5.1 Test Backend Health

```bash
curl https://your-railway-url.up.railway.app/api/health
# Expected: {"status":"OK","timestamp":"..."}
```

### 5.2 Test Frontend

1. Visit your Vercel URL
2. Register a new account
3. Send a test message
4. Verify streaming response works

### 5.3 Test Full Flow

- [x] Registration works
- [x] Login works
- [x] Chat streaming works
- [x] Memory storage works (mention something, ask later)
- [x] Mood dashboard shows data
- [x] Dark/Light mode works

---

## 🔄 Alternative: Deploy Backend to Render

If you prefer Render over Railway:

### Create Render Web Service

1. Go to [render.com](https://render.com)
2. Click **"New"** → **"Web Service"**
3. Connect your GitHub repo
4. Configure:

| Setting | Value |
|---------|-------|
| Root Directory | `backend` |
| Build Command | `npm install && npx prisma generate` |
| Start Command | `npm start` |
| Instance Type | Free (or Starter $7/mo) |

5. Add the same environment variables as Railway

---

## 🌐 Custom Domain Setup

### Vercel (Frontend)

1. Go to **Settings** → **Domains**
2. Add your domain: `app.yourdomain.com`
3. Update DNS at your registrar:
   - Type: `CNAME`
   - Name: `app`
   - Value: `cname.vercel-dns.com`

### Railway (Backend)

1. Go to **Settings** → **Networking** → **Custom Domain**
2. Add: `api.yourdomain.com`
3. Update DNS:
   - Type: `CNAME`
   - Name: `api`
   - Value: `your-app.up.railway.app`

---

## 📊 Production Monitoring

### Recommended Tools

| Purpose | Tool | Free Tier |
|---------|------|-----------|
| Error Tracking | Sentry | ✅ 5K events/mo |
| Analytics | Vercel Analytics | ✅ Built-in |
| Uptime | UptimeRobot | ✅ 50 monitors |
| Logs | Railway Logs | ✅ Built-in |

### Add Sentry (Optional)

```bash
cd backend
npm install @sentry/node
```

```javascript
// backend/index.js
const Sentry = require("@sentry/node");
Sentry.init({ dsn: "YOUR_SENTRY_DSN" });
```

---

## 🔐 Security Checklist

Before going live:

- [x] Use strong JWT_SECRET (32+ chars)
- [x] Enable HTTPS only (automatic on Vercel/Railway)
- [x] Validate CORS origins
- [x] Use environment variables (no hardcoded secrets)
- [x] Database SSL enabled (Neon handles this)
- [x] Rate limiting on auth endpoints

---

## 💰 Cost Breakdown (Free Tier)

| Service | Free Tier Limit | Monthly Cost |
|---------|-----------------|--------------|
| **Vercel** | 100GB bandwidth | $0 |
| **Railway** | $5 credit/month | $0-5 |
| **Neon** | 500MB storage, 3GB transfer | $0 |
| **Pinecone** | 100K vectors | $0 |
| **Groq** | Rate limited | $0 |
| **OpenAI** | Pay per use | ~$0.10-1 |

**Total: ~$0-5/month for hobby projects**

---

## 🔧 Troubleshooting

### "Cannot connect to database"
- Check DATABASE_URL is correct
- Verify Neon project is active
- Check for SSL requirement (`?sslmode=require`)

### "CORS error"
- Add frontend URL to CORS whitelist in backend
- Redeploy backend after changes

### "Environment variable not found"
- Ensure all env vars are set in Railway/Vercel
- Prefix frontend vars with `VITE_`

### "Prisma Client not found"
- Add `npx prisma generate` to build command

### "502 Bad Gateway"
- Check Railway logs for errors
- Verify PORT is set correctly
- Check start command is `npm start`

---

## 📝 Quick Reference

### Deployment URLs

```
Frontend: https://soulsync.vercel.app
Backend:  https://soulsync-production.up.railway.app
API Base: https://soulsync-production.up.railway.app/api
```

### Redeploy Commands

```bash
# Push to GitHub - auto deploy triggers
git push origin main

# Force redeploy (Railway)
# Go to Railway Dashboard → Deployments → Redeploy

# Force redeploy (Vercel)
# Go to Vercel Dashboard → Deployments → Redeploy
```

---

## ✅ Deployment Complete!

Your SoulSync app is now live! 🎉

- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-api.railway.app`

**Next Steps:**
1. Test all features in production
2. Set up monitoring (Sentry, UptimeRobot)
3. Configure custom domain (optional)
4. Share with users!

---

**Questions?** Check the [docs](/docs) or open an issue on GitHub.
