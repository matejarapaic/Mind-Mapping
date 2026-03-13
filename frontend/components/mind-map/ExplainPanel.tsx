"use client";

interface ExplainPanelProps {
  nodeLabel: string;
  explanation: string | null;
  isLoading: boolean;
  onClose: () => void;
}

export default function ExplainPanel({
  nodeLabel,
  explanation,
  isLoading,
  onClose,
}: ExplainPanelProps) {
  return (
    <div className="absolute top-4 right-4 z-50 w-72 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl shadow-black/50 flex flex-col overflow-hidden animate-in slide-in-from-right-4 duration-200">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 px-4 pt-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-indigo-400 text-sm">✦</span>
          <span className="text-white/90 text-sm font-medium truncate">{nodeLabel}</span>
        </div>
        <button
          onClick={onClose}
          className="text-white/30 hover:text-white/70 transition-colors text-base leading-none shrink-0 mt-0.5"
          title="Close"
        >
          ✕
        </button>
      </div>

      {/* Body */}
      <div className="px-4 py-4 min-h-[80px]">
        {isLoading ? (
          <div className="flex items-center gap-2 text-indigo-400 text-sm">
            <span className="animate-spin inline-block">⟳</span>
            <span>Explaining…</span>
          </div>
        ) : explanation ? (
          <p className="text-white/70 text-sm leading-relaxed">{explanation}</p>
        ) : null}
      </div>

      {/* Footer label */}
      <div className="px-4 pb-3">
        <span className="text-[11px] text-white/20">AI explanation · Claude</span>
      </div>
    </div>
  );
}
