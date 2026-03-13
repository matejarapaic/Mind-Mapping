"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { api } from "@/lib/api";
import type { MindMapListItem } from "@/lib/types";

interface DashboardShellProps {
  maps: MindMapListItem[];
  token: string;
  userName: string;
  greeting: string;
}

const SUGGESTIONS = [
  "Marketing Strategy",
  "Product Roadmap",
  "Business Model Canvas",
  "Learning Goals",
];

export default function DashboardShell({
  maps,
  token,
  userName,
  greeting,
}: DashboardShellProps) {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleCreate = async (topicValue: string) => {
    const t = topicValue.trim();
    if (!t || loading) return;
    setLoading(true);
    try {
      const map = await api.mindmaps.create("Untitled Mind Map", token);
      router.push(`/map/${map.id}?topic=${encodeURIComponent(t)}`);
    } catch (err) {
      console.error(err);
      alert("Failed to create mind map.");
      setLoading(false);
    }
  };

  const handleNewBlank = async () => {
    setLoading(true);
    try {
      const map = await api.mindmaps.create("Untitled Mind Map", token);
      router.push(`/map/${map.id}`);
    } catch (err) {
      console.error(err);
      alert("Failed to create mind map.");
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#0f0f0f] text-white overflow-hidden">
      {/* ── Sidebar ── */}
      <aside
        className={`flex flex-col shrink-0 w-64 bg-[#171717] border-r border-white/5 transition-all duration-200 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-64 absolute"
        }`}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white/80">Mind Maps</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-white/30 hover:text-white/70 transition-colors text-xl leading-none"
            title="Collapse sidebar"
          >
            ‹
          </button>
        </div>

        {/* New map button */}
        <div className="px-3 pt-3 pb-1">
          <button
            onClick={handleNewBlank}
            disabled={loading}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-sm text-white/60 hover:text-white/90 transition-colors disabled:opacity-50"
          >
            <span className="text-base leading-none font-light">+</span>
            New blank map
          </button>
        </div>

        {/* Maps list */}
        <div className="px-2 py-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-white/25 px-2 py-1">
            Recent
          </p>
        </div>
        <nav className="flex-1 overflow-y-auto px-2 space-y-0.5 pb-4">
          {maps.length === 0 ? (
            <p className="text-xs text-white/25 px-3 py-4 text-center">
              No maps yet — create one above
            </p>
          ) : (
            maps.map((map) => (
              <Link
                key={map.id}
                href={`/map/${map.id}`}
                className="flex flex-col px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors group"
              >
                <span className="text-sm text-white/70 group-hover:text-white truncate">
                  {map.title}
                </span>
                <span className="text-[11px] text-white/25 mt-0.5">
                  {new Date(map.updated_at).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </Link>
            ))
          )}
        </nav>

        {/* User footer */}
        <div className="px-4 py-4 border-t border-white/5 flex items-center gap-3">
          <UserButton />
          <span className="text-xs text-white/40 truncate">{userName}</span>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 relative overflow-y-auto">
        {/* Expand sidebar button (when collapsed) */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="absolute top-5 left-5 text-white/30 hover:text-white/70 transition-colors text-xl leading-none px-1"
            title="Open sidebar"
          >
            ›
          </button>
        )}

        <div className="w-full max-w-2xl flex flex-col items-center text-center">
          {/* Greeting */}
          <h1 className="text-4xl font-light text-white/90 mb-10 tracking-tight">
            {greeting}
            {userName && (
              <span className="text-white">, {userName}</span>
            )}
          </h1>

          {/* Input box */}
          <div className="w-full bg-[#1e1e1e] rounded-2xl border border-white/10 focus-within:border-white/25 transition-colors p-4">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate(topic)}
              placeholder="What topic do you want to map today?"
              disabled={loading}
              className="w-full bg-transparent text-white placeholder-white/20 outline-none text-base leading-relaxed"
              autoFocus
            />
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-white/20">
                Press Enter or click Generate
              </span>
              <button
                onClick={() => handleCreate(topic)}
                disabled={!topic.trim() || loading}
                className="flex items-center gap-2 bg-white text-black disabled:bg-white/10 disabled:text-white/20 rounded-xl px-4 py-1.5 text-sm font-medium transition-all hover:bg-white/90"
              >
                {loading ? (
                  <span className="animate-spin inline-block">⟳</span>
                ) : (
                  <>✦ Generate</>
                )}
              </button>
            </div>
          </div>

          {/* Suggestion chips */}
          <div className="flex flex-wrap gap-2 mt-5 justify-center">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => handleCreate(s)}
                disabled={loading}
                className="px-4 py-2 bg-[#1a1a1a] hover:bg-[#252525] border border-white/8 hover:border-white/20 rounded-full text-sm text-white/50 hover:text-white/90 transition-all"
              >
                {s}
              </button>
            ))}
          </div>

          {/* How it works */}
          <div className="mt-16 w-full text-left">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/20 mb-4 text-center">
              How it works
            </p>
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  step: "1",
                  icon: "✦",
                  title: "Type a topic",
                  desc: "Enter any concept, strategy, or idea you want to explore.",
                },
                {
                  step: "2",
                  icon: "⟳",
                  title: "AI builds your map",
                  desc: "Claude AI generates a structured visual map with branches and sub-topics.",
                },
                {
                  step: "3",
                  icon: "⊕",
                  title: "Expand & explore",
                  desc: "Click any node to add ideas manually or let AI go deeper.",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-4"
                >
                  <div className="text-indigo-400 text-xl mb-2">{item.icon}</div>
                  <p className="text-sm font-medium text-white/80 mb-1">{item.title}</p>
                  <p className="text-xs text-white/35 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
