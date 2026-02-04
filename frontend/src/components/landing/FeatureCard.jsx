/**
 * FeatureCard Component
 * Displays a single feature with icon, title, and description
 */

import React from 'react';

const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className="bg-[#1a1a1d] text-gray-300 rounded-xl p-6 shadow-xl border border-gray-700 hover:shadow-teal-500/30 transform hover:scale-[1.02] transition-all duration-300">
      <div className="text-5xl mb-3 animate-pulse text-teal-400">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2 text-teal-300">
        {title}
      </h3>
      <p className="text-sm text-gray-400">
        {description}
      </p>
    </div>
  );
};

export default FeatureCard;
