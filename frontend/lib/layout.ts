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
 * Appends new child nodes to an existing graph, positioned relative to the parent.
 */
export function appendChildNodes(
  existingNodes: FlowNode[],
  existingEdges: FlowEdge[],
  parentId: string,
  newLabels: string[],
): { nodes: FlowNode[]; edges: FlowEdge[] } {
  const maxId = Math.max(0, ...existingNodes.map((n) => parseInt(n.id) || 0));
  const parentNode = existingNodes.find((n) => n.id === parentId);
  const baseX = (parentNode?.position.x ?? 0) + 240;
  const baseY = parentNode?.position.y ?? 0;
  const spacing = 70;
  const offset = ((newLabels.length - 1) / 2) * spacing;

  const newNodes: FlowNode[] = newLabels.map((label, i) => ({
    id: String(maxId + i + 1),
    type: "mindMapNode" as const,
    position: { x: baseX, y: baseY + i * spacing - offset },
    data: { label, nodeType: "sub" as const },
  }));

  const newEdges: FlowEdge[] = newNodes.map((n) => ({
    id: `e-${parentId}-${n.id}`,
    source: parentId,
    target: n.id,
    type: "smoothstep",
  }));

  return {
    nodes: [...existingNodes, ...newNodes],
    edges: [...existingEdges, ...newEdges],
  };
}
