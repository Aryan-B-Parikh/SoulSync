/**
 * Hero Section Component
 * Landing page header with brand identity and call-to-action
 */

import React from 'react';

const Hero = () => {
  const scrollToChat = () => {
    window.scrollTo({ top: 500, behavior: 'smooth' });
  };

  return (
    <section className="text-center py-10 animate-fade-in">
      <div className="flex items-center justify-center gap-4 mb-2 animate-drop-in">
        <img src="/soulsync.png" alt="SoulSync Logo" className="w-20 h-20 md:w-28 md:h-28 object-contain drop-shadow-[0_0_25px_rgba(20,184,166,0.5)]" />
        <h1 className="text-7xl md:text-9xl font-extrabold text-teal-400 tracking-widest">
          SoulSync
        </h1>
      </div>
      <p className="italic text-xl text-gray-400">
        Your high-class AI companion 🕊️💬
      </p>
      <button
        onClick={scrollToChat}
        className="mt-6 bg-teal-500 text-white px-6 py-2 rounded-full hover:bg-teal-600 transition-all animate-float"
      >
        Explore ↓
      </button>
    </section>
  );
};

export default Hero;
