import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send } from 'lucide-react';

const MessageInput = ({ value, onChange, onSend, disabled, placeholder }) => {
  const textareaRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState([]);
  const buttonRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [value]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Magnetic button effect
  const handleMouseMove = (e) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = (e.clientX - centerX) * 0.15;
    const deltaY = (e.clientY - centerY) * 0.15;
    setMousePosition({ x: deltaX, y: deltaY });
  };

  const handleMouseLeave = () => {
    setMousePosition({ x: 0, y: 0 });
    setIsHovering(false);
  };

  // Particle burst on send
  const handleSend = () => {
    if (!value.trim() || disabled) return;

    // Create particles
    const newParticles = Array.from({ length: 8 }, (_, i) => ({
      id: Date.now() + i,
      angle: (i / 8) * 360,
    }));
    setParticles(newParticles);

    // Clear particles after animation
    setTimeout(() => setParticles([]), 600);

    onSend();
  };

  // Determine glow color based on typing state
  const hasContent = value.trim().length > 0;
  const glowColor = hasContent
    ? 'shadow-soul-gold/40'
    : 'shadow-soul-violet/20';

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`w-full flex items-end gap-3 bg-white dark:bg-slate-800 backdrop-blur-2xl rounded-2xl p-2 pl-6 border border-black/5 dark:border-white/10 transition-all duration-500 ${hasContent ? 'shadow-lg ' + glowColor : 'shadow-md shadow-black/10'}`}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={1}
        disabled={disabled}
        className="flex-1 bg-transparent text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 py-3 focus:outline-none resize-none overflow-hidden text-base disabled:opacity-50"
        placeholder={placeholder || "What's on your mind today?"}
        style={{ minHeight: '48px' }}
      />

      {/* Magnetic Send Button */}
      <div
        className="relative"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={handleMouseLeave}
      >
        {/* Particle Effects */}
        <AnimatePresence>
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute w-2 h-2 rounded-full bg-gradient-to-r from-soul-violet to-soul-gold"
              initial={{
                x: 20,
                y: 20,
                scale: 1,
                opacity: 1
              }}
              animate={{
                x: Math.cos(particle.angle * Math.PI / 180) * 40 + 20,
                y: Math.sin(particle.angle * Math.PI / 180) * 40 + 20,
                scale: 0,
                opacity: 0
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          ))}
        </AnimatePresence>

        <motion.button
          ref={buttonRef}
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          animate={{
            x: isHovering ? mousePosition.x : 0,
            y: isHovering ? mousePosition.y : 0,
            scale: isHovering ? 1.05 : 1,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          whileTap={{ scale: 0.95 }}
          className={`relative flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mb-0.5 shrink-0 ${hasContent
            ? 'bg-gradient-to-r from-soul-violet to-soul-gold shadow-lg shadow-soul-violet/30'
            : 'bg-white/10 dark:bg-white/5'
            }`}
          aria-label="Send message"
        >
          {hasContent ? (
            <Send className="w-5 h-5 text-white" />
          ) : (
            <Sparkles className="w-5 h-5 text-text-muted-light dark:text-text-muted-dark" />
          )}

          {/* Glow effect on hover */}
          <motion.div
            className="absolute inset-0 rounded-xl bg-white/20 blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovering && hasContent ? 0.5 : 0 }}
            transition={{ duration: 0.2 }}
          />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default MessageInput;

