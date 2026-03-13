import dagre from "@dagrejs/dagre";
import type { AiNode, FlowEdge, FlowNode } from "./types";

const NODE_WIDTH = 160;
const NODE_HEIGHT = 48;

/**
 * Converts the AI-returned flat node list (with parent references)
 * into positioned React Flow nodes + edges using a Dagre tree layout.
 */
export function buildGraphFromAi(aiNodes: AiNode[]): {
  nodes: FlowNode[];
  edges: FlowEdge[];
} {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: "LR", ranksep: 80, nodesep: 40 });
  g.setDefaultEdgeLabel(() => ({}));

  // Add nodes
  for (const node of aiNodes) {
    g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  }

  // Add edges (parent → child)
  for (const node of aiNodes) {
    if (node.parent !== undefined) {
      g.setEdge(node.parent, node.id);
    }
  }

  dagre.layout(g);

  const centralId = aiNodes.find((n) => !n.parent)?.id ?? "0";

  const flowNodes: FlowNode[] = aiNodes.map((node) => {
    const pos = g.node(node.id);
    const nodeType =
      node.id === centralId
        ? "central"
        : node.parent === centralId
        ? "branch"
        : "sub";

    return {
      id: node.id,
      type: "mindMapNode",
      position: { x: pos.x - NODE_WIDTH / 2, y: pos.y - NODE_HEIGHT / 2 },
      data: { label: node.label, nodeType },
    };
  });

  const flowEdges: FlowEdge[] = aiNodes
    .filter((n) => n.parent !== undefined)
    .map((node) => ({
      id: `e-${node.parent}-${node.id}`,
      source: node.parent!,
      target: node.id,
      type: "smoothstep",
    }));

  return { nodes: flowNodes, edges: flowEdges };
}

/**
 * Appends new child nodes to an existing graph, then re-runs the full
 * Dagre layout so nothing overlaps regardless of how many expansions happen.
 *
 * NOTE: only mindMapNode nodes are passed to dagre; freeform nodes
 * (stickyNote, imageNode) are filtered out here and should be merged
 * back in by the caller.
 */
export function appendChildNodes(
  existingNodes: FlowNode[],
  existingEdges: FlowEdge[],
  parentId: string,
  newLabels: string[],
): { nodes: FlowNode[]; edges: FlowEdge[] } {
  // Only operate on mind-map nodes (numeric IDs)
  const mindMapOnly = existingNodes.filter((n) => n.type === "mindMapNode");
  const maxId = Math.max(0, ...mindMapOnly.map((n) => parseInt(n.id) || 0));

  const newNodes: FlowNode[] = newLabels.map((label, i) => ({
    id: String(maxId + i + 1),
    type: "mindMapNode" as const,
    position: { x: 0, y: 0 }, // positions set by dagre below
    data: { label, nodeType: "sub" as const },
  }));

  const newEdges: FlowEdge[] = newNodes.map((n) => ({
    id: `e-${parentId}-${n.id}`,
    source: parentId,
    target: n.id,
    type: "smoothstep",
  }));

  const allNodes = [...mindMapOnly, ...newNodes];
  const allEdges = [...existingEdges, ...newEdges];

  // Re-run full Dagre layout so every node is properly spaced
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: "LR", ranksep: 80, nodesep: 40 });
  g.setDefaultEdgeLabel(() => ({}));

  for (const node of allNodes) {
    g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  }
  for (const edge of allEdges) {
    g.setEdge(edge.source, edge.target);
  }

  dagre.layout(g);

  const repositioned = allNodes.map((node) => {
    const pos = g.node(node.id);
    if (!pos) return node;
    return {
      ...node,
      position: { x: pos.x - NODE_WIDTH / 2, y: pos.y - NODE_HEIGHT / 2 },
    };
  });

  return { nodes: repositioned, edges: allEdges };
}
