# 🌟 SoulSync AI

A sophisticated AI companion with **real-time streaming**, **long-term memory**, **personality modes**, and a **premium glassmorphic UI**. Built with the MERN stack and advanced AI features.

![SoulSync](https://img.shields.io/badge/AI-Companion-purple?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?style=for-the-badge&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)

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

### 📊 Feedback System
- **Thumbs up/down** on AI responses
- Training data export for fine-tuning
- **JSONL format** compatible with OpenAI/Groq
- Analytics dashboard for feedback statistics

### 🎨 Premium UI
- **Glassmorphism** design with backdrop blur
- **Framer Motion** animations (entrance, hover, glow)
- **Google Fonts** (Playfair Display, Inter)
- Animated gradient backgrounds
- Smooth 60fps animations

---

## 🏗️ Tech Stack

### Frontend
- **React 18** with Hooks
- **Framer Motion** for animations
- **Tailwind CSS** for styling
- **Vite** for fast development

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose
- **JWT** authentication
- **Server-Sent Events (SSE)** for streaming

### AI & Vector Database
- **Groq API** for LLM responses (Llama 3.3 70B)
- **OpenAI API** for embeddings
- **Pinecone** for vector storage
- **RAG architecture** for memory

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
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
npm install
cd client && npm install
cd ..
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your API keys:
```env
# AI Services
GROQ_API_KEY=your_groq_api_key
OPENAI_API_KEY=your_openai_api_key
EMBEDDING_MODEL=text-embedding-3-small

# Vector Database (Pinecone)
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_ENVIRONMENT=us-east-1
PINECONE_INDEX_NAME=soulsync-memories

# Database
MONGODB_URI=mongodb://localhost:27017/soulsync

# Authentication
JWT_SECRET=your_super_secret_jwt_key_min_32_chars

# Server
NODE_ENV=development
PORT=5001
```

4. **Set up Pinecone**
- Sign up at [pinecone.io](https://www.pinecone.io)
- Create an index:
  - Name: `soulsync-memories`
  - Dimension: `1536`
  - Metric: `cosine`
  - Pod type: Starter (free)

5. **Run the application**
```bash
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

### Chat
- `GET /api/chats` - Get all chats
- `POST /api/chats` - Create new chat
- `GET /api/chats/:id/messages` - Get chat messages
- `POST /api/chats/:id/messages/stream` - Stream AI response (SSE)

### Memory
- `GET /api/memory/stats` - Get memory statistics
- `GET /api/memory/search?query=...` - Search memories
- `DELETE /api/memory/all` - Delete all memories (privacy)

### Feedback
- `POST /api/messages/:id/feedback` - Submit thumbs up/down
- `GET /api/analytics/feedback` - Get feedback statistics

### User
- `GET /api/user/personality` - Get personality preference
- `PUT /api/user/personality` - Update personality

---

## 🎯 Usage

### Training Data Export
Export upvoted messages for fine-tuning:
```bash
npm run export-data
```

This creates a JSONL file in `data/training-data-{timestamp}.jsonl` compatible with OpenAI/Groq fine-tuning.

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
1. Save user message to MongoDB
2. Generate embedding → OpenAI
3. Store in Pinecone (vectorService.js)
4. Retrieve top-3 memories (cosine similarity)
5. Inject memories into system prompt
6. Stream AI response (Groq API)
7. Save assistant message
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
- **MongoDB Atlas**: Free M0 cluster (512MB)

### Monthly Costs
- **10 users, 100 messages each**: ~$0.05/month
- **100 users, 500 messages each**: ~$2/month
- **Scaling**: Pinecone paid tier at $70/month for 10M vectors

---

## 🎓 Portfolio Highlights

### Technical Achievements
✅ **Production RAG System** - Real vector database, not mock memory  
✅ **Streaming Architecture** - SSE with async generators  
✅ **Personality System** - Dynamic AI behavior  
✅ **Training Pipeline** - Data export for fine-tuning  
✅ **Full-Stack Implementation** - Backend + Frontend + Database  
✅ **Privacy-First Design** - User isolation, GDPR compliance  
✅ **Performance Optimized** - < 500ms overhead  

### Talking Points
- "Implemented RAG-based memory using Pinecone and OpenAI embeddings"
- "Built real-time streaming with Server-Sent Events and async generators"
- "Designed personality system with dynamic system prompts"
- "Created training data pipeline for model fine-tuning"
- "Architected for graceful degradation — chat works even if memory fails"

---

## 📝 Project Structure

```
SoulSync/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── context/       # React context (Auth, Chat)
│   │   ├── chat/          # Chat page components
│   │   └── index.css      # Global styles + glassmorphism
│   └── package.json
├── server/                # Express backend
│   ├── controllers/       # Route controllers
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   ├── services/         # AI & vector services
│   └── index.js          # Server entry point
├── scripts/              # Utility scripts
│   └── export-training-data.js
├── .env.example          # Environment variables template
└── package.json          # Root package.json
```

---

## 🧪 Testing

### Manual Testing Checklist
- [x] Send message, verify tokens appear incrementally
- [x] Change personality mode, verify AI tone changes
- [x] Send "My favorite color is purple", then ask "What's my favorite color?"
- [x] Verify AI recalls purple from memory
- [x] Click thumbs up, verify feedback persisted
- [x] Run `npm run export-data`, verify JSONL created

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

MIT License - feel free to use this project for learning or portfolio purposes.

---

## 🙏 Acknowledgments

- **Groq** for fast LLM inference
- **OpenAI** for embeddings API
- **Pinecone** for vector database
- **Framer Motion** for animations

---

## 📧 Contact

**Aryan B Parikh**
- GitHub: [@Aryan-B-Parikh](https://github.com/Aryan-B-Parikh)
- Project: [SoulSync](https://github.com/Aryan-B-Parikh/SoulSync)

---

**Built with ❤️ using React, Node.js, MongoDB, Groq, OpenAI, and Pinecone**
