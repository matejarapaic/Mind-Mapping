"use client";

import { useState } from "react";
import Link from "next/link";

interface MindMapToolbarProps {
  title: string;
  isGenerating: boolean;
  onTitleChange: (title: string) => void;
  onGenerate: (topic: string) => void;
  onSave: () => void;
  isSaving: boolean;
}

export default function MindMapToolbar({
  title,
  isGenerating,
  onTitleChange,
  onGenerate,
  onSave,
  isSaving,
}: MindMapToolbarProps) {
  const [topic, setTopic] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);

  const handleGenerate = () => {
    if (!topic.trim() || isGenerating) return;
    onGenerate(topic.trim());
    setTopic("");
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-slate-900 border-b border-slate-700">
      {/* Back to Dashboard */}
      <Link
        href="/dashboard"
        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-sm rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
      >
        ← Dashboard
      </Link>

      <div className="w-px h-5 bg-slate-700" />

      {/* Title */}
      {editingTitle ? (
        <input
          autoFocus
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          onBlur={() => setEditingTitle(false)}
          onKeyDown={(e) => e.key === "Enter" && setEditingTitle(false)}
          className="bg-slate-800 text-white border border-slate-600 rounded px-2 py-1 text-sm w-40 outline-none"
        />
      ) : (
        <span
          className="text-slate-300 text-sm font-medium cursor-pointer hover:text-white truncate max-w-[160px]"
          onDoubleClick={() => setEditingTitle(true)}
          title="Double-click to rename"
        >
          {title}
        </span>
      )}

      <div className="w-px h-5 bg-slate-700" />

      {/* AI generate input */}
      <input
        type="text"
        placeholder="Enter a topic to generate…"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
        className="flex-1 bg-slate-800 text-white placeholder-slate-500 border border-slate-600 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-indigo-500 transition-colors"
      />

      <button
        onClick={handleGenerate}
        disabled={!topic.trim() || isGenerating}
        className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
      >
        {isGenerating ? (
          <>
            <span className="animate-spin">⟳</span>
            Generating…
          </>
        ) : (
          "✦ Generate"
        )}
      </button>

      <button
        onClick={onSave}
        disabled={isSaving}
        className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white text-sm rounded-lg transition-colors"
      >
        {isSaving ? "Saving…" : "Save"}
      </button>
    </div>
  );
}
