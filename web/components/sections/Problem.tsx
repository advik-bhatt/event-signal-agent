"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const problems = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    number: "17",
    label: "Slack messages about events",
    detail: "From 6 different channels. Half already past. None with a simple calendar link.",
    delay: 0,
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
    number: "4",
    label: "Different event sites to check",
    detail: "Luma, Partiful, Eventbrite, Meetup — each with a different login and no shared calendar.",
    delay: 0.12,
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    number: "∅",
    label: "Calendar blocked by the wrong things",
    detail: "You RSVPd to three events you forgot about and missed the one that would have mattered.",
    delay: 0.24,
  },
];

export default function Problem() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      className="relative py-28 md:py-36 px-6 overflow-hidden"
    >
      {/* Section background tint */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(26,24,20,0.025) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-5xl mx-auto">
        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-4"
        >
          <span className="font-sans text-xs tracking-[0.2em] uppercase text-charcoal/35">
            The noise
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.08, ease: "easeOut" }}
          className="font-serif text-3xl md:text-4xl lg:text-5xl text-charcoal text-center mb-4"
        >
          Finding events is exhausting.
        </motion.h2>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.16, ease: "easeOut" }}
          className="font-sans text-base text-charcoal/50 text-center max-w-xl mx-auto mb-16 leading-relaxed"
        >
          It&apos;s not that there aren&apos;t enough events. It&apos;s that there are
          too many, scattered everywhere, with no way to know which ones
          are actually worth your time.
        </motion.p>

        {/* Problem cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {problems.map((problem, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.6,
                delay: 0.3 + problem.delay,
                ease: "easeOut",
              }}
              className="relative group"
            >
              <div className="h-full p-7 rounded-2xl border border-charcoal/6 bg-white/40 hover:bg-white/60 hover:border-charcoal/10 transition-all duration-500">
                {/* Icon */}
                <div className="w-8 h-8 text-charcoal/30 mb-5 group-hover:text-charcoal/45 transition-colors duration-300">
                  {problem.icon}
                </div>

                {/* Big number */}
                <div className="font-serif text-5xl text-charcoal/12 mb-2 leading-none group-hover:text-charcoal/18 transition-colors duration-300">
                  {problem.number}
                </div>

                {/* Label */}
                <p className="font-serif text-lg text-charcoal mb-3 leading-snug">
                  {problem.label}
                </p>

                {/* Detail */}
                <p className="font-sans text-sm text-charcoal/45 leading-relaxed">
                  {problem.detail}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Transition line */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={isInView ? { opacity: 1, scaleX: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.7, ease: "easeOut" }}
          className="mt-20 flex items-center gap-6"
        >
          <div className="flex-1 h-px bg-charcoal/8" />
          <span className="font-sans text-xs text-charcoal/30 tracking-[0.15em] uppercase whitespace-nowrap">
            There&apos;s a calmer way
          </span>
          <div className="flex-1 h-px bg-charcoal/8" />
        </motion.div>
      </div>
    </section>
  );
}
