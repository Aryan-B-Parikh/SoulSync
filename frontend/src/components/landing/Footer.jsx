/**
 * Footer Component
 * App footer with copyright information
 */

import React from 'react';

const Footer = () => {
  return (
    <div className="text-center py-4 text-slate-500 dark:text-slate-400 text-sm flex flex-col items-center gap-2">
      <div className="flex items-center gap-2">
        <img src="/soulsync.png" alt="SoulSync Logo" className="w-8 h-8 object-contain opacity-70" />
        <span className="font-serif text-lg font-semibold tracking-wider text-slate-600 dark:text-slate-400">SoulSync</span>
      </div>
      <span>© 2025 — Designed for the introspective, the poetic, and the profound 🌌</span>
    </div>
  );
};

export default Footer;
