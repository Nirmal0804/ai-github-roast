export default function ActionPlan({ actionPlan = [] }) {
  const safeActions = Array.isArray(actionPlan) ? actionPlan : [];

  if (safeActions.length === 0) {
    return null;
  }

  const getPriorityBadge = (priority) => {
    const p = (priority || '').toLowerCase();
    if (p.includes('high')) {
      return { label: 'High', badge: 'bg-rose-950/50 text-rose-300 border-rose-800/40' };
    }
    if (p.includes('med')) {
      return { label: 'Medium', badge: 'bg-amber-950/50 text-amber-300 border-amber-800/40' };
    }
    return { label: 'Low', badge: 'bg-blue-950/50 text-blue-300 border-blue-800/40' };
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
        <div className="flex items-center gap-2">
          <span className="text-xl">🚀</span>
          <h3 className="text-base sm:text-lg font-black text-slate-100 tracking-tight">
            Your Action Plan
          </h3>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          Prioritized practical upgrades based on detected weaknesses
        </span>
      </div>

      <div className="space-y-3.5">
        {safeActions.map((item, idx) => {
          const priorityInfo = getPriorityBadge(item.priority);
          return (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-slate-950/70 border border-purple-900/30 hover:border-purple-600/40 transition-all space-y-3 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-purple-300 bg-purple-950/60 px-2.5 py-1 rounded-lg border border-purple-800/50">
                    0{idx + 1}
                  </span>
                  <h4 className="text-sm sm:text-base font-bold text-slate-100">
                    {item.title}
                  </h4>
                </div>
                <span className={`text-[10px] font-mono font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${priorityInfo.badge}`}>
                  {priorityInfo.label} Priority
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-900 text-xs">
                <div className="space-y-1">
                  <span className="font-mono uppercase font-bold text-purple-400/90 text-[10px] tracking-wider">
                    Why:
                  </span>
                  <p className="text-slate-300 leading-relaxed">
                    {item.reason}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="font-mono uppercase font-bold text-emerald-400/90 text-[10px] tracking-wider">
                    Expected Impact:
                  </span>
                  <p className="text-slate-300 leading-relaxed">
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
