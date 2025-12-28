# 🧘‍♀️ SoulSync AI

[![License: MIT](https://img.shields.io/badge/License-MIT-teal.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19.1.0-61DAFB?logo=react)](https://reactjs.org/)
[![Node](https://img.shields.io/badge/Node-14+-339933?logo=node.js)](https://nodejs.org/)

> **A sophisticated AI companion for thoughtful conversations**

SoulSync is an AI-powered chat application that provides empathetic, thoughtful responses through an elegant, minimalist interface. Built with modern web technologies and powered by advanced AI models, it's designed for thinkers, dreamers, and seekers of depth.

## ✨ Features

- 🧠 **Intelligent AI Conversations** - Powered by Groq's LLaMA3 model
- 🎨 **Beautiful Dark UI** - Elegant design with smooth animations
- 🔒 **Privacy First** - Secure API communication with rate limiting
- ⚡ **Fast & Responsive** - Built with React 19 and modern best practices
- 🌐 **Production Ready** - Deployable to Vercel with one click
- 🛡️ **Error Handling** - Graceful fallbacks and comprehensive error boundaries

## 🚀 Quick Start

### Prerequisites

- Node.js 14+ and npm 6+
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
   
   Edit `.env` and add your API key:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
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

## 🛠️ Technology Stack

### Frontend
- **React 19** - Modern UI library
- **Tailwind CSS** - Utility-first styling
- **Custom Hooks** - Reusable logic patterns
- **Error Boundaries** - Graceful error handling

### Backend
- **Node.js & Express** - Server framework
- **Groq API** - LLaMA3 AI model
- **Rate Limiting** - Request throttling
- **Input Validation** - Security middleware

### Deployment
- **Vercel** - Serverless platform
- **Environment Variables** - Secure configuration

## 📚 Available Scripts

- `npm run dev` - Run both frontend and backend in development
- `npm run build` - Build frontend for production
- `npm run server:dev` - Run backend server only
- `npm test` - Run all tests

## 🔐 Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `GROQ_API_KEY` | Groq API key for AI | Yes | - |
| `NODE_ENV` | Environment mode | Yes | development |
| `PORT` | Server port | No | 5001 |

## 📖 Documentation

- [Architecture Guide](docs/ARCHITECTURE.md) - System design and structure
- [API Documentation](docs/API.md) - API endpoints and usage
- [Contributing Guide](docs/CONTRIBUTING.md) - How to contribute

## 📄 License

This project is licensed under the MIT License.

---

<div align="center">
  <sub>Built with ❤️ for the introspective, the poetic, and the profound 🌌</sub>
</div>
