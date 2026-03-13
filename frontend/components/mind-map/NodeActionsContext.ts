import { createContext, useContext } from "react";

export interface NodeActionsContextValue {
  onAddChild: (nodeId: string) => void;
  onAiExpand: (nodeId: string, label: string) => void;
  onAiExplain: (nodeId: string, label: string) => void;
  expandingNodeId: string | null;
  explainingNodeId: string | null;
}

export const NodeActionsContext = createContext<NodeActionsContextValue | null>(null);

export function useNodeActions(): NodeActionsContextValue {
  const ctx = useContext(NodeActionsContext);
  if (!ctx) throw new Error("useNodeActions must be used within NodeActionsContext.Provider");
  return ctx;
}
