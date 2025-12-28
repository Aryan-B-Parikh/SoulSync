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
      <h1 className="text-6xl font-extrabold text-teal-400 mb-2 tracking-widest animate-drop-in">
        SoulSync
      </h1>
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
