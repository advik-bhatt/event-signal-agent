import { redirect } from 'next/navigation';
import { getWorkspaceByInviteCode, joinWorkspace } from '@/lib/db';

export const dynamic = 'force-dynamic';

interface InvitePageProps {
  params: Promise<{ code: string }>;
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { code } = await params;
  const workspace = await getWorkspaceByInviteCode(code);

  // Check Clerk auth
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const hasClerkKeys =
    publishableKey &&
    publishableKey !== 'pk_test_your_publishable_key_here' &&
    publishableKey.startsWith('pk_');

  let userId: string | null = null;

  if (hasClerkKeys) {
    try {
      const { auth } = await import('@clerk/nextjs/server');
      const { userId: uid } = await auth();
      userId = uid;
    } catch {
      // Clerk not available
    }
  }

  // If authenticated and workspace exists, auto-join
  if (userId && workspace) {
    await joinWorkspace(workspace.id, userId);
    redirect('/dashboard/calendar');
  }

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      {/* Nav */}
      <header className="border-b border-muted-light/40 px-6 py-4 flex items-center justify-between">
        <a href="/" className="font-serif text-xl text-charcoal tracking-tight hover:opacity-70 transition-opacity">
          breathe
        </a>
      </header>

      {/* Invite content */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          {/* Breathing animation */}
          <div className="mb-10 flex justify-center">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-sage/10 animate-[breatheIn_4s_ease-in-out_infinite]" />
              <div className="absolute inset-3 rounded-full bg-sage/20 animate-[breatheIn_4s_ease-in-out_infinite]" style={{ animationDelay: '0.3s' }} />
              <div className="absolute inset-6 rounded-full bg-sage/30 animate-[breatheIn_4s_ease-in-out_infinite]" style={{ animationDelay: '0.6s' }} />
            </div>
          </div>

          {workspace ? (
            <>
              <h1 className="font-serif text-3xl text-charcoal mb-3">
                You&apos;ve been invited to
              </h1>
              <h2 className="font-serif text-4xl text-charcoal mb-4">
                {workspace.name}
              </h2>
              <p className="text-muted text-base mb-10 leading-relaxed">
                Join your team on Breathe to discover and share the best events together.
              </p>

              {hasClerkKeys ? (
                <div className="space-y-3">
                  <a
                    href={`/sign-up?redirect_url=/invite/${code}`}
                    className="block w-full py-3.5 bg-sage text-white rounded-xl font-medium text-sm hover:bg-sage-dark transition-colors"
                  >
                    Create an account
                  </a>
                  <a
                    href={`/sign-in?redirect_url=/invite/${code}`}
                    className="block w-full py-3.5 bg-white border border-muted-light/60 text-charcoal rounded-xl font-medium text-sm hover:bg-paper hover:border-sage/40 transition-colors"
                  >
                    Sign in
                  </a>
                </div>
              ) : (
                <div className="space-y-3">
                  <a
                    href="/dashboard/calendar"
                    className="block w-full py-3.5 bg-sage text-white rounded-xl font-medium text-sm hover:bg-sage-dark transition-colors"
                  >
                    Join team &amp; view calendar
                  </a>
                  <p className="text-xs text-muted">
                    Auth not configured — joining as guest
                  </p>
                </div>
              )}
            </>
          ) : (
            <>
              <h1 className="font-serif text-3xl text-charcoal mb-3">
                Invite link not found
              </h1>
              <p className="text-muted text-base mb-10 leading-relaxed">
                This invite link may have expired or the workspace no longer exists.
              </p>
              <a
                href="/"
                className="inline-block px-6 py-3 bg-sage text-white rounded-xl font-medium text-sm hover:bg-sage-dark transition-colors"
              >
                Go home
              </a>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
