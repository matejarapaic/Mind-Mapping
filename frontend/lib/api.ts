import type {
  AiExpandResponse,
  AiExplainResponse,
  AiGenerateResponse,
  FileAttachment,
  GraphData,
  MindMap,
  MindMapListItem,
} from "./types";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";

async function request<T>(
  path: string,
  options: RequestInit & { token?: string } = {}
): Promise<T> {
  const { token, ...rest } = options;
  const res = await fetch(`${BACKEND_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...rest.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail ?? "Request failed");
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// Mind map CRUD
export const api = {
  mindmaps: {
    list: (token: string) =>
      request<MindMapListItem[]>("/api/mindmaps/", { token }),

    get: (id: string, token: string) =>
      request<MindMap>(`/api/mindmaps/${id}`, { token }),

    create: (title: string, token: string) =>
      request<MindMap>("/api/mindmaps/", {
        method: "POST",
        body: JSON.stringify({ title }),
        token,
      }),

    update: (
      id: string,
      patch: { title?: string; graph_data?: GraphData },
      token: string
    ) =>
      request<{ id: string; title: string }>(`/api/mindmaps/${id}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
        token,
      }),

    delete: (id: string, token: string) =>
      request<void>(`/api/mindmaps/${id}`, { method: "DELETE", token }),
  },

  ai: {
    generate: (topic: string, token: string, attachment?: FileAttachment) =>
      request<AiGenerateResponse>("/api/ai/generate", {
        method: "POST",
        body: JSON.stringify({
          topic,
          ...(attachment
            ? { file_content: attachment.base64, file_type: attachment.mediaType }
            : {}),
        }),
        token,
      }),

    expand: (nodeLabel: string, context: string, token: string) =>
      request<AiExpandResponse>("/api/ai/expand", {
        method: "POST",
        body: JSON.stringify({ node_label: nodeLabel, context }),
        token,
      }),

    explain: (nodeLabel: string, context: string, token: string) =>
      request<AiExplainResponse>("/api/ai/explain", {
        method: "POST",
        body: JSON.stringify({ node_label: nodeLabel, context }),
        token,
      }),
  },
};
