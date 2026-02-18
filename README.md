# 🌟 SoulSync AI

A sophisticated AI companion with **real-time streaming**, **long-term memory**, **personality modes**, and a **premium glassmorphic UI**. Built with React, Node.js, Prisma/PostgreSQL, and advanced AI features.

![SoulSync](https://img.shields.io/badge/AI-Companion-purple?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?style=for-the-badge&logo=node.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791?style=for-the-badge&logo=postgresql)

---

## ✨ Features

### 🚀 Real-Time Streaming Responses
- **Server-Sent Events (SSE)** for token-by-token streaming
- **< 500ms** first token latency
- Optimistic UI updates with smooth animations
- Graceful error handling and reconnection

### 🧠 Long-Term Memory (RAG)
- **Pinecone vector database** for memory storage
- **OpenAI embeddings** (1536-dim vectors)
- Automatic memory storage for every message
- **Top-3 relevant memories** retrieved per query
- Contextual AI responses that remember past conversations

### 🎭 Personality Modes
- **🌙 Deep & Reflective**: Introspective, philosophical
- **🌤 Supportive Friend**: Warm, encouraging, validating
- **✨ Creative & Poetic**: Metaphorical, artistic
- Persistent personality preferences per user

### 📊 Mood Dashboard
- **Automatic sentiment analysis** of every message
- **Emotional Resonance Map** - GitHub-style heatmap of your emotional journey
- **Mood Calendar** - Weekly view with color-coded daily moods
- **Mood Distribution** - Visual breakdown of emotional patterns
- **Trend graphs** showing emotional patterns over time

### 👤 User Profile System
- **Profile Settings**: Customizable display name and settings
- **Sidebar Integration**: Quick access to profile, mood, and settings
- **Persistent Stats**: View your journey statistics

### 🎨 Premium UI
- **Living Organism Design** - Aurora backgrounds with breathing animations
- **Dark/Light Mode** with seamless transitions
- **Glassmorphism** design with backdrop blur
- **Google Fonts** (Playfair Display, Inter)
- **Smooth 60fps animations** with Framer Motion
- **Interactive Personality Selector Modal**

### 💬 Chat Management
- Create, rename, and delete conversations
- Inline editing for chat titles
- Message feedback (thumbs up/down)
- Training data export for fine-tuning

---

## 🏗️ Tech Stack

### Frontend
- **React 18** with Hooks & Context
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Recharts** for data visualization
- **Lucide React** for icons
- **date-fns** for date manipulation

### Backend
- **Node.js** with Express
- **Prisma ORM** with PostgreSQL (Neon)
- **JWT** authentication
- **Server-Sent Events (SSE)** for streaming
- **Sentiment** library for mood analysis

### AI & Vector Database
- **Groq API** for LLM responses (Llama 3.3 70B)
- **OpenAI API** for embeddings
- **Pinecone** for vector storage
- **RAG architecture** for memory

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database (Neon recommended)
- Groq API key
- OpenAI API key (for embeddings)
- Pinecone account (free tier)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Aryan-B-Parikh/SoulSync.git
cd SoulSync
```

2. **Install dependencies**
```bash
# Install all dependencies (root, backend, frontend)
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..
```

3. **Set up environment variables**

Create `backend/.env`:
```env
# Database (PostgreSQL via Neon)
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# AI Services
GROQ_API_KEY=your_groq_api_key
OPENAI_API_KEY=your_openai_api_key
EMBEDDING_MODEL=text-embedding-3-small

# Vector Database (Pinecone)
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=soulsync-memories

# Authentication
JWT_SECRET=your_super_secret_jwt_key_min_32_chars

# Server
NODE_ENV=development
PORT=5001
```

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:5001/api
```

4. **Set up Database**
```bash
cd backend
npx prisma generate
npx prisma db push
```

5. **Set up Pinecone**
- Sign up at [pinecone.io](https://www.pinecone.io)
- Create an index:
  - Name: `soulsync-memories`
  - Dimension: `1536`
  - Metric: `cosine`

6. **Run the application**
```bash
# From root directory
npm run dev
```

The app will be available at:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5001`

---

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Chat
- `GET /api/chats` - Get all chats
- `POST /api/chats` - Create new chat
- `GET /api/chats/:id` - Get chat with messages
- `PATCH /api/chats/:id` - Rename chat
- `DELETE /api/chats/:id` - Delete chat
- `POST /api/chats/:id/messages/stream` - Stream AI response (SSE)

### Memory
- `GET /api/memory/stats` - Get memory statistics
- `GET /api/memory/search?query=...` - Search memories
- `GET /api/memory/recent` - Get recent memories
- `DELETE /api/memory/all` - Delete all memories (privacy)

### Mood
- `GET /api/mood/summary` - Get mood analytics
- `GET /api/mood/history` - Get mood history
- `GET /api/mood/calendar/:year/:month` - Get calendar mood data
- `GET /api/mood/heatmap` - Get heatmap data

### User
- `GET /api/user/personality` - Get personality preference
- `PUT /api/user/personality` - Update personality
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile

---

## 📁 Project Structure

```
SoulSync/
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   │   ├── chat/      # Chat components
│   │   │   ├── mood/      # Mood dashboard components
│   │   │   └── ...
│   │   ├── context/       # React context (Auth, Chat, Theme)
│   │   ├── pages/         # Page components
│   │   └── config/        # Configuration
│   └── package.json
├── backend/                # Express backend
│   ├── config/            # Database & app config
│   ├── controllers/       # Request handlers
│   ├── middleware/        # Express middleware
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   │   └── sentiment/     # Sentiment analysis
│   ├── ml/                # Machine Learning
│   │   ├── models/        # Trained ML models
│   │   ├── training/      # Training datasets
│   │   └── scripts/       # Training scripts
│   ├── prisma/            # Database schema
│   │   └── schema.prisma
│   ├── tests/             # Tests
│   │   ├── unit/          # Unit tests
│   │   └── integration/   # Integration tests
│   └── docs/              # Backend documentation
├── tests/                  # Integration tests
├── docs/                   # Project documentation
└── package.json           # Root package.json
```

---

## 🏛️ Architecture

```
Frontend (React)
    ↓
ChatPage → sendStreamingMessage()
    ↓
Backend (Express)
    ↓
streaming.controller.js
    ↓
1. Save user message to PostgreSQL (Prisma)
2. Analyze sentiment
3. Generate embedding → OpenAI
4. Store in Pinecone (vectorService.js)
5. Retrieve top-3 memories (cosine similarity)
6. Inject memories into system prompt
7. Stream AI response (Groq API)
8. Save assistant message
    ↓
Frontend receives SSE stream
    ↓
MessageBubble displays with animations
```

---

## 💰 Cost Estimates

### Free Tier Limits
- **Groq**: Free tier with rate limits
- **OpenAI Embeddings**: ~$0.10 per 1M tokens
- **Pinecone**: 100,000 vectors (~200 users)
- **Neon PostgreSQL**: Free tier (500MB storage)

### Monthly Costs
- **10 users, 100 messages each**: ~$0.05/month
- **100 users, 500 messages each**: ~$2/month

---

## 🧪 Testing

### Run Tests
```bash
# Unit tests
cd backend
node tests/unit/sentiment.test.js

# Data pipeline audit (check training data health)
npm run audit-data

# Security isolation test (cross-tenant memory leak check)
npm run test:security

# RAG stress test (memory poisoning resistance)
npm run test:rag

# Load test (Vercel timeout simulation)
npm run load-test
```

> ⚠️ Live tests (`test:security`, `test:rag`, `load-test`) require the backend running: `npm run backend:dev`

### Data Flywheel — Smoke Test
After chatting and rating messages, run:
```bash
node scripts/audit-training-data.js
```
**Success criteria:**
- `Total messages` > 0
- `Missing context_used` = 0
- `Upvoted (rating=1)` > 0

### Manual Testing Checklist
- [x] Send message, verify streaming works
- [x] Change personality mode, verify AI tone changes
- [x] Test memory recall ("My favorite color is purple" → ask later)
- [x] Verify mood dashboard updates with new messages
- [x] Test dark/light mode toggle
- [x] Test chat rename and delete
- [x] Click 👍 on a message → verify `rating=1` in DB via audit script

---

## 🎓 Portfolio Highlights

### Technical Achievements
✅ **Production RAG System** - Real vector database with Pinecone  
✅ **Streaming Architecture** - SSE with async generators  
✅ **PostgreSQL + Prisma** - Modern ORM with type safety  
✅ **Sentiment Analysis** - 93.3% accuracy + LLM hybrid second opinion  
✅ **Premium UI** - Living organism design with aurora effects  
✅ **Dark Mode** - Full theme system with smooth transitions  
✅ **Full-Stack Implementation** - Backend + Frontend + Database  
✅ **Privacy-First Design** - User isolation, PII scrubbing, secure memory management  
✅ **Data Flywheel** - Self-improving architecture: logs → filter → fine-tune  

---

## 🔒 Data & Privacy

**Privacy-First Design** — SoulSync is built with user privacy as a core principle.

- **User Isolation:** All memories and conversations are strictly scoped to your account. No user can access another user's data.
- **No Third-Party Tracking:** SoulSync does not use analytics trackers or sell user data.
- **Data Deletion:** Users can delete all their memories and conversations at any time via the app.
- **AI Model Improvement:** Anonymized conversation data may be used to improve the quality of SoulSync's AI models. Before any processing, all personal identifiers (email addresses, phone numbers, URLs) are automatically scrubbed and replaced with placeholder tokens. Raw conversation data is never shared with third parties for this purpose.
- **Feedback is Optional:** Thumbs up/down ratings are entirely optional and only used to identify high-quality training examples.

---


Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

MIT License - feel free to use this project for learning or portfolio purposes.

---

## 🙏 Acknowledgments

- **Groq** for fast LLM inference
- **OpenAI** for embeddings API
- **Pinecone** for vector database
- **Neon** for serverless PostgreSQL
- **Framer Motion** for animations

---

## 📧 Contact

**Aryan B Parikh**
- GitHub: [@Aryan-B-Parikh](https://github.com/Aryan-B-Parikh)
- Project: [SoulSync](https://github.com/Aryan-B-Parikh/SoulSync)

---

**Built with React, Node.js, PostgreSQL, Prisma, Groq, OpenAI, and Pinecone**
