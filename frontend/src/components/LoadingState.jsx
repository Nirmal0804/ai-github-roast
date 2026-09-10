import { useState, useEffect } from 'react';

export default function LoadingState({ message = 'Analyzing your GitHub...' }) {
  const rotatingTips = [
    'Scanning public repositories and language distribution...',
    'Inspecting README documentation commitment...',
    'Measuring activity consistency and follow-through...',
    'Formulating constructive roast with Gemini 2.5...',
  ];

  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % rotatingTips.length);
    }, 2400);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full p-8 sm:p-10 rounded-2xl glass-panel text-center space-y-5 shadow-[0_20px_50px_rgba(63,13,99,0.35)] animate-fade-in border border-[rgba(168,85,247,0.30)]">
      <div className="relative inline-flex items-center justify-center">
        {/* Ambient glow pulse */}
        <div className="absolute w-20 h-20 bg-[#A855F7]/25 rounded-full blur-2xl animate-pulse" />
        
        {/* Orbital rotating ring */}
        <div className="absolute w-16 h-16 rounded-full border-2 border-[rgba(168,85,247,0.3)] border-t-[#A855F7] animate-spin" />

        <div className="relative w-14 h-14 rounded-2xl bg-[rgba(63,13,99,0.70)] border border-[rgba(168,85,247,0.40)] flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(168,85,247,0.4)]">
          <span className="animate-bounce">🔥</span>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-base sm:text-lg font-black text-white tracking-tight uppercase">
          {message}
        </h4>
        <p className="text-xs text-[#A855F7] font-mono transition-all duration-300 min-h-[18px]">
          {rotatingTips[tipIndex]}
        </p>
      </div>

      <div className="flex justify-center items-center gap-2 pt-1">
        <span className="w-2 h-2 rounded-full bg-[#A855F7] animate-pulse" />
        <span className="w-2 h-2 rounded-full bg-[#C4B5D4] animate-pulse delay-150" />
        <span className="w-2 h-2 rounded-full bg-[#6D28A8] animate-pulse delay-300" />
      </div>
    </div>
  );
}
