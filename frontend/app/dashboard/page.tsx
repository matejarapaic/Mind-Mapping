import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { api } from "@/lib/api";
import type { MindMapListItem } from "@/lib/types";
import NewMindMapButton from "./NewMindMapButton";

export default async function DashboardPage() {
  const { userId, getToken } = await auth();
  if (!userId) redirect("/sign-in");

  const token = await getToken();
  let maps: MindMapListItem[] = [];

  try {
    maps = await api.mindmaps.list(token!);
  } catch {
    // Backend might not be running locally; show empty state
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Nav */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
        <h1 className="text-lg font-bold text-indigo-400">Mind Maps</h1>
        <div className="flex items-center gap-4">
          <NewMindMapButton token={token!} />
          <UserButton />
        </div>
      </header>

      {/* Grid */}
      <main className="p-6">
        {maps.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500">
            <p className="text-lg mb-3">No mind maps yet</p>
            <NewMindMapButton token={token!} label="Create your first map" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {maps.map((map) => (
              <Link
                key={map.id}
                href={`/map/${map.id}`}
                className="block bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-indigo-600 rounded-xl p-4 transition-all"
              >
                <h2 className="font-semibold text-white truncate">{map.title}</h2>
                <p className="text-xs text-slate-500 mt-1">
                  {new Date(map.updated_at).toLocaleDateString()}
                </p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
