"use client";

import { useReactFlow } from "@xyflow/react";
import { useState } from "react";

export interface ImageNodeData {
  src: string;       // base64 data URL
  filename: string;
}

export default function ImageNode({
  id,
  data,
}: {
  id: string;
  data: ImageNodeData;
}) {
  const { deleteElements } = useReactFlow();
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative rounded-xl overflow-hidden border-2 border-slate-600 bg-slate-800 shadow-xl cursor-grab active:cursor-grabbing"
      style={{ width: 280 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Delete button */}
      {hovered && (
        <button
          onClick={() => deleteElements({ nodes: [{ id }] })}
          className="absolute top-1.5 right-1.5 z-10 w-6 h-6 bg-red-600 hover:bg-red-500 rounded-full text-white text-xs flex items-center justify-center shadow-md transition-colors"
          title="Delete image"
        >
          ✕
        </button>
      )}

      {/* Image */}
      <img
        src={data.src}
        alt={data.filename}
        className="w-full h-auto object-contain select-none"
        draggable={false}
      />

      {/* Filename label */}
      <div className="px-2 py-1 text-xs text-slate-400 truncate bg-slate-900/80 border-t border-slate-700">
        🖼 {data.filename}
      </div>
    </div>
  );
}
