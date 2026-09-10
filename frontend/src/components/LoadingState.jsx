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
    <div className="w-full p-7 rounded-2xl bg-slate-900/80 border border-purple-800/40 backdrop-blur-xl text-center space-y-4 shadow-xl shadow-purple-950/20 animate-fade-in">
      <div className="relative inline-flex items-center justify-center">
        {/* Ambient glow pulse */}
        <div className="absolute w-12 h-12 bg-purple-500/30 rounded-full blur-xl animate-pulse" />
        
        <div className="relative w-12 h-12 rounded-2xl bg-purple-950/80 border border-purple-700/60 flex items-center justify-center text-2xl shadow-lg">
          <span className="animate-bounce">🔥</span>
        </div>
      </div>

      <div className="space-y-1.5">
        <h4 className="text-base font-bold text-slate-100 tracking-tight">
          {message}
        </h4>
        <p className="text-xs text-purple-400 font-mono transition-all duration-300 min-h-[18px]">
          {rotatingTips[tipIndex]}
        </p>
      </div>

      <div className="flex justify-center items-center gap-1.5 pt-1">
        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
        <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse delay-150" />
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse delay-300" />
      </div>
    </div>
  );
}
