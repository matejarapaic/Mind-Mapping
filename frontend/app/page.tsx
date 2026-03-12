import Link from "next/link";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
        Mind Mapping Tool
      </h1>
      <p className="text-xl text-slate-400 mb-10 max-w-lg">
        Turn any idea into a visual knowledge map — powered by Claude AI.
      </p>

      <SignedOut>
        <SignInButton mode="modal">
          <button className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors">
            Get Started
          </button>
        </SignInButton>
      </SignedOut>

      <SignedIn>
        <Link
          href="/dashboard"
          className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors"
        >
          Go to Dashboard →
        </Link>
      </SignedIn>
    </main>
  );
}
