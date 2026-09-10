export default function RoastLevelSelector({ value, onChange, disabled = false }) {
  const levels = [
    {
      id: 'friendly',
      icon: '🌱',
      name: 'Friendly',
      tagline: 'Keep it playful.',
      badge: 'Gentle sarcasm & encouragement',
    },
    {
      id: 'brutal',
      icon: '🔥',
      name: 'Brutal',
      tagline: "Tell me what I don't want to hear.",
      badge: 'Sharp, direct senior engineer roast',
      recommended: true,
    },
    {
      id: 'nuclear',
      icon: '☢️',
      name: 'Nuclear',
      tagline: 'No mercy.',
      badge: 'Maximum sarcasm & unvarnished truth',
    },
  ];

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-[#C4B5D4] flex items-center gap-2">
          <span className="text-[#A855F7]">🌶️</span>
          <span>Select Roast Intensity</span>
        </label>
        <span className="text-[11px] text-[#C4B5D4]/70 font-mono">Changes roast tone, not factual metrics</span>
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
              className={`relative text-left p-4 rounded-xl border transition-all duration-300 cursor-pointer flex flex-col justify-between gap-2.5 select-none ${
                isSelected
                  ? 'bg-gradient-to-br from-[rgba(63,13,99,0.75)] via-[rgba(109,40,168,0.60)] to-[rgba(168,85,247,0.35)] border-2 border-[#A855F7] shadow-[0_0_25px_rgba(168,85,247,0.30)] text-white'
                  : 'bg-[rgba(63,13,99,0.18)] hover:bg-[rgba(63,13,99,0.30)] border-[rgba(168,85,247,0.20)] hover:border-[rgba(168,85,247,0.40)] text-[#C4B5D4]'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {lvl.recommended && (
                <span className="absolute -top-2.5 right-3 text-[10px] font-extrabold font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#A855F7] text-white shadow-[0_0_10px_rgba(168,85,247,0.5)]">
                  Default
                </span>
              )}
              <div className="flex items-center justify-between">
                <span className="text-2xl">{lvl.icon}</span>
                <span className={`text-xs font-mono font-bold capitalize ${isSelected ? 'text-white' : 'text-[#C4B5D4]'}`}>
                  {lvl.name}
                </span>
              </div>

              <div>
                <p className="text-xs font-bold text-white">
                  "{lvl.tagline}"
                </p>
                <p className={`text-[11px] mt-1 leading-snug ${isSelected ? 'text-purple-200' : 'text-[#C4B5D4]/70'}`}>
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
