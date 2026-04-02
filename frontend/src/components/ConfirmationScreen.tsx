'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, HelpCircle, PartyPopper } from 'lucide-react';

interface Props {
  name: string;
  status: 'yes' | 'no' | 'maybe';
}

const CONFIG = {
  yes: {
    icon: <PartyPopper className="w-12 h-12" />,
    color: 'text-emerald-500',
    bg: 'from-emerald-50 to-teal-50',
    border: 'border-emerald-200',
    title: "You're on the list! 🎉",
    message: (name: string) =>
      `${name}, we can't wait to celebrate with you! We'll see you there.`,
    emoji: ['🎊', '✨', '🥂', '🎈', '💫', '🌟'],
  },
  no: {
    icon: <XCircle className="w-12 h-12" />,
    color: 'text-rose-400',
    bg: 'from-rose-50 to-red-50',
    border: 'border-rose-200',
    title: "We'll miss you 💛",
    message: (name: string) =>
      `${name}, thank you for letting us know. We hope to see you next time!`,
    emoji: ['💛', '🌸', '💌', '🙏'],
  },
  maybe: {
    icon: <HelpCircle className="w-12 h-12" />,
    color: 'text-amber-500',
    bg: 'from-amber-50 to-yellow-50',
    border: 'border-amber-200',
    title: 'Got it! 🤞',
    message: (name: string) =>
      `${name}, we've noted your response. Let us know as soon as you decide!`,
    emoji: ['🤞', '✨', '💫', '🌟'],
  },
};

function FloatingEmoji({ emoji, delay, x }: { emoji: string; delay: number; x: number }) {
  return (
    <div
      className="absolute text-2xl pointer-events-none select-none"
      style={{
        left: `${x}%`,
        bottom: '-20px',
        animation: `floatUp 2.5s ease-out ${delay}s forwards`,
      }}
    >
      {emoji}
    </div>
  );
}

export default function ConfirmationScreen({ name, status }: Props) {
  const config = CONFIG[status];
  const [showEmojis, setShowEmojis] = useState(false);
  const [emojiPositions] = useState(() =>
    config.emoji.map((e, i) => ({
      emoji: e,
      delay: i * 0.15,
      x: 10 + (i * 14) % 80,
    }))
  );

  useEffect(() => {
    const timer = setTimeout(() => setShowEmojis(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #fdf8f0 0%, #faf4eb 40%, #f5ede0 100%)' }}
    >
      {/* Animated background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: status === 'yes'
            ? 'radial-gradient(ellipse at center, rgba(52,211,153,0.08) 0%, transparent 70%)'
            : status === 'no'
            ? 'radial-gradient(ellipse at center, rgba(251,113,133,0.08) 0%, transparent 70%)'
            : 'radial-gradient(ellipse at center, rgba(251,191,36,0.1) 0%, transparent 70%)',
        }}
      />

      {/* Floating emojis */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {showEmojis && emojiPositions.map((p, i) => (
          <FloatingEmoji key={i} {...p} />
        ))}
      </div>

      <div
        className="relative z-10 max-w-sm w-full text-center animate-confetti"
        style={{ animationFillMode: 'both' }}
      >
        {/* Icon */}
        <div
          className={`inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br ${config.bg} border ${config.border} mb-6 ${config.color}`}
        >
          {config.icon}
        </div>

        {/* Text */}
        <h1 className="font-display text-3xl sm:text-4xl text-ink-900 mb-3 leading-tight">
          {config.title}
        </h1>

        <p className="font-body text-ink-500 text-base leading-relaxed mb-8 px-2">
          {config.message(name)}
        </p>

        {/* Decorative line */}
        <div className="ornament-line mb-8">
          <span className="text-gold-500 font-display text-lg">✦</span>
        </div>

        {/* Share prompt */}
        <p className="font-body text-xs text-ink-300 tracking-wide">
          Your response has been recorded. See you soon!
        </p>
      </div>

      {/* Float animation */}
      <style>{`
        @keyframes floatUp {
          0%   { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(-120vh) rotate(720deg); opacity: 0; }
        }
        @keyframes confetti {
          0%   { transform: scale(0.7) rotate(-5deg); opacity: 0; }
          60%  { transform: scale(1.05) rotate(2deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        .animate-confetti {
          animation: confetti 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s both;
        }
      `}</style>
    </main>
  );
}
