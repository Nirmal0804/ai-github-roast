import { useState, useEffect } from 'react';
import { getAnalysisHistory, clearAnalysisHistory } from '../utils/historyStorage.js';

export default function HistoricalComparison({ currentSnapshot }) {
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

  const currentItem = currentSnapshot || history[0];
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
      return <span className="text-[#C4B5D4]/60 text-xs">N/A</span>;
    }
    const delta = currentVal - baselineVal;
    if (delta > 0) {
      return (
        <span className="font-mono font-bold text-[#A855F7] inline-flex items-center gap-0.5 text-xs">
          +{delta}
        </span>
      );
    }
    if (delta < 0) {
      return (
        <span className="font-mono font-bold text-[#C4B5D4] inline-flex items-center gap-0.5 text-xs">
          {delta}
        </span>
      );
    }
    return <span className="font-mono text-[#C4B5D4]/80 text-xs">0</span>;
  };

  return (
    <div className="space-y-6 pt-4 border-t border-[rgba(168,85,247,0.18)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">📈</span>
            <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
              Compare Your Progress
            </h3>
          </div>
          <p className="text-xs text-[#C4B5D4] font-mono mt-0.5">
            Local historical analysis &amp; trajectory tracking (stored locally in browser)
          </p>
        </div>

        {history.length > 0 && (
          <div className="flex items-center gap-2">
            {!showClearConfirm ? (
              <button
                type="button"
                onClick={() => setShowClearConfirm(true)}
                className="text-xs text-[#C4B5D4] hover:text-white transition-colors px-3 py-1.5 rounded-lg bg-[rgba(63,13,99,0.30)] border border-[rgba(168,85,247,0.20)] hover:border-[rgba(168,85,247,0.40)] cursor-pointer"
              >
                Clear History
              </button>
            ) : (
              <div className="flex items-center gap-2 p-1 rounded-lg bg-[rgba(63,13,99,0.50)] border border-[rgba(168,85,247,0.35)]">
                <span className="text-[11px] text-[#C4B5D4] font-medium px-2">Confirm clear?</span>
                <button
                  type="button"
                  onClick={handleClearHistory}
                  className="px-2.5 py-0.5 text-[11px] font-bold rounded-md bg-[#A855F7] text-white hover:bg-purple-600 cursor-pointer shadow-sm"
                >
                  Yes, Clear
                </button>
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(false)}
                  className="px-2 py-0.5 text-[11px] rounded text-[#C4B5D4] hover:text-white cursor-pointer"
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
        <div className="p-6 sm:p-7 rounded-3xl glass-panel space-y-6">
          {/* Top Comparison Header Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Baseline Card */}
            <div className="p-4 sm:p-5 rounded-2xl glass-panel-subtle space-y-2">
              <div className="flex items-center justify-between text-xs text-[#C4B5D4]">
                <span className="font-mono uppercase font-bold text-[#C4B5D4]">Baseline Analysis</span>
                <span className="text-[11px]">{baselineItem.dateLabel}</span>
              </div>
              <div className="flex items-baseline justify-between">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black font-mono text-white">
                    {baselineItem.overall_score}
                  </span>
                  <span className="text-xs text-[#C4B5D4]/70 font-bold">/100</span>
                </div>
                <span className="text-xs font-mono font-bold text-[#A855F7] capitalize">
                  {baselineItem.roast_level}
                </span>
              </div>
              <div className="text-[11px] text-[#C4B5D4] font-mono">
                @{baselineItem.username} &bull; {baselineItem.league || 'Builder'}
              </div>
            </div>

            {/* Current / Target Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[rgba(63,13,99,0.45)] to-[rgba(109,40,168,0.30)] border border-[rgba(168,85,247,0.35)] shadow-[0_0_20px_rgba(109,40,168,0.20)] space-y-2">
              <div className="flex items-center justify-between text-xs text-[#A855F7]">
                <span className="font-mono uppercase font-bold text-[#A855F7]">Current Analysis</span>
                <span className="text-[11px] text-[#C4B5D4]">{currentItem.dateLabel}</span>
              </div>
              <div className="flex items-baseline justify-between">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black font-mono text-white">
                    {currentItem.overall_score}
                  </span>
                  <span className="text-xs text-[#C4B5D4] font-bold">/100</span>
                  <span className="ml-1 text-sm font-bold">
                    {renderDelta(currentItem.overall_score, baselineItem.overall_score)}
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-pink-300 capitalize">
                  {currentItem.roast_level}
                </span>
              </div>
              <div className="text-[11px] text-[#C4B5D4] font-mono">
                @{currentItem.username} &bull; {currentItem.league || 'Builder'}
              </div>
            </div>
          </div>

          {/* Metric Comparison Table */}
          <div className="space-y-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C4B5D4] block">
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
                <div key={metric.label} className="p-3.5 rounded-xl glass-panel-subtle space-y-1">
                  <span className="text-xs text-white font-medium block">{metric.label}</span>
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-xs text-[#C4B5D4]">
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
            <div className="space-y-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#C4B5D4] block">
                Developer DNA Progression
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                {['builder', 'experimenter', 'documenter', 'maintainer', 'open_source', 'specialist', 'explorer'].map((dim) => {
                  const currD = currentItem.developer_dna[dim];
                  const baseD = baselineItem.developer_dna[dim];
                  return (
                    <div key={dim} className="p-2.5 rounded-xl glass-panel-subtle text-center space-y-1">
                      <span className="text-[10px] font-mono uppercase text-[#C4B5D4] block capitalize">
                        {dim.replace('_', ' ')}
                      </span>
                      <div className="text-xs font-mono text-white">
                        {baseD ?? '-'} → {currD ?? '-'}
                      </div>
                      <div>{renderDelta(currD, baseD)}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-[11px] text-[#C4B5D4]/70 italic">
              Developer DNA comparison not available for older snapshot format.
            </div>
          )}
        </div>
      ) : (
        <div className="p-6 rounded-2xl glass-panel-subtle text-center space-y-2">
          <p className="text-xs text-[#C4B5D4]">
            Compare requires at least 2 saved analyses. As you analyze more profiles or re-analyze this account later, progress deltas will appear here.
          </p>
        </div>
      )}

      {/* Analysis History List */}
      <div className="space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-[#C4B5D4] block">
          Saved History ({history.length} / 20)
        </span>

        {history.length === 0 ? (
          <div className="p-4 rounded-xl glass-panel-subtle text-xs text-[#C4B5D4] text-center">
            No previous analyses saved in this browser yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {history.map((item) => {
              const isSelected = baselineItem?.id === item.id;
              const isCurrent = currentItem?.id === item.id;
              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-xl transition-all duration-200 text-left flex flex-col justify-between gap-2.5 ${
                    isCurrent
                      ? 'bg-[rgba(63,13,99,0.45)] border-2 border-[#A855F7] shadow-[0_0_15px_rgba(168,85,247,0.25)]'
                      : isSelected
                      ? 'bg-[rgba(109,40,168,0.35)] border-2 border-[#A855F7]/70'
                      : 'glass-panel-subtle hover:border-[rgba(168,85,247,0.35)]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-white truncate max-w-[130px]">
                      @{item.username}
                    </span>
                    <span className="font-mono font-black text-[#A855F7]">
                      {item.overall_score}/100
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#C4B5D4]">
                    <span>{item.dateLabel}</span>
                    <span className="capitalize font-mono text-[10px] px-2 py-0.5 rounded-md bg-[rgba(63,13,99,0.50)] border border-[rgba(168,85,247,0.20)] text-white">
                      {item.roast_level}
                    </span>
                  </div>

                  {!isCurrent && (
                    <button
                      type="button"
                      onClick={() => setSelectedBaselineId(item.id)}
                      className={`text-[10px] font-mono font-bold py-1.5 px-2 rounded-lg text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#A855F7] text-white shadow-sm'
                          : 'bg-[rgba(63,13,99,0.40)] text-[#C4B5D4] hover:text-white hover:bg-[rgba(109,40,168,0.40)]'
                      }`}
                    >
                      {isSelected ? 'Selected Baseline' : 'Compare Against'}
                    </button>
                  )}
                  {isCurrent && (
                    <span className="text-[10px] font-mono text-[#A855F7] text-center font-bold">
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
