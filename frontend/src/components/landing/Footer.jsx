/**
 * Footer Component
 * App footer with copyright information
 */

import React from 'react';

const Footer = () => {
  return (
    <div className="text-center py-4 text-gray-500 text-sm flex flex-col items-center gap-2">
      <div className="flex items-center gap-2">
        <img src="/soulsync.png" alt="SoulSync Logo" className="w-6 h-6 object-contain opacity-70" />
        <span className="font-serif text-base font-semibold tracking-wider text-gray-400">SoulSync</span>
      </div>
      <span>© 2025 — Designed for the introspective, the poetic, and the profound 🌌</span>
    </div>
  );
};

export default Footer;
