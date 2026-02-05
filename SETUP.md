# 🚀 Quick Setup Guide - Get SoulSync Running

## Current Status

✅ **Already Configured:**
- Groq API Key
- OpenAI API Key
- Pinecone API Key
- JWT Secret

❌ **Need to Configure:**
- Database connection (PostgreSQL via Neon)

## Option 1: Neon PostgreSQL (Cloud - RECOMMENDED) ⭐

**Best for:** Quick start, no local installation needed, free tier available

### Steps:

1. **Create Neon Account**
   - Go to https://neon.tech
   - Sign up for free (no credit card required)

2. **Create a Project**
   - Click "Create Project"
   - Name: `soulsync`
   - Region: Select closest to you
   - Click "Create Project"

3. **Get Connection String**
   - Copy the connection string from the dashboard
   - It looks like:
     ```
     postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
     ```

4. **Update `backend/.env` File**
   ```env
   DATABASE_URL=postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
   ```

5. **Initialize Database**
   ```powershell
   cd backend
   npx prisma generate
   npx prisma db push
   ```

6. **Done!** Skip to "Testing Connection" section below.

---

## Option 2: Local PostgreSQL (Advanced)

**Best for:** Developers who want full control, offline development

### Steps:

1. **Download PostgreSQL**
   - Go to https://www.postgresql.org/download/windows/
   - Download and run the installer

2. **Install PostgreSQL**
   - Run the installer with default options
   - Set a password for the `postgres` user
   - Default port: 5432

3. **Create Database**
   ```powershell
   psql -U postgres
   CREATE DATABASE soulsync;
   \q
   ```

4. **Update `backend/.env` File**
   ```env
   DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/soulsync
   ```

5. **Initialize Database**
   ```powershell
   cd backend
   npx prisma generate
   npx prisma db push
   ```

---

## Testing Connection

Let's verify everything works:

1. **Start the backend:**
   ```powershell
   cd backend
   npm run dev
   ```

2. **Look for these messages:**
   ```
   ✓ Database connected (Prisma)
   ✓ Server running on port 5001
   ✓ Auth routes mounted: /api/auth
   ✓ Chat routes mounted: /api/chats
   ✓ Mood routes mounted: /api/mood
   ```

3. **If you see errors:**
   - Database connection error → Check `DATABASE_URL` in `.env`
   - Port already in use → Stop other processes or change PORT

---

## Full Application Test

Once the server starts successfully:

1. **Start both backend and frontend:**
   ```powershell
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

2. **Open browser:**
   ```
   http://localhost:5173
   ```

3. **Register a new account:**
   - Enter name, email, password
   - Click "Register"
   - You'll be auto-logged in!

4. **Start chatting:**
   - Click "New Journey"
   - Send a message
   - Get AI response with streaming!

---

## Environment Variables Summary

### Backend (`backend/.env`)

```env
# ✅ Database (PostgreSQL)
DATABASE_URL=postgresql://user:pass@host/database?sslmode=require

# ✅ AI Services
GROQ_API_KEY=your_groq_api_key
OPENAI_API_KEY=your_openai_api_key
EMBEDDING_MODEL=text-embedding-3-small

# ✅ Vector Database
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=soulsync-memories

# ✅ Authentication
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_EXPIRES_IN=7d

# ✅ Server
NODE_ENV=development
PORT=5001
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:5001/api
```

---

## Troubleshooting

### "Database connection error"
- Check `DATABASE_URL` format
- Verify Neon project is active
- Check IP whitelist (Neon allows all by default)

### "Prisma Client not generated"
```powershell
cd backend
npx prisma generate
```

### "Port 5001 already in use"
```powershell
# Find and stop the process
Get-Process -Name node | Stop-Process -Force
```

### "Module not found"
```powershell
cd backend && npm install
cd ../frontend && npm install
```

---

## Database Commands

```powershell
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push

# Open Prisma Studio (GUI)
npx prisma studio

# View database in terminal
npx prisma db pull
```

---

## Quick Command Reference

```powershell
# Development (from root)
npm run dev              # Start backend only

# Backend
cd backend
npm run dev              # Start backend
npx prisma studio        # Database GUI

# Frontend
cd frontend
npm run dev              # Start frontend

# Testing
npm test                 # Run tests
```

---

## Need Help?

- **Neon PostgreSQL:** https://neon.tech/docs
- **Prisma:** https://www.prisma.io/docs
- **Project Docs:** Check `docs/` folder

---

**You're almost there! Just set up PostgreSQL and you're ready to go! 🚀**
