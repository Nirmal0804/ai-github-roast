export default function RoastLevelSelector({ value, onChange, disabled = false }) {
  const levels = [
    {
      id: 'friendly',
      icon: '🌱',
      name: 'Friendly',
      tagline: 'Keep it playful.',
      badge: 'Gentle sarcasm & encouragement',
      activeColor: 'border-emerald-500/60 bg-emerald-950/30 text-emerald-300 shadow-emerald-950/40',
      activeRing: 'ring-emerald-500/40',
    },
    {
      id: 'brutal',
      icon: '🔥',
      name: 'Brutal',
      tagline: "Tell me what I don't want to hear.",
      badge: 'Sharp, direct senior engineer roast',
      activeColor: 'border-purple-500/60 bg-purple-950/40 text-purple-300 shadow-purple-950/40',
      activeRing: 'ring-purple-500/40',
      recommended: true,
    },
    {
      id: 'nuclear',
      icon: '☢️',
      name: 'Nuclear',
      tagline: 'No mercy.',
      badge: 'Maximum sarcasm & brutal truth',
      activeColor: 'border-rose-500/60 bg-rose-950/40 text-rose-300 shadow-rose-950/40',
      activeRing: 'ring-rose-500/40',
    },
  ];

  return (
    <div className="w-full space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <span>🌶️</span>
          <span>Select Roast Intensity</span>
        </label>
        <span className="text-[11px] text-slate-400">Affects roast tone, not factual metrics</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {levels.map((lvl) => {
          const isSelected = value === lvl.id;
          return (
            <button
              key={lvl.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange(lvl.id)}
              className={`relative text-left p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2 select-none ${
                isSelected
                  ? `${lvl.activeColor} border-2 shadow-lg ring-2 ${lvl.activeRing}`
                  : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-slate-900/90'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {lvl.recommended && (
                <span className="absolute -top-2 right-3 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-600 text-white shadow-sm">
                  Default
                </span>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xl">{lvl.icon}</span>
                <span className="text-xs font-mono font-bold capitalize text-slate-300">
                  {lvl.name}
                </span>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-100">
                  "{lvl.tagline}"
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                  {lvl.badge}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
