# 🧘‍♀️ SoulSync AI

[![License: MIT](https://img.shields.io/badge/License-MIT-teal.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19.1.0-61DAFB?logo=react)](https://reactjs.org/)
[![Node](https://img.shields.io/badge/Node-14+-339933?logo=node.js)](https://nodejs.org/)

> **A sophisticated AI companion for thoughtful conversations with full authentication and persistence**

SoulSync is a production-ready AI chat application that provides empathetic, thoughtful responses through an elegant interface. Built with modern web technologies, MongoDB persistence, JWT authentication, and powered by Groq's advanced AI models.

## ✨ Features

- 🧠 **Intelligent AI Conversations** - Powered by Groq's LLaMA-3.3-70b model
- 🔐 **Secure Authentication** - JWT-based auth with bcrypt password hashing
- 💾 **Persistent Conversations** - MongoDB storage with full chat history
- 👤 **User Accounts** - Register, login, and manage your profile
- 💬 **Chat Continuity** - Resume conversations from sidebar
- 🎨 **Beautiful Dark UI** - Elegant design with smooth animations
- 🛡️ **Production Security** - Rate limiting, validation, error handling
- ⚡ **Fast & Responsive** - React 19 with optimized state management
- 🌐 **Serverless Ready** - Deployable to Vercel with one click
- ✅ **Comprehensive Tests** - Full integration and smoke test coverage

## 🚀 Quick Start

### Prerequisites

- Node.js 14+ and npm 6+
- MongoDB (local or Atlas)
- A Groq API key (get one at [console.groq.com](https://console.groq.com/))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Aryan-B-Parikh/SoulSync.git
   cd SoulSync
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd client && npm install && cd ..
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure:
   ```env
   # API Keys
   GROQ_API_KEY=your_groq_api_key_here
   
   # Database
   MONGODB_URI=mongodb://localhost:27017/soulsync
   # Or use MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/soulsync
   
   # Authentication
   JWT_SECRET=your_secure_random_string_here
   
   # Server
   NODE_ENV=development
   PORT=5001
   ```

4. **Run the application**
   ```bash
   npm run dev
   ```

   This starts both the backend server (port 5001) and frontend (port 3000).

5. **Open your browser**
   ```
   http://localhost:3000
   ```

6. **Create an account** and start chatting!

## 🛠️ Technology Stack

### Frontend
- **React 19** - Modern UI library
- **Context API** - Global auth and chat state
- **Tailwind CSS** - Utility-first styling
- **Custom Hooks** - Reusable logic patterns
- **Error Boundaries** - Graceful error handling

### Backend
- **Node.js & Express** - Server framework
- **MongoDB & Mongoose** - Database with ODM
- **JWT** - Token-based authentication
- **bcrypt** - Password hashing
- **Groq API** - LLaMA-3.3-70b AI model
- **Rate Limiting** - Request throttling
- **express-validator** - Input validation

### Deployment
- **Vercel** - Serverless platform
- **MongoDB Atlas** - Cloud database
- **Environment Variables** - Secure configuration

## 📚 Available Scripts

### Development
- `npm run dev` - Run both frontend and backend
- `npm run server:dev` - Run backend only
- `npm run client:dev` - Run frontend only

### Testing
- `npm test` - Run all tests
- `npm run test:auth` - Run authentication tests
- `npm run test:chat` - Run chat persistence tests
- `npm run smoke` - Quick smoke test

### Production
- `npm run build` - Build frontend for production
- `npm start` - Start production server

### Utilities
- `npm run lint` - Lint code
- `npm run format` - Format with Prettier

## 🔐 Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `GROQ_API_KEY` | Groq API key for AI | Yes | - |
| `MONGODB_URI` | MongoDB connection string | Yes | - |
| `JWT_SECRET` | JWT signing secret | Yes | - |
| `NODE_ENV` | Environment mode | Yes | development |
| `PORT` | Server port | No | 5001 |

## 📖 Documentation

- [Architecture Guide](docs/ARCHITECTURE.md) - System design and structure
- [Deployment Modes](docs/DEPLOYMENT_MODES.md) - Local, production, and Vercel deployment
- [Testing Guide](docs/TESTING.md) - How to run and write tests
- [API Documentation](docs/API.md) - API endpoints and usage
- [Contributing Guide](docs/CONTRIBUTING.md) - How to contribute

## 📄 License

This project is licensed under the MIT License.

---

<div align="center">
  <sub>Built with ❤️ for the introspective, the poetic, and the profound 🌌</sub>
</div>
