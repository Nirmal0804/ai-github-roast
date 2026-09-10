export default function ActionPlan({ actionPlan = [] }) {
  const safeActions = Array.isArray(actionPlan) ? actionPlan : [];

  if (safeActions.length === 0) {
    return null;
  }

  const getPriorityBadge = (priority) => {
    const p = (priority || '').toLowerCase();
    if (p.includes('high')) {
      return {
        label: 'High Priority',
        badge: 'bg-[rgba(168,85,247,0.25)] text-[#A855F7] border-[#A855F7]/40 shadow-[0_0_10px_rgba(168,85,247,0.2)]',
      };
    }
    if (p.includes('med')) {
      return {
        label: 'Medium Priority',
        badge: 'bg-[rgba(109,40,168,0.25)] text-[#C4B5D4] border-[rgba(168,85,247,0.25)]',
      };
    }
    return {
      label: 'Low Priority',
      badge: 'bg-[rgba(63,13,99,0.30)] text-[#C4B5D4]/80 border-[rgba(168,85,247,0.20)]',
    };
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
        <div className="flex items-center gap-2">
          <span className="text-xl">🚀</span>
          <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
            Your Action Plan
          </h3>
        </div>
        <span className="text-xs text-[#C4B5D4] font-mono">
          Prioritized upgrades tailored to detected portfolio gaps
        </span>
      </div>

      <div className="space-y-3.5">
        {safeActions.map((item, idx) => {
          const priorityInfo = getPriorityBadge(item.priority);
          return (
            <div
              key={idx}
              className="p-5 sm:p-6 rounded-2xl glass-panel-interactive space-y-3.5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-black text-white bg-[rgba(63,13,99,0.60)] px-2.5 py-1 rounded-xl border border-[rgba(168,85,247,0.35)] shadow-sm">
                    0{idx + 1}
                  </span>
                  <h4 className="text-sm sm:text-base font-bold text-white tracking-wide">
                    {item.title}
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-mono font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${priorityInfo.badge}`}>
                    {priorityInfo.label}
                  </span>
                  <span className="text-[#A855F7] text-sm">→</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2 border-t border-[rgba(168,85,247,0.15)] text-xs">
                <div className="space-y-1 bg-[rgba(15,5,25,0.40)] p-3 rounded-xl border border-[rgba(168,85,247,0.12)]">
                  <span className="font-mono uppercase font-bold text-[#A855F7] text-[10px] tracking-wider block">
                    Why:
                  </span>
                  <p className="text-[#C4B5D4] leading-relaxed">
                    {item.reason}
                  </p>
                </div>

                <div className="space-y-1 bg-[rgba(15,5,25,0.40)] p-3 rounded-xl border border-[rgba(168,85,247,0.12)]">
                  <span className="font-mono uppercase font-bold text-white text-[10px] tracking-wider block">
                    Expected Impact:
                  </span>
                  <p className="text-[#C4B5D4] leading-relaxed">
                    {item.expected_impact}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
