# 🚀 Quick Setup Guide - Get SoulSync Running

## Current Status

✅ **Already Configured:**
- Groq API Key
- JWT Secret (secure random generated)
- All code and dependencies

❌ **Need to Configure:**
- Database connection (MongoDB)

## Option 1: MongoDB Atlas (Cloud - RECOMMENDED) ⭐

**Best for:** Quick start, no local installation needed, free tier available

### Steps:

1. **Create MongoDB Atlas Account**
   - Go to https://www.mongodb.com/cloud/atlas/register
   - Sign up for free (no credit card required)

2. **Create a Cluster**
   - Click "Create" → "Deploy a database"
   - Choose **FREE** tier (M0 Sandbox)
   - Select a cloud provider and region (closest to you)
   - Click "Create Cluster" (takes 3-5 minutes)

3. **Create Database User**
   - Go to "Database Access" in left menu
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Username: `soulsync_user` (or your choice)
   - Password: Click "Autogenerate Secure Password" (SAVE THIS!)
   - Database User Privileges: "Read and write to any database"
   - Click "Add User"

4. **Whitelist Your IP**
   - Go to "Network Access" in left menu
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for development)
   - Click "Confirm"

5. **Get Connection String**
   - Go to "Database" in left menu
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (looks like):
     ```
     mongodb+srv://soulsync_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```

6. **Update `.env` File**
   - Open `d:\Aryan\Github\SoulSync\.env`
   - Replace the `MONGODB_URI` line:
     ```env
     MONGODB_URI=mongodb+srv://soulsync_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/soulsync?retryWrites=true&w=majority
     ```
   - Replace `YOUR_PASSWORD` with the password from step 3
   - Add database name `/soulsync` before the `?`

7. **Done!** Skip to "Testing Connection" section below.

---

## Option 2: Local MongoDB (Advanced)

**Best for:** Developers who want full control, offline development

### Steps:

1. **Download MongoDB Community Server**
   - Go to https://www.mongodb.com/try/download/community
   - Select:
     - Version: 7.0 or later
     - Platform: Windows
     - Package: msi
   - Download and run installer

2. **Install MongoDB**
   - Run the `.msi` installer
   - Choose "Complete" installation
   - Install as a Windows Service (check the box)
   - Install MongoDB Compass (GUI tool)
   - Click "Next" and "Install"

3. **Verify Installation**
   Open PowerShell and run:
   ```powershell
   # Check if MongoDB service is running
   Get-Service MongoDB
   
   # It should show "Status: Running"
   ```

4. **MongoDB is Already Configured**
   Your `.env` already has the local connection:
   ```env
   MONGODB_URI=mongodb://localhost:27017/soulsync
   ```

5. **Done!** Continue to "Testing Connection" section below.

---

## Testing Connection

Let's verify everything works:

1. **Start the server:**
   ```powershell
   npm run server:dev
   ```

2. **Look for these messages:**
   ```
   ✓ MongoDB connected
   ✓ Server running on port 5001
   ✓ Auth routes mounted: /api/auth
   ✓ Chat routes mounted: /api/chats
   ```

3. **If you see errors:**
   - MongoDB connection error → Check connection string in `.env`
   - Port already in use → Stop other processes or change PORT in `.env`

---

## Full Application Test

Once the server starts successfully:

1. **Start both server and client:**
   ```powershell
   npm run dev
   ```

2. **Open browser:**
   ```
   http://localhost:3000
   ```

3. **You should see the Login page!**

4. **Register a new account:**
   - Click "Register"
   - Enter name (optional), email, password
   - Click "Register"
   - You'll be auto-logged in!

5. **Start chatting:**
   - Click "New Chat"
   - Send a message
   - Get AI response
   - Chat is automatically saved!

---

## Run Smoke Tests

Verify all endpoints work:

```powershell
# Make sure server is running first
npm run server:dev

# In another terminal:
npm run smoke
```

You should see:
```
🔥 Running smoke tests...
1️⃣ Testing health endpoint... ✅
2️⃣ Testing user registration... ✅
3️⃣ Testing profile endpoint... ✅
4️⃣ Testing chat creation... ✅
5️⃣ Testing message sending... ✅
6️⃣ Testing chat list retrieval... ✅
7️⃣ Testing chat deletion... ✅
🎉 All smoke tests passed!
```

---

## Environment Variables Summary

Your current `.env` should have:

```env
# ✅ CONFIGURED
GROQ_API_KEY=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
JWT_SECRET=b17b4a982101e9dc9f75d42f0225f628b6d230a2df90ce9c13cdafb8f3459577

# ⚠️ NEEDS CONFIGURATION (choose one option above)
MONGODB_URI=mongodb://localhost:27017/soulsync  # Option 2: Local
# OR
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/soulsync  # Option 1: Atlas

# ✅ OPTIONAL (defaults are fine)
NODE_ENV=development
PORT=5001
JWT_EXPIRES_IN=7d
```

---

## Troubleshooting

### "MongoDB connection error"
- **Atlas:** Check username, password, IP whitelist
- **Local:** Verify MongoDB service is running: `Get-Service MongoDB`

### "Port 5001 already in use"
```powershell
# Find and stop the process
Get-Process -Name node | Stop-Process -Force
```

### "Module not found"
```powershell
# Reinstall dependencies
npm install
cd client && npm install
```

### "Cannot find module 'mongoose'"
```powershell
# Install missing packages
npm install
```

---

## Next Steps

Once everything is running:

1. ✅ Register multiple accounts
2. ✅ Create multiple chats
3. ✅ Test chat history and continuity
4. ✅ Try deleting chats
5. ✅ Test logout and login again
6. ✅ Run smoke tests

---

## Production Deployment (Vercel)

When ready to deploy:

1. **Create MongoDB Atlas** (if not done already)

2. **Add Environment Variables in Vercel:**
   - Go to Project Settings → Environment Variables
   - Add:
     - `GROQ_API_KEY`: Your Groq key
     - `MONGODB_URI`: Your Atlas connection string
     - `JWT_SECRET`: Your JWT secret
     - `NODE_ENV`: production

3. **Deploy from GitHub:**
   - Push your code to GitHub
   - Vercel will auto-deploy

4. **Test Production:**
   ```powershell
   API_URL=https://your-domain.vercel.app/api npm run smoke
   ```

---

## Need Help?

- **MongoDB Atlas:** https://www.mongodb.com/docs/atlas/getting-started/
- **MongoDB Local:** https://www.mongodb.com/docs/manual/installation/
- **Project Docs:** Check `docs/` folder for detailed guides

---

## Quick Command Reference

```powershell
# Development
npm run dev              # Start everything

# Server only
npm run server:dev       # Backend only

# Testing
npm run smoke            # Quick validation
npm run test:auth        # Auth tests
npm run test:chat        # Chat tests

# Database (if using local MongoDB)
Get-Service MongoDB      # Check if running
Start-Service MongoDB    # Start MongoDB
Stop-Service MongoDB     # Stop MongoDB
```

**You're almost there! Just set up MongoDB and you're ready to go! 🚀**
