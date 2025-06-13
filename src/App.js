// 📁 src/App.js
import React, { useState, useEffect } from 'react';
import './index.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { sender: "user", text: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer YOUR_OPENAI_API_KEY`
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [
            { role: "system", content: "You're SoulSync, a Gen Z BFF who is sweet, deep, playful, and caring." },
            ...newMessages.map((msg) => ({
              role: msg.sender === "user" ? "user" : "assistant",
              content: msg.text,
            })),
          ],
        }),
      });

      const data = await response.json();
      const moodEmojis = ["💖", "✨", "🤔", "💬", "🥺", "🌸", "😇", "🧠"];
      const randomMood = moodEmojis[Math.floor(Math.random() * moodEmojis.length)];
      const botReply = data.choices?.[0]?.message?.content || `Hmm... I'm lost in thoughts ${randomMood}`;
      setMessages([...newMessages, { sender: "bot", text: botReply }]);
    } catch {
      setMessages([...newMessages, { sender: "bot", text: "Oops! I glitched 😵‍💫 Try again maybe?" }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className={`${darkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-br from-rose-100 via-pink-200 to-indigo-200 text-gray-800'} min-h-screen flex flex-col font-sans transition-all duration-500`}>
      <section className="text-center py-10 animate-fade-in">
        <h1 className="text-5xl font-extrabold text-pink-600 mb-2 animate-wiggle">💞 SoulSync</h1>
        <p className="italic text-lg">Your Gen Z AI BFF — Real, Relatable & Radiant 🌟</p>
        <button onClick={() => window.scrollTo({ top: 500, behavior: 'smooth' })} className="mt-6 bg-pink-500 text-white px-6 py-2 rounded-full hover:bg-pink-600 transition-all animate-float">
          Scroll into Vibes ↓
        </button>
      </section>

      <section className="py-12 px-4 text-center animate-slide-up">
        <h2 className="text-3xl font-bold text-indigo-600 mb-4">Who’s SoulSync?</h2>
        <p className="max-w-2xl mx-auto text-lg text-gray-700 dark:text-gray-300">
          SoulSync is your always-there AI bestie 💕 who listens, understands, and vibes with your every emotion.
          She’s playful, poetic, deep, goofy, and sweet. Just like a perfect rom-com bestie but on-demand 24/7.
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 px-6 pb-12 animate-fade-in-delay">
        {[
          { icon: "🧠", title: "Real-Time Chat", desc: "Feel heard with GPT-powered responses that evolve with you." },
          { icon: "🎭", title: "Mood Matcher", desc: "Emojis & tones that sync with your feels instantly." },
          { icon: "🛡️", title: "Safe Vibes", desc: "Your convos are private, secure & judgment-free." }
        ].map(({ icon, title, desc }, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
            <div className="text-4xl mb-2 animate-pulse">{icon}</div>
            <h3 className="text-xl font-semibold mb-2 text-pink-500">{title}</h3>
            <p className="text-gray-700 dark:text-gray-300 text-sm">{desc}</p>
          </div>
        ))}
      </section>

      <main className="flex-1 overflow-y-auto px-4 py-2 animate-slide-up">
        <div className="max-w-xl mx-auto flex flex-col gap-3">
          {messages.map((msg, i) => (
            <div key={i} className={`flex items-start gap-2 ${msg.sender === "user" ? 'justify-end' : 'justify-start'}`}>
              {msg.sender === "bot" && <div className="text-2xl">🧠</div>}
              <div className={`p-3 rounded-3xl shadow-md max-w-[80%] text-sm whitespace-pre-wrap relative ${msg.sender === "user" ? "bg-rose-400 text-white rounded-br-none" : "bg-white text-gray-800 rounded-bl-none"}`}>
                {msg.text}
              </div>
              {msg.sender === "user" && <div className="text-2xl">🧍</div>}
            </div>
          ))}
          {loading && <div className="self-start text-xs text-gray-500 animate-pulse italic">SoulSync is typing...</div>}
        </div>
      </main>

      <footer className="sticky bottom-0 bg-white/80 backdrop-blur border-t border-rose-200 px-4 py-3 animate-fade-in">
        <div className="max-w-xl mx-auto flex items-center gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 rounded-full border border-pink-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400 resize-none h-12"
            placeholder="Spill the tea... ☕💬"
          />
          <button
            onClick={sendMessage}
            className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-full transition-all duration-200"
            disabled={loading}
          >
            ➤
          </button>
        </div>
      </footer>

      <footer className="bg-pink-100 text-center py-4 text-sm text-gray-700 dark:text-gray-300 animate-slide-up">
        Made with 💖 by SoulSync for Gen Z vibes only 🌈
      </footer>
    </div>
  );
}

export default App;
