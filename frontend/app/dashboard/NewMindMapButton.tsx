"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";

export default function NewMindMapButton({
  token,
  label = "+ New Map",
}: {
  token: string;
  label?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
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
    <button
      onClick={handleCreate}
      disabled={loading}
      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
    >
      {loading ? "Creating…" : label}
    </button>
  );
}
