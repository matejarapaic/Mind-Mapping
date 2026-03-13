import Link from "next/link";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white/70">Mind Maps</span>
        </div>
        <SignedOut>
          <SignInButton mode="modal">
            <button className="px-4 py-2 text-sm text-white/60 hover:text-white border border-white/10 hover:border-white/25 rounded-xl transition-all">
              Sign in
            </button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <Link
            href="/dashboard"
            className="px-4 py-2 text-sm text-white/60 hover:text-white border border-white/10 hover:border-white/25 rounded-xl transition-all"
          >
            Dashboard →
          </Link>
        </SignedIn>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center pb-20">
        <h1 className="text-5xl sm:text-6xl font-light text-white/90 tracking-tight mb-5 max-w-2xl leading-tight">
          Think visually.
          <br />
          <span className="text-white">Map anything.</span>
        </h1>
        <p className="text-lg text-white/35 mb-10 max-w-md leading-relaxed">
          Turn any idea into a structured mind map in seconds — powered by
          Claude AI.
        </p>

        <SignedOut>
          <SignInButton mode="modal">
            <button className="px-8 py-3.5 bg-white text-black font-medium rounded-2xl hover:bg-white/90 transition-all text-base">
              Get started free →
            </button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <Link
            href="/dashboard"
            className="px-8 py-3.5 bg-white text-black font-medium rounded-2xl hover:bg-white/90 transition-all text-base"
          >
            Open dashboard →
          </Link>
        </SignedIn>

        <p className="text-xs text-white/20 mt-4">No credit card required</p>

        {/* How it works */}
        <div className="mt-20 max-w-3xl w-full">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/20 mb-6">
            How it works
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            {[
              {
                icon: "✦",
                title: "Type a topic",
                desc: "Enter any concept, strategy, or idea — the AI does the rest.",
              },
              {
                icon: "⟳",
                title: "AI builds your map",
                desc: "Claude generates branches, sub-topics, and connections instantly.",
              },
              {
                icon: "⊕",
                title: "Expand & explore",
                desc: "Click any node to go deeper or add your own ideas manually.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-[#171717] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors"
              >
                <div className="text-indigo-400 text-2xl mb-3">{item.icon}</div>
                <p className="text-sm font-medium text-white/80 mb-1.5">
                  {item.title}
                </p>
                <p className="text-xs text-white/35 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="text-center py-6 text-xs text-white/15">
        Powered by Claude AI
      </footer>
    </div>
  );
}
