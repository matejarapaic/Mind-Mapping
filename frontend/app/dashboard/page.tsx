import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { api } from "@/lib/api";
import type { MindMapListItem } from "@/lib/types";
import DashboardShell from "./DashboardShell";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  const { userId, getToken } = await auth();
  if (!userId) redirect("/sign-in");

  const [user, token] = await Promise.all([currentUser(), getToken()]);

  let maps: MindMapListItem[] = [];
  try {
    maps = await api.mindmaps.list(token!);
  } catch {
    // Backend might not be running locally; show empty state
  }

  return (
    <DashboardShell
      maps={maps}
      token={token!}
      userName={user?.firstName ?? ""}
      greeting={getGreeting()}
    />
  );
}
