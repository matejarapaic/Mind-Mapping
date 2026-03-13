"use client";

import { memo, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { type NodeProps, useReactFlow, NodeResizer } from "@xyflow/react";
import type { StickyNoteFlowNode } from "@/lib/types";

const COLORS = [
  { bg: "#fef08a", label: "Yellow" },
  { bg: "#bbf7d0", label: "Green" },
  { bg: "#bfdbfe", label: "Blue" },
  { bg: "#fecaca", label: "Red" },
  { bg: "#e9d5ff", label: "Purple" },
];

const FONT_SIZES = [12, 14, 16, 18, 20, 24];

// ── Expanded modal ────────────────────────────────────────────────────────────
function ExpandedModal({
  text,
  color,
  fontSize,
  bold,
  onClose,
  onSave,
}: {
  text: string;
  color: string;
  fontSize: number;
  bold: boolean;
  onClose: () => void;
  onSave: (text: string) => void;
}) {
  const [draft, setDraft] = useState(text);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
    textareaRef.current?.setSelectionRange(draft.length, draft.length);
  }, []);

  const handleClose = () => {
    onSave(draft);
    onClose();
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [draft]);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={handleClose}
    >
      <div
        className="relative w-[600px] max-w-[90vw] rounded-2xl shadow-2xl flex flex-col"
        style={{ backgroundColor: color, maxHeight: "80vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between px-4 py-3 rounded-t-2xl"
          style={{ backgroundColor: color, filter: "brightness(0.88)" }}
        >
          <span className="text-slate-700 text-sm font-semibold">Note</span>
          <button
            onClick={handleClose}
            className="text-slate-600 hover:text-slate-900 text-lg leading-none transition-colors"
            title="Close (Esc)"
          >
            ✕
          </button>
        </div>

        <textarea
          ref={textareaRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type your note…"
          style={{
            fontSize,
            fontWeight: bold ? 700 : 400,
          }}
          className="flex-1 bg-transparent outline-none resize-none text-slate-800 px-5 py-4 placeholder-slate-500/60 leading-relaxed"
          // min-height set inline to keep it tall
        />

        <div
          className="flex items-center justify-between px-4 py-3 rounded-b-2xl text-xs text-slate-500"
          style={{ backgroundColor: color, filter: "brightness(0.93)" }}
        >
          <span>{draft.length} chars</span>
          <button
            onClick={handleClose}
            className="px-4 py-1.5 bg-slate-700/30 hover:bg-slate-700/50 text-slate-700 rounded-lg font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ── Node ──────────────────────────────────────────────────────────────────────
function StickyNoteNode({ id, data, selected }: NodeProps<StickyNoteFlowNode>) {
  const { updateNodeData, deleteElements, getNode } = useReactFlow();
  const [text, setText] = useState(data.text);
  const [expanded, setExpanded] = useState(false);

  const fontSize = data.fontSize ?? 14;
  const bold = data.bold ?? false;

  const persist = (patch: Partial<typeof data>) => {
    updateNodeData(id, { ...data, text, ...patch });
  };

  const handleBlur = () => persist({ text });

  const handleDelete = () => {
    const node = getNode(id);
    if (node) deleteElements({ nodes: [node] });
  };

  const handleSaveFromModal = (newText: string) => {
    setText(newText);
    persist({ text: newText });
  };

  const cycleFontSize = (dir: 1 | -1) => {
    const idx = FONT_SIZES.indexOf(fontSize);
    const next = FONT_SIZES[Math.max(0, Math.min(FONT_SIZES.length - 1, idx + dir))];
    persist({ fontSize: next });
  };

  const controlsVisible = selected ? "opacity-100" : "opacity-0 group-hover:opacity-100";

  return (
    <>
      {/* NodeResizer lets the user drag the note corners to resize */}
      <NodeResizer
        isVisible={selected}
        minWidth={160}
        minHeight={120}
        handleStyle={{ width: 10, height: 10, borderRadius: 3, background: "#6366f1", border: "2px solid white" }}
        lineStyle={{ borderColor: "#6366f1", borderWidth: 1.5 }}
      />

      <div
        style={{ backgroundColor: data.color, width: "100%", height: "100%" }}
        className="rounded-md shadow-xl flex flex-col relative group cursor-default overflow-hidden"
      >
        {/* Top bar */}
        <div
          style={{ backgroundColor: data.color, filter: "brightness(0.88)" }}
          className="flex items-center justify-between px-2 py-1 rounded-t-md shrink-0"
        >
          {/* Color swatches */}
          <div className={`flex gap-1 ${controlsVisible} transition-opacity`}>
            {COLORS.map((c) => (
              <button
                key={c.bg}
                title={c.label}
                onClick={() => persist({ color: c.bg })}
                style={{ backgroundColor: c.bg }}
                className={`w-3.5 h-3.5 rounded-full border ${
                  data.color === c.bg ? "border-slate-600 scale-125" : "border-white/60"
                } transition-transform`}
              />
            ))}
          </div>

          {/* Right controls */}
          <div className={`flex items-center gap-1.5 ${controlsVisible} transition-opacity`}>

            {/* Font size – / + */}
            <button
              onClick={() => cycleFontSize(-1)}
              disabled={fontSize <= FONT_SIZES[0]}
              className="text-slate-600 hover:text-slate-900 text-xs leading-none px-0.5 disabled:opacity-30 transition-colors nodrag"
              title="Decrease font size"
            >
              A−
            </button>
            <span className="text-slate-600 text-xs tabular-nums">{fontSize}px</span>
            <button
              onClick={() => cycleFontSize(1)}
              disabled={fontSize >= FONT_SIZES[FONT_SIZES.length - 1]}
              className="text-slate-600 hover:text-slate-900 text-xs leading-none px-0.5 disabled:opacity-30 transition-colors nodrag"
              title="Increase font size"
            >
              A+
            </button>

            <div className="w-px h-3 bg-slate-400/40" />

            {/* Bold toggle */}
            <button
              onClick={() => persist({ bold: !bold })}
              className={`text-xs leading-none font-bold px-1 py-0.5 rounded transition-colors nodrag ${
                bold
                  ? "bg-slate-600/40 text-slate-800"
                  : "text-slate-500 hover:text-slate-800"
              }`}
              title="Toggle bold"
            >
              B
            </button>

            <div className="w-px h-3 bg-slate-400/40" />

            {/* Expand */}
            <button
              onClick={() => setExpanded(true)}
              className="text-slate-600 hover:text-slate-900 text-xs leading-none transition-colors nodrag"
              title="Expand note"
            >
              ⤢
            </button>

            {/* Delete */}
            <button
              onClick={handleDelete}
              className="text-slate-600 hover:text-red-600 text-xs leading-none font-bold transition-colors nodrag"
              title="Delete note"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Textarea */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleBlur}
          placeholder="Type your note…"
          style={{ fontSize, fontWeight: bold ? 700 : 400 }}
          className="flex-1 bg-transparent outline-none resize-none text-slate-800 px-3 py-2 placeholder-slate-500/60 leading-relaxed nodrag w-full"
        />

        {/* Folded corner */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: 16,
            height: 16,
            background: `linear-gradient(225deg, rgba(0,0,0,0.15) 50%, transparent 50%)`,
            borderRadius: "0 0 4px 0",
          }}
        />
      </div>

      {expanded && (
        <ExpandedModal
          text={text}
          color={data.color}
          fontSize={fontSize}
          bold={bold}
          onClose={() => setExpanded(false)}
          onSave={handleSaveFromModal}
        />
      )}
    </>
  );
}

export default memo(StickyNoteNode);
