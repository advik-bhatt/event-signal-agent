import { redirect } from "next/navigation";

// Force dynamic rendering — this page requires auth and cannot be statically generated
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  // Guard: only attempt Clerk auth if keys are configured
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const hasClerkKeys =
    publishableKey &&
    publishableKey !== "pk_test_your_publishable_key_here" &&
    publishableKey.startsWith("pk_");

  if (!hasClerkKeys) {
    // Dev mode without Clerk keys — show a friendly stub
    return <DashboardStub userName={null} />;
  }

  // Dynamically import Clerk so the build doesn't fail when keys are absent
  const { auth, currentUser } = await import("@clerk/nextjs/server");
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await currentUser();

  return (
    <DashboardStub
      userName={user?.firstName ?? null}
    />
  );
}

function DashboardStub({ userName }: { userName: string | null }) {
  return (
    <div className="min-h-screen bg-paper flex flex-col">
      {/* Nav */}
      <header className="border-b border-muted-light/40 px-6 py-4 flex items-center justify-between">
        <a href="/" className="font-serif text-xl text-charcoal tracking-tight">
          breathe
        </a>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted">
            {userName ? `Hello, ${userName}` : "Welcome back"}
          </span>
          <a
            href="/"
            className="text-sm text-muted hover:text-charcoal transition-colors"
          >
            Sign out
          </a>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-2xl mx-auto text-center">
          {/* Breathing indicator */}
          <div className="mb-12 flex justify-center">
            <div className="relative">
              <div
                className="w-24 h-24 rounded-full bg-sage/10 animate-[breatheIn_4s_ease-in-out_infinite]"
                style={{ animationDelay: "0s" }}
              />
              <div
                className="absolute inset-3 rounded-full bg-sage/20 animate-[breatheIn_4s_ease-in-out_infinite]"
                style={{ animationDelay: "0.3s" }}
              />
              <div
                className="absolute inset-6 rounded-full bg-sage/30 animate-[breatheIn_4s_ease-in-out_infinite]"
                style={{ animationDelay: "0.6s" }}
              />
            </div>
          </div>

          <h1 className="font-serif text-4xl md:text-5xl text-charcoal mb-4">
            You&apos;re in.
          </h1>
          <p className="text-muted text-lg mb-8 leading-relaxed">
            Your personalized event feed is being prepared. We&apos;re scanning
            hundreds of sources to find the events that actually match what
            you&apos;re working on.
          </p>

          <div className="inline-flex items-center gap-3 px-6 py-4 bg-sage/5 border border-sage/20 rounded-2xl text-sm text-charcoal/70">
            <div className="w-2 h-2 rounded-full bg-sage animate-pulse" />
            <span>Full dashboard launching soon — you&apos;re on the early access list</span>
          </div>

          {/* Feature cards */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            <a
              href="/dashboard/calendar"
              className="group p-6 bg-white border border-muted-light/60 rounded-2xl hover:border-sage/40 hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 bg-sage/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-sage/20 transition-colors">
                <span className="text-sage text-xl">📅</span>
              </div>
              <h3 className="font-serif text-xl text-charcoal mb-1">Your calendar</h3>
              <p className="text-sm text-muted leading-relaxed">
                Color-coded week view of all your saved events, ranked by AI score.
              </p>
              <div className="mt-4 text-xs font-medium text-sage group-hover:text-sage-dark transition-colors">
                View calendar →
              </div>
            </a>

            <a
              href="/import"
              className="group p-6 bg-white border border-muted-light/60 rounded-2xl hover:border-sage/40 hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 bg-sage/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-sage/20 transition-colors">
                <span className="text-sage text-xl">✨</span>
              </div>
              <h3 className="font-serif text-xl text-charcoal mb-1">Import event</h3>
              <p className="text-sm text-muted leading-relaxed">
                Paste a Luma, Partiful, or Eventbrite link and we&apos;ll score it for you.
              </p>
              <div className="mt-4 text-xs font-medium text-sage group-hover:text-sage-dark transition-colors">
                Import now →
              </div>
            </a>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-6 text-center">
            {[
              { label: "Events discovered", value: "400+" },
              { label: "Ranked for you", value: "3–5" },
              { label: "Time saved", value: "~2hrs/wk" },
            ].map((stat) => (
              <div key={stat.label} className="p-4">
                <div className="font-serif text-3xl text-charcoal mb-1">{stat.value}</div>
                <div className="text-xs text-muted uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
