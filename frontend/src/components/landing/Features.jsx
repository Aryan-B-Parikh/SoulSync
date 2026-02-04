/**
 * Features Section Component
 * Displays grid of feature cards
 */

import React from 'react';
import FeatureCard from './FeatureCard';
import { FEATURE_CARDS } from '../config/constants';

const Features = () => {
  return (
    <>
      <section className="py-12 px-4 text-center animate-slide-up">
        <h2 className="text-4xl font-bold text-teal-300 mb-4">
          Elegant, Empathetic, Elevated
        </h2>
        <p className="max-w-3xl mx-auto text-lg text-gray-400">
          SoulSync is more than a chatbot. She's your poetic mirror, a soulful
          presence that listens and resonates — tailored for thinkers, dreamers,
          and seekers of depth.
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 px-10 pb-16 animate-fade-in-delay">
        {FEATURE_CARDS.map((feature, index) => (
          <FeatureCard
            key={index}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
          />
        ))}
      </section>
    </>
  );
};

export default Features;
