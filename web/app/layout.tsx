import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Breathe — Every event worth your time",
  description:
    "Breathe finds, ranks, and schedules the events that matter to you. No noise, no FOMO — just the signal.",
  keywords: ["events", "event discovery", "scheduling", "NYC tech week", "meetup", "conference"],
  openGraph: {
    title: "Breathe — Every event worth your time",
    description: "AI-powered event discovery and scheduling. Just breathe.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Breathe — Every event worth your time",
    description: "AI-powered event discovery and scheduling. Just breathe.",
  },
};

// Check for Clerk keys at the module level (server-side only)
const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const clerkEnabled =
  typeof publishableKey === "string" &&
  publishableKey.length > 0 &&
  publishableKey !== "pk_test_your_publishable_key_here" &&
  publishableKey.startsWith("pk_");

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  if (clerkEnabled) {
    // Dynamically import ClerkProvider only when keys are available
    const { ClerkProvider } = await import("@clerk/nextjs");
    return (
      <ClerkProvider>
        <html lang="en" className="scroll-smooth">
          <body className="bg-paper text-charcoal antialiased">
            {children}
          </body>
        </html>
      </ClerkProvider>
    );
  }

  // No Clerk keys — render without provider (CTAs will fall back to href links)
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-paper text-charcoal antialiased">
        {children}
      </body>
    </html>
  );
}
