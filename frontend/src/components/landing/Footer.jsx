/**
 * Footer Component
 * App footer with copyright information
 */

import React from 'react';

const Footer = () => {
  return (
    <div className="text-center py-4 text-gray-500 text-sm flex flex-col items-center gap-2">
      <div className="flex items-center gap-1">
        <div className="w-8 h-8 overflow-hidden flex items-center justify-center">
          <img src="/soulsync.png" alt="SoulSync Logo" className="w-full h-full object-contain scale-150 opacity-70" />
        </div>
        <span className="font-serif text-lg font-semibold tracking-wider text-gray-400">SoulSync</span>
      </div>
      <span>© 2025 — Designed for the introspective, the poetic, and the profound 🌌</span>
    </div>
  );
};

export default Footer;
