import React, { useState } from 'react';
import { Shield, Github, MessageSquare, X, ExternalLink } from 'lucide-react';

// ── Legal Modal ────────────────────────────────────────────────
function LegalModal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md px-4 py-6 animate-fade-in overflow-y-auto">
      <div className="w-full max-w-2xl max-h-[80vh] bg-white/80 dark:bg-slate-900/90 border border-white/20 dark:border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden my-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200/60 dark:border-white/10 flex-shrink-0">
          <h2 className="text-xl font-serif text-slate-800 dark:text-slate-100">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto text-sm text-slate-500 dark:text-slate-400 leading-relaxed space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h3 className="font-medium text-slate-700 dark:text-slate-300 mb-1">{title}</h3>
      <div>{children}</div>
    </div>
  );
}

function PrivacyPolicy({ onClose }) {
  return (
    <LegalModal title="Privacy Policy" onClose={onClose}>
      <p className="text-xs text-slate-400">Last updated: February 2026</p>
      <Section title="What We Collect">
        When you sign in with Google we receive your name, email, and profile picture. We store your conversations and AI-generated memories in Neon (PostgreSQL) and Pinecone (vector DB). We never store your Google password.
      </Section>
      <Section title="How We Use Your Data">
        <ul className="list-disc list-inside space-y-1">
          <li>To provide personalised AI responses using your conversation history.</li>
          <li>Anonymised, scrubbed snippets of highly-rated conversations may improve future AI models. All personal identifiers are removed before processing.</li>
          <li>We never sell your data.</li>
        </ul>
      </Section>
      <Section title="Your Rights (GDPR)">
        <ul className="list-disc list-inside space-y-1">
          <li>Delete memories from within the app at any time.</li>
          <li>Request full account deletion — honoured within 30 days.</li>
          <li>Contact: <span className="text-soul-violet">aryanparikh.dev@gmail.com</span></li>
        </ul>
      </Section>
      <Section title="Third-Party Services">
        Groq (LLM inference), OpenAI (embeddings), Pinecone (vector storage), Neon (database). Each has its own privacy policy.
      </Section>
    </LegalModal>
  );
}

function TermsOfService({ onClose }) {
  return (
    <LegalModal title="Terms of Service" onClose={onClose}>
      <p className="text-xs text-slate-400">Last updated: February 2026</p>
      <Section title="Not a Therapist">
        <strong className="text-rose-400">SoulSync is an AI companion, not a licensed therapist.</strong> Do not use SoulSync as a substitute for professional mental health support. If you are in crisis, contact emergency services.
      </Section>
      <Section title="Acceptable Use">
        Do not attempt to access other users' data, reverse-engineer the service, or generate harmful content.
      </Section>
      <Section title="Data & Training">
        By using SoulSync you agree that anonymised, scrubbed conversation data may be used to improve the AI.
      </Section>
      <Section title="Contact">
        <span className="text-soul-violet">aryanparikh.dev@gmail.com</span> or{' '}
        <a href="https://github.com/Aryan-B-Parikh/SoulSync/issues" target="_blank" rel="noopener noreferrer" className="text-soul-violet hover:underline">GitHub Issues</a>.
      </Section>
    </LegalModal>
  );
}

// ── Main Footer ────────────────────────────────────────────────
const Footer = () => {
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  return (
    <>
      {showPrivacy && <PrivacyPolicy onClose={() => setShowPrivacy(false)} />}
      {showTerms && <TermsOfService onClose={() => setShowTerms(false)} />}

      <footer className="w-full mt-12 bg-white/10 dark:bg-black/10 backdrop-blur-sm border-t border-white/20 dark:border-white/5 transition-all duration-300">
        <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <img src="/soulsync.png" alt="SoulSync Logo" className="w-7 h-7 object-contain" />
              <span className="font-serif text-lg font-bold tracking-wide text-slate-900 dark:text-white">SoulSync AI</span>
            </div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
              A persistent companion for the introspective mind.
            </p>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 rounded-full px-4 py-1.5">
              <Shield className="w-3.5 h-3.5" />
              Privacy-First Design
            </div>
          </div>

          {/* Connect */}
          <div className="space-y-3">
            <p className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-slate-100">Connect</p>
            <div className="space-y-2">
              <FooterLink href="https://github.com/Aryan-B-Parikh" icon={<Github className="w-4 h-4" />} label="@Aryan-B-Parikh" />
              <FooterLink href="https://github.com/Aryan-B-Parikh/SoulSync/issues" icon={<MessageSquare className="w-4 h-4" />} label="Feedback & Bug Reports" />
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-500 italic">Crafted by Aryan & Prasvi</p>
          </div>

          {/* Legal */}
          <div className="space-y-3">
            <p className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-slate-100">Legal</p>
            <div className="space-y-2">
              <button onClick={() => setShowPrivacy(true)} className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-soul-violet transition-colors">Privacy Policy</button>
              <button onClick={() => setShowTerms(true)} className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-soul-violet transition-colors">Terms of Service</button>
              <a href="https://github.com/Aryan-B-Parikh/SoulSync/issues/new?title=Data+Deletion+Request" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-soul-violet transition-colors">
                GDPR Data Deletion <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="px-6 py-10 text-center border-t border-white/10 dark:border-white/5">
          <p className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">
            © {new Date().getFullYear()} SoulSync AI · Designed for the introspective mind
          </p>
        </div>
      </footer>
    </>
  );
};

function FooterLink({ href, icon, label }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100 hover:text-soul-violet transition-colors">
      {icon}{label}
    </a>
  );
}

export default Footer;
