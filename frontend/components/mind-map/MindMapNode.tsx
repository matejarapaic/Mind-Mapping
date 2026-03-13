"use client";

import { memo, useRef, useState } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { FlowNode } from "@/lib/types";
import { useNodeActions } from "./NodeActionsContext";

const styleMap = {
  central: "bg-indigo-600 text-white font-bold text-base px-5 py-3 shadow-lg shadow-indigo-900/50",
  branch: "bg-slate-700 text-white font-semibold text-sm px-4 py-2 border border-slate-600",
  sub: "bg-slate-800 text-slate-200 text-xs px-3 py-2 border border-slate-700",
};

function MindMapNode({ id, data, selected }: NodeProps<FlowNode>) {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label);
  const [isHovered, setIsHovered] = useState(false);
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { onAddChild, onAiExpand, onAiExplain, expandingNodeId, explainingNodeId } = useNodeActions();

  const handleMouseEnter = () => {
    if (hideTimeout.current) clearTimeout(hideTimeout.current);
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    hideTimeout.current = setTimeout(() => setIsHovered(false), 200);
  };
  const isExpanding = expandingNodeId === id;
  const isExplaining = explainingNodeId === id;

  const ring = selected ? "ring-2 ring-indigo-400" : "";
  const base = "rounded-xl cursor-pointer transition-all min-w-[80px] max-w-[160px] text-center";

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Handle type="target" position={Position.Left} className="!bg-slate-500 !border-slate-400" />

      <div
        className={`${base} ${styleMap[data.nodeType]} ${ring} ${isExpanding || isExplaining ? "opacity-60 animate-pulse" : ""}`}
        onDoubleClick={() => setIsEditing(true)}
      >
        {isEditing ? (
          <input
            autoFocus
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onBlur={() => {
              data.label = label;
              setIsEditing(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === "Escape") {
                data.label = label;
                setIsEditing(false);
              }
            }}
            className="bg-transparent outline-none text-center w-full"
          />
        ) : (
          <span>{isExpanding ? "✦ thinking…" : isExplaining ? "✦ reading…" : label}</span>
        )}
      </div>

      {/* Hover action buttons */}
      {isHovered && !isEditing && !isExpanding && !isExplaining && (
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-1 z-50 pointer-events-auto">
          <button
            onClick={(e) => { e.stopPropagation(); onAddChild(id); }}
            className="px-2 py-0.5 bg-slate-700 hover:bg-slate-600 text-white text-xs rounded border border-slate-500 whitespace-nowrap transition-colors"
            title="Add a child node"
          >
            + Add
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onAiExpand(id, label); }}
            className="px-2 py-0.5 bg-indigo-700 hover:bg-indigo-600 text-white text-xs rounded border border-indigo-500 whitespace-nowrap transition-colors"
            title="AI: add child ideas"
          >
            ✦ Expand
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onAiExplain(id, label); }}
            className="px-2 py-0.5 bg-violet-700 hover:bg-violet-600 text-white text-xs rounded border border-violet-500 whitespace-nowrap transition-colors"
            title="AI: explain this concept"
          >
            ✦ Explain
          </button>
        </div>
      )}

      <Handle type="source" position={Position.Right} className="!bg-slate-500 !border-slate-400" />
    </div>
  );
}

export default memo(MindMapNode);
