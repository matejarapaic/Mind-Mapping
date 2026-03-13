import type { Node, Edge } from "@xyflow/react";

// Raw node from the AI response
export interface AiNode {
  id: string;
  label: string;
  parent?: string;
}

// AI generation response from the backend
export interface AiGenerateResponse {
  title: string;
  nodes: AiNode[];
}

// AI expand response from the backend
export interface AiExpandNode {
  label: string;
}

export interface AiExpandResponse {
  nodes: AiExpandNode[];
}

// AI explain response from the backend
export interface AiExplainResponse {
  explanation: string;
}

// Saved mind map (full record from DB)
export interface MindMap {
  id: string;
  title: string;
  graph_data: GraphData;
  created_at: string;
  updated_at: string;
}

// Lightweight list item (no graph_data)
export interface MindMapListItem {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

// The data stored in Postgres graph_data column
export interface GraphData {
  nodes: FlowNode[];
  edges: FlowEdge[];
  viewport?: { x: number; y: number; zoom: number };
}

// React Flow node / edge types
export type FlowNodeData = {
  label: string;
  nodeType: "central" | "branch" | "sub";
};

export type FlowNode = Node<FlowNodeData, "mindMapNode">;
export type FlowEdge = Edge;

// Sticky note node
export type StickyNoteData = {
  text: string;
  color: string;
  fontSize?: number;   // 12–24, default 14
  bold?: boolean;
  width?: number;      // px, default 208 (w-52)
  height?: number;     // px, default 144 (min-h-36)
};

export type StickyNoteFlowNode = Node<StickyNoteData, "stickyNote">;

// Image node (freeform on canvas)
export type ImageNodeData = {
  src: string;       // base64 data URL
  filename: string;
};

export type ImageFlowNode = Node<ImageNodeData, "imageNode">;

// File attachment for AI generation
export interface FileAttachment {
  name: string;
  base64: string;    // base64-encoded content (image or text)
  mediaType: string; // e.g. "image/png", "text/plain"
}
