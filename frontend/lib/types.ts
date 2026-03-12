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
}

// React Flow node / edge types
export type FlowNodeData = {
  label: string;
  nodeType: "central" | "branch" | "sub";
};

export type FlowNode = Node<FlowNodeData, "mindMapNode">;
export type FlowEdge = Edge;
