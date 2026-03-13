"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import type { FileAttachment } from "@/lib/types";

interface MindMapToolbarProps {
  title: string;
  isGenerating: boolean;
  onTitleChange: (title: string) => void;
  onGenerate: (topic: string, attachment?: FileAttachment) => void;
  onSave: () => void;
  isSaving: boolean;
  onAddStickyNote: () => void;
  onAddImage: (src: string, filename: string) => void;
}

export default function MindMapToolbar({
  title,
  isGenerating,
  onTitleChange,
  onGenerate,
  onSave,
  isSaving,
  onAddStickyNote,
  onAddImage,
}: MindMapToolbarProps) {
  const [topic, setTopic] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);
  const [attachment, setAttachment] = useState<FileAttachment | null>(null);

  // Hidden file inputs
  const chatAttachRef = useRef<HTMLInputElement>(null);
  const boardImageRef = useRef<HTMLInputElement>(null);

  // ── Chat file attachment ────────────────────────────────────────────────
  const handleChatAttachSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      // readAsDataURL gives "data:<mediaType>;base64,<data>" — strip the prefix
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(",")[1];
      setAttachment({ name: file.name, base64, mediaType: file.type || "text/plain" });
    };
    reader.readAsDataURL(file);
    // reset so the same file can be reattached
    e.target.value = "";
  };

  const removeAttachment = () => setAttachment(null);

  // ── Generate ────────────────────────────────────────────────────────────
  const handleGenerate = () => {
    if (!topic.trim() || isGenerating) return;
    onGenerate(topic.trim(), attachment ?? undefined);
    setTopic("");
    setAttachment(null);
  };

  // ── Board image upload ──────────────────────────────────────────────────
  const handleBoardImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      onAddImage(reader.result as string, file.name);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div className="flex flex-col bg-slate-900 border-b border-slate-700">
      {/* Main toolbar row */}
      <div className="flex items-center gap-3 p-3">
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

        {/* Hidden file input for chat attachment */}
        <input
          ref={chatAttachRef}
          type="file"
          accept="image/*,text/plain,text/markdown,text/csv,application/json,.md,.csv"
          className="hidden"
          onChange={handleChatAttachSelect}
        />

        {/* Paperclip button */}
        <button
          onClick={() => chatAttachRef.current?.click()}
          title="Attach a file or image to guide AI generation"
          className={`px-2.5 py-1.5 rounded-lg text-sm transition-colors shrink-0 flex items-center gap-1.5 ${
            attachment
              ? "bg-indigo-600/30 border border-indigo-500/50 text-indigo-300"
              : "bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-400 hover:text-slate-200"
          }`}
        >
          📎
        </button>

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
          className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 shrink-0"
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

        <div className="w-px h-5 bg-slate-700" />

        {/* Hidden file input for board image */}
        <input
          ref={boardImageRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleBoardImageSelect}
        />

        {/* Board image button */}
        <button
          onClick={() => boardImageRef.current?.click()}
          title="Upload an image onto the canvas"
          className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 text-sm rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
        >
          🖼 Image
        </button>

        {/* Sticky note button */}
        <button
          onClick={onAddStickyNote}
          title="Add a sticky note"
          className="px-3 py-1.5 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 text-yellow-300 text-sm rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
        >
          📝 Note
        </button>

        <div className="flex items-center gap-1.5 shrink-0">
          {isSaving && (
            <span className="text-xs text-slate-500 animate-pulse">Auto-saving…</span>
          )}
          <button
            onClick={onSave}
            disabled={isSaving}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-white text-sm rounded-lg transition-colors"
          >
            Save
          </button>
        </div>
      </div>

      {/* Attachment chip — shown below the toolbar row when a file is attached */}
      {attachment && (
        <div className="flex items-center gap-2 px-3 pb-2">
          <span className="text-xs text-slate-400">Attached for AI:</span>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-indigo-600/20 border border-indigo-500/30 rounded-full text-xs text-indigo-300">
            {attachment.mediaType.startsWith("image/") ? "🖼" : "📄"}
            {attachment.name.length > 30
              ? attachment.name.slice(0, 28) + "…"
              : attachment.name}
            <button
              onClick={removeAttachment}
              className="ml-0.5 hover:text-white transition-colors"
              title="Remove attachment"
            >
              ✕
            </button>
          </span>
          <span className="text-xs text-slate-500">
            {attachment.mediaType.startsWith("image/")
              ? "Claude will use this image as visual context"
              : "Claude will read this file as context"}
          </span>
        </div>
      )}
    </div>
  );
}
