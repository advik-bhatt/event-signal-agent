"use client";

import { useEffect, useState, Suspense, lazy } from "react";
import { motion } from "framer-motion";

// Lazy-load the 3D sphere to avoid SSR issues
const BreathingSphere = lazy(() => import("@/components/ui/BreathingSphere"));

function HeroCTAs() {
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [ClerkButtons, setClerkButtons] = useState<{ SignUpButton: any | null }>({ SignUpButton: null });

  useEffect(() => {
    setMounted(true);
    // Dynamically import Clerk to handle missing keys gracefully
    import("@clerk/nextjs")
      .then((clerk) => {
        setClerkButtons({
          SignUpButton: clerk.SignUpButton,
        });
      })
      .catch(() => {
        // Clerk not configured — use fallback links
        setClerkButtons({ SignUpButton: null });
      });
  }, []);

  if (!mounted) {
    return (
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
        <div className="h-12 w-44 rounded-full bg-sage/10 animate-pulse" />
        <div className="h-12 w-40 rounded-full bg-muted-light/20 animate-pulse" />
      </div>
    );
  }

  const { SignUpButton } = ClerkButtons;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
      {SignUpButton ? (
        <SignUpButton mode="modal">
          <button className="px-8 py-3.5 bg-sage text-white font-sans text-sm tracking-wide rounded-full hover:bg-sage-dark transition-all duration-300 hover:shadow-lg hover:shadow-sage/20 hover:-translate-y-0.5 active:translate-y-0">
            Get early access
          </button>
        </SignUpButton>
      ) : (
        <a
          href="/sign-in"
          className="px-8 py-3.5 bg-sage text-white font-sans text-sm tracking-wide rounded-full hover:bg-sage-dark transition-all duration-300 hover:shadow-lg hover:shadow-sage/20 hover:-translate-y-0.5"
        >
          Get early access
        </a>
      )}

      <a
        href="#how-it-works"
        className="px-8 py-3.5 text-charcoal/60 font-sans text-sm tracking-wide rounded-full border border-charcoal/10 hover:border-charcoal/25 hover:text-charcoal/80 transition-all duration-300 hover:-translate-y-0.5"
      >
        See how it works
      </a>
    </div>
  );
}

function SphereReveal({ onReady }: { onReady: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onReady, 400);
    return () => clearTimeout(timer);
  }, [onReady]);
  return null;
}

export default function Hero() {
  const [sphereReady, setSphereReady] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-paper">
      {/* Subtle radial gradient background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(90,122,90,0.06) 0%, transparent 70%)",
        }}
      />

      {/* 3D Sphere — fills the center area */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ zIndex: 0 }}
      >
        <motion.div
          className="w-[520px] h-[520px] max-w-[85vw] max-h-[85vw]"
          initial={{ opacity: 0 }}
          animate={{ opacity: sphereReady ? 1 : 0 }}
          transition={{ duration: 1.8, ease: "easeOut" }}
        >
          {isClient && (
            <Suspense fallback={<div className="w-full h-full" />}>
              <BreathingSphere />
            </Suspense>
          )}
        </motion.div>
      </div>

      <SphereReveal onReady={() => setSphereReady(true)} />

      {/* Content — layered above sphere */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-3xl mx-auto">
        {/* Logo wordmark */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="mb-20 md:mb-24"
        >
          <span className="font-serif text-sm tracking-[0.25em] text-charcoal/40 uppercase">
            breathe
          </span>
        </motion.div>

        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 0.5, ease: "easeOut" }}
          className="font-serif text-[clamp(4rem,12vw,9rem)] leading-none tracking-tight text-charcoal mb-6"
        >
          Breathe.
        </motion.h1>

        {/* Subline */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.8, ease: "easeOut" }}
          className="font-sans text-lg md:text-xl text-charcoal/50 max-w-md leading-relaxed"
        >
          Every event worth your time.
          <br />
          Nothing else.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1, ease: "easeOut" }}
        >
          <HeroCTAs />
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.0, delay: 1.8 }}
          className="mt-16 md:mt-20 flex flex-col items-center gap-2 text-charcoal/25"
        >
          <span className="font-sans text-xs tracking-[0.2em] uppercase">scroll</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            className="w-px h-8 bg-gradient-to-b from-charcoal/25 to-transparent"
          />
        </motion.div>
      </div>
    </section>
  );
}
