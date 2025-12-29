# Deployment Modes

SoulSync AI supports multiple deployment configurations. Choose the one that fits your needs.

---

## 📋 Overview

| Mode | Command | Description | Use Case |
|------|---------|-------------|----------|
| **Local Dev** | `npm run dev` | Client + Server concurrently | Active development |
| **Local Prod** | `npm run build && npm start` | Server serves built client | Testing production build |
| **Vercel** | Automatic on push | Serverless functions | Public deployment |

---

## 🚀 Mode Details

### 1. Local Development Mode

**Start:**
```bash
npm run dev
```

**What happens:**
- React dev server starts on `http://localhost:3000`
- Express server starts on `http://localhost:5001`
- Hot reload enabled
- MongoDB connection required

**Environment:**
- Uses `.env` file
- `NODE_ENV=development`
- CORS allows all origins

**Best for:**
- Writing new features
- Testing auth flows
- Database integration work

---

### 2. Local Production Mode

**Build:**
```bash
npm run build
```

**Start:**
```bash
npm run server:start
```

**What happens:**
- React app built to `client/build/`
- Express serves static files + API
- Single server on port 5001
- MongoDB connection required

**Environment:**
- Uses `.env` file
- `NODE_ENV=production`
- Optimized bundle

**Best for:**
- Testing production behavior
- Performance testing
- Pre-deployment validation

---

### 3. Vercel Serverless Mode

**Deploy:**
```bash
vercel --prod
```

**What happens:**
- React build deployed to CDN
- `api/` functions become serverless endpoints
- No persistent server
- MongoDB Atlas connection required

**Environment:**
- Configure in Vercel dashboard
- Required vars: `GROQ_API_KEY`, `MONGODB_URI`, `JWT_SECRET`
- `NODE_ENV=production`

**Endpoints:**
- Frontend: `https://your-app.vercel.app`
- API: `https://your-app.vercel.app/api/*`

**Best for:**
- Public production deployment
- Auto-scaling
- Zero server management

---

## ⚙️ Environment Variables by Mode

### Required Everywhere
- `GROQ_API_KEY`
- `MONGODB_URI` or `DB_URL`
- `JWT_SECRET`

### Mode-Specific
```bash
# Local Dev
NODE_ENV=development
PORT=5001
CORS_ORIGIN=*

# Local Prod
NODE_ENV=production
PORT=5001
CORS_ORIGIN=http://localhost:5001

# Vercel
NODE_ENV=production
CORS_ORIGIN=https://your-app.vercel.app
```

---

## 🔄 Switching Between Modes

### Dev → Prod (Local)
1. Stop dev server
2. Run `npm run build`
3. Run `npm run server:start`

### Local → Vercel
1. Push to GitHub
2. Vercel auto-deploys
3. Add env vars in dashboard
4. Redeploy if needed

### Vercel → Local
1. Pull latest code
2. Copy `.env.example` to `.env`
3. Add local MongoDB URI
4. Run `npm run dev`

---

## 🧪 Testing Each Mode

### Local Dev
```bash
# Health check
curl http://localhost:5001/api/health

# Auth test
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

### Vercel
```bash
# Health check
curl https://your-app.vercel.app/api/health

# Frontend
open https://your-app.vercel.app
```

---

## ⚠️ Common Issues

### Port conflicts (Local)
```bash
# Kill process on port 5001
npx kill-port 5001

# Kill process on port 3000
npx kill-port 3000
```

### MongoDB connection (All modes)
- **Local**: Install MongoDB or use Docker
- **Vercel**: Use MongoDB Atlas (cloud)

### CORS errors
- **Dev**: Set `CORS_ORIGIN=*`
- **Prod**: Set to your exact frontend URL

---

## 📊 Performance Comparison

| Metric | Local Dev | Local Prod | Vercel |
|--------|-----------|------------|--------|
| Cold start | Instant | Instant | ~200ms |
| Hot reload | ✅ | ❌ | ❌ |
| Scalability | Single process | Single server | Auto-scale |
| Cost | Free | Free | Free tier + usage |

---

## 🎯 Recommended Workflow

1. **Develop** locally with `npm run dev`
2. **Test** with `npm run build && npm start`
3. **Deploy** to Vercel with `git push`
4. **Monitor** with Vercel dashboard

---

For more details, see:
- [DEPLOYMENT.md](DEPLOYMENT.md) - Full deployment guide
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture
- [README.md](../README.md) - Quick start guide
