// 📁 src/App.js
import React, { useState } from 'react';
import './index.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const darkMode = true; // Fixed to dark mode for now

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { sender: "user", text: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(process.env.REACT_APP_API_URL || "/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: newMessages.map((msg) => ({
            role: msg.sender === "user" ? "user" : "assistant",
            content: msg.text,
          })),
        }),
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      const botReply = data.message || `I'm pondering that... 🧘‍♀️`;
      setMessages([...newMessages, { sender: "bot", text: botReply }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages([...newMessages, { sender: "bot", text: "Apologies, darling. I seem to have lost my connection. Could you try again? 🤖💭" }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className={`${darkMode ? 'bg-[#0e0e10] text-gray-100' : 'bg-gray-100 text-gray-800'} min-h-screen flex flex-col font-serif transition-colors duration-700`}>
      <section className="text-center py-10 animate-fade-in">
        <h1 className="text-6xl font-extrabold text-teal-400 mb-2 tracking-widest animate-drop-in">SoulSync</h1>
        <p className="italic text-xl text-gray-400">Your high-class AI companion 🕊️💬</p>
        <button onClick={() => window.scrollTo({ top: 500, behavior: 'smooth' })} className="mt-6 bg-teal-500 text-white px-6 py-2 rounded-full hover:bg-teal-600 transition-all animate-float">
          Explore ↓
        </button>
      </section>

      <section className="py-12 px-4 text-center animate-slide-up">
        <h2 className="text-4xl font-bold text-teal-300 mb-4">Elegant, Empathetic, Elevated</h2>
        <p className="max-w-3xl mx-auto text-lg text-gray-400">
          SoulSync is more than a chatbot. She's your poetic mirror, a soulful presence that listens and resonates — tailored for thinkers, dreamers, and seekers of depth.
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 px-10 pb-16 animate-fade-in-delay">
        {[{ icon: "🧠", title: "Cognitive Depth", desc: "GPT-4 infused, SoulSync holds space for your inner world." },
          { icon: "🎨", title: "Artful Design", desc: "Minimal, elegant, soft animations with purpose." },
          { icon: "🔒", title: "Privacy First", desc: "Your moments remain sacred, always encrypted." }].map(({ icon, title, desc }, i) => (
          <div key={i} className="bg-[#1a1a1d] text-gray-300 rounded-xl p-6 shadow-xl border border-gray-700 hover:shadow-teal-500/30 transform hover:scale-[1.02] transition-all duration-300">
            <div className="text-5xl mb-3 animate-pulse text-teal-400">{icon}</div>
            <h3 className="text-xl font-semibold mb-2 text-teal-300">{title}</h3>
            <p className="text-sm text-gray-400">{desc}</p>
          </div>
        ))}
      </section>

      <main className="flex-1 overflow-y-auto px-4 py-2 animate-slide-up">
        <div className="max-w-2xl mx-auto flex flex-col gap-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex items-start gap-3 ${msg.sender === "user" ? 'justify-end' : 'justify-start'}`}>
              {msg.sender === "bot" && <div className="text-xl">🤖</div>}
              <div className={`p-4 rounded-3xl shadow-md max-w-[80%] text-sm whitespace-pre-wrap ${msg.sender === "user" ? "bg-teal-600 text-white rounded-br-none" : "bg-gray-800 text-gray-100 rounded-bl-none"}`}>
                {msg.text}
              </div>
              {msg.sender === "user" && <div className="text-xl">👤</div>}
            </div>
          ))}
          {loading && <div className="self-start text-xs text-gray-500 animate-pulse italic">SoulSync is responding...</div>}
        </div>
      </main>

      <footer className="sticky bottom-0 bg-[#111] backdrop-blur border-t border-gray-700 px-4 py-4 animate-fade-in">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            className="flex-1 rounded-xl border border-teal-500 bg-[#1e1e20] text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none"
            placeholder="What's on your mind, darling?"
          />
          <button
            onClick={sendMessage}
            className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-xl transition-all duration-200"
            disabled={loading}
          >
            ➤
          </button>
        </div>
      </footer>

      <div className="text-center py-4 text-gray-500 text-sm">
        SoulSync © 2025 — Designed for the introspective, the poetic, and the profound 🌌
      </div>
    </div>
  );
}

export default App;
