import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import MindMapCanvas from "@/components/mind-map/MindMapCanvas";
import { api } from "@/lib/api";

export default async function MapPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ topic?: string }>;
}) {
  const { id } = await params;
  const { topic } = await searchParams;
  const { userId, getToken } = await auth();
  if (!userId) redirect("/sign-in");

  const token = await getToken();

  let mindMap;
  try {
    mindMap = await api.mindmaps.get(id, token!);
  } catch {
    notFound();
  }

  return (
    <MindMapCanvas
      mindMapId={mindMap.id}
      initialTitle={mindMap.title}
      initialGraph={mindMap.graph_data}
      token={token!}
      initialTopic={topic ?? null}
    />
  );
}
