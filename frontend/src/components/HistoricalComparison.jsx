import { useState, useEffect } from 'react';
import { getAnalysisHistory, clearAnalysisHistory } from '../utils/historyStorage.js';

export default function HistoricalComparison({ currentSnapshot, onSelectSnapshot }) {
  const [history, setHistory] = useState([]);
  const [selectedBaselineId, setSelectedBaselineId] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const refreshHistory = () => {
    const list = getAnalysisHistory();
    setHistory(list);
  };

  useEffect(() => {
    refreshHistory();
  }, [currentSnapshot]);

  // Determine baseline snapshot for comparison
  // By default, if we have at least 2 entries in history, compare the current one with the previous one
  const currentItem = currentSnapshot || history[0];

  // Candidates for baseline comparison: other items in history (prefer same username if available)
  const otherItems = history.filter((item) => item.id !== currentItem?.id);

  const baselineItem = selectedBaselineId
    ? history.find((item) => item.id === selectedBaselineId)
    : otherItems.find((item) => item.username?.toLowerCase() === currentItem?.username?.toLowerCase()) || otherItems[0];

  const handleClearHistory = () => {
    clearAnalysisHistory();
    setHistory([]);
    setSelectedBaselineId(null);
    setShowClearConfirm(false);
  };

  const renderDelta = (currentVal, baselineVal) => {
    if (currentVal === undefined || baselineVal === undefined || currentVal === null || baselineVal === null) {
      return <span className="text-slate-500 text-xs">N/A</span>;
    }
    const delta = currentVal - baselineVal;
    if (delta > 0) {
      return (
        <span className="font-mono font-bold text-emerald-400 inline-flex items-center gap-0.5 text-xs">
          +{delta}
        </span>
      );
    }
    if (delta < 0) {
      return (
        <span className="font-mono font-bold text-rose-400 inline-flex items-center gap-0.5 text-xs">
          {delta}
        </span>
      );
    }
    return <span className="font-mono text-slate-400 text-xs">0</span>;
  };

  return (
    <div className="space-y-6 pt-4 border-t border-slate-800/80">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">📈</span>
            <h3 className="text-base sm:text-lg font-black text-slate-100 tracking-tight">
              Compare Your Progress
            </h3>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Local historical analysis &amp; trajectory tracking (stored locally in browser)
          </p>
        </div>

        {history.length > 0 && (
          <div className="flex items-center gap-2">
            {!showClearConfirm ? (
              <button
                type="button"
                onClick={() => setShowClearConfirm(true)}
                className="text-xs text-slate-400 hover:text-rose-300 transition-colors px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-rose-900/50 cursor-pointer"
              >
                Clear History
              </button>
            ) : (
              <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-900 border border-rose-800/80">
                <span className="text-[11px] text-rose-300 font-medium px-2">Confirm clear?</span>
                <button
                  type="button"
                  onClick={handleClearHistory}
                  className="px-2 py-0.5 text-[11px] font-bold rounded bg-rose-600 text-white hover:bg-rose-500 cursor-pointer"
                >
                  Yes, Clear
                </button>
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(false)}
                  className="px-2 py-0.5 text-[11px] rounded text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Comparison Delta View */}
      {currentItem && baselineItem ? (
        <div className="p-6 rounded-3xl bg-slate-950/70 border border-purple-900/40 space-y-6">
          {/* Top Comparison Header Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Baseline Card */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono uppercase font-bold text-slate-400">Baseline Analysis</span>
                <span className="text-[11px]">{baselineItem.dateLabel}</span>
              </div>
              <div className="flex items-baseline justify-between">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black font-mono text-slate-200">
                    {baselineItem.overall_score}
                  </span>
                  <span className="text-xs text-slate-500 font-bold">/100</span>
                </div>
                <span className="text-xs font-mono font-bold text-purple-400/80 capitalize">
                  {baselineItem.roast_level}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                @{baselineItem.username} &bull; {baselineItem.league || 'Builder'}
              </div>
            </div>

            {/* Current / Target Card */}
            <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-800/50 space-y-2">
              <div className="flex items-center justify-between text-xs text-purple-300">
                <span className="font-mono uppercase font-bold text-purple-300">Current Analysis</span>
                <span className="text-[11px]">{currentItem.dateLabel}</span>
              </div>
              <div className="flex items-baseline justify-between">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black font-mono text-white">
                    {currentItem.overall_score}
                  </span>
                  <span className="text-xs text-slate-400 font-bold">/100</span>
                  <span className="ml-1 text-sm font-bold">
                    {renderDelta(currentItem.overall_score, baselineItem.overall_score)}
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-pink-400 capitalize">
                  {currentItem.roast_level}
                </span>
              </div>
              <div className="text-[11px] text-slate-300 font-mono">
                @{currentItem.username} &bull; {currentItem.league || 'Builder'}
              </div>
            </div>
          </div>

          {/* Metric Comparison Table */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Core Engineering Score Breakdown
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {[
                {
                  label: 'Technical Depth',
                  curr: currentItem.technical_depth_score,
                  base: baselineItem.technical_depth_score,
                },
                {
                  label: 'Project Quality',
                  curr: currentItem.project_quality_score,
                  base: baselineItem.project_quality_score,
                },
                {
                  label: 'Documentation',
                  curr: currentItem.documentation_score,
                  base: baselineItem.documentation_score,
                },
                {
                  label: 'Consistency',
                  curr: currentItem.consistency_score,
                  base: baselineItem.consistency_score,
                },
              ].map((metric) => (
                <div key={metric.label} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
                  <span className="text-xs text-slate-300 font-medium block">{metric.label}</span>
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-xs text-slate-400">
                      {metric.base ?? 'N/A'} → {metric.curr ?? 'N/A'}
                    </span>
                    {renderDelta(metric.curr, metric.base)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* DNA Comparison if both have DNA */}
          {currentItem.developer_dna && baselineItem.developer_dna ? (
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Developer DNA Dimension Progression
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                {['builder', 'experimenter', 'documenter', 'maintainer', 'open_source', 'specialist', 'explorer'].map((dim) => {
                  const currD = currentItem.developer_dna[dim];
                  const baseD = baselineItem.developer_dna[dim];
                  return (
                    <div key={dim} className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800 text-center space-y-1">
                      <span className="text-[10px] font-mono uppercase text-slate-400 block capitalize">
                        {dim.replace('_', ' ')}
                      </span>
                      <div className="text-xs font-mono text-slate-300">
                        {baseD ?? '-'} → {currD ?? '-'}
                      </div>
                      <div>{renderDelta(currD, baseD)}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-[11px] text-slate-500 italic">
              Developer DNA comparison not available for older snapshot format.
            </div>
          )}
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-slate-950/40 border border-slate-800/80 text-center space-y-2">
          <p className="text-xs text-slate-400">
            Compare requires at least 2 saved analyses. As you analyze more profiles or re-analyze this account later, progress deltas will appear here.
          </p>
        </div>
      )}

      {/* Analysis History List */}
      <div className="space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
          Saved History ({history.length} / 20)
        </span>

        {history.length === 0 ? (
          <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 text-xs text-slate-400 text-center">
            No previous analyses saved in this browser yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {history.map((item) => {
              const isSelected = baselineItem?.id === item.id;
              const isCurrent = currentItem?.id === item.id;
              return (
                <div
                  key={item.id}
                  className={`p-3 rounded-xl border transition-all text-left flex flex-col justify-between gap-2 ${
                    isCurrent
                      ? 'border-purple-500/50 bg-purple-950/20'
                      : isSelected
                      ? 'border-blue-500/50 bg-blue-950/20'
                      : 'border-slate-800/80 bg-slate-900/50 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-slate-200 truncate max-w-[120px]">
                      @{item.username}
                    </span>
                    <span className="font-mono font-bold text-purple-300">
                      {item.overall_score}/100
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>{item.dateLabel}</span>
                    <span className="capitalize font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-800">
                      {item.roast_level}
                    </span>
                  </div>

                  {!isCurrent && (
                    <button
                      type="button"
                      onClick={() => setSelectedBaselineId(item.id)}
                      className={`text-[10px] font-mono font-bold py-1 px-2 rounded text-center transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {isSelected ? 'Selected Baseline' : 'Compare Against'}
                    </button>
                  )}
                  {isCurrent && (
                    <span className="text-[10px] font-mono text-purple-400 text-center font-bold">
                      Active Analysis
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
