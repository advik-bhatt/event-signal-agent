"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const features = [
  {
    title: "AI ranks events by your actual goals",
    body: "Tell Breathe what you're building, who you want to meet, or what you're learning. It surfaces the right events — not the popular ones.",
  },
  {
    title: "One-click add to calendar",
    body: "No friction. No copy-pasting. Tap once and it lands in your Google or Apple calendar with everything you need.",
  },
  {
    title: "Learns what you care about",
    body: "The more you use Breathe, the sharper your feed becomes. Miss an event? Mark it. Love a speaker? Remember them.",
  },
];

function MockUI() {
  const items = [
    {
      title: "Founder Fireside: Building in Uncertainty",
      tag: "High match",
      time: "Thu 7pm · SoHo",
      score: 94,
    },
    {
      title: "NYC AI Demo Night",
      tag: "Strong match",
      time: "Fri 6:30pm · Tribeca",
      score: 88,
    },
    {
      title: "Design Systems Roundtable",
      tag: "Good match",
      time: "Sat 2pm · Brooklyn",
      score: 71,
    },
  ];

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Mock browser chrome */}
      <div className="rounded-2xl border border-charcoal/8 bg-white/70 shadow-xl shadow-charcoal/5 overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-charcoal/6 bg-white/50">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-charcoal/10" />
            <div className="w-2.5 h-2.5 rounded-full bg-charcoal/10" />
            <div className="w-2.5 h-2.5 rounded-full bg-charcoal/10" />
          </div>
          <div className="flex-1 mx-3 h-5 rounded-full bg-charcoal/6 flex items-center px-3">
            <span className="text-[10px] text-charcoal/30">breathe.app/for-you</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-1">
            <span className="font-serif text-sm text-charcoal">Your week</span>
            <span className="font-sans text-[11px] text-charcoal/35 tracking-wide">3 of 400+</span>
          </div>

          {/* Event cards */}
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 + i * 0.12 }}
              className="flex items-start gap-3 p-3 rounded-xl bg-paper/60 border border-charcoal/5 hover:border-charcoal/10 transition-colors duration-200 cursor-pointer"
            >
              {/* Score pill */}
              <div
                className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-sans font-medium text-white"
                style={{ background: `rgba(90,122,90,${0.4 + (item.score / 100) * 0.5})` }}
              >
                {item.score}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-sans text-xs text-charcoal leading-snug mb-1 line-clamp-2">
                  {item.title}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-sans text-sage">{item.tag}</span>
                  <span className="text-charcoal/20">·</span>
                  <span className="text-[10px] font-sans text-charcoal/40">{item.time}</span>
                </div>
              </div>

              {/* Add button */}
              <button className="flex-shrink-0 w-6 h-6 rounded-full border border-charcoal/12 flex items-center justify-center hover:bg-sage hover:border-sage hover:text-white transition-all duration-200 text-charcoal/30">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <line x1="5" y1="1" x2="5" y2="9" />
                  <line x1="1" y1="5" x2="9" y2="5" />
                </svg>
              </button>
            </motion.div>
          ))}

          {/* Footer */}
          <div className="pt-1 flex items-center justify-center">
            <span className="text-[10px] font-sans text-charcoal/25 tracking-wide">
              397 more events available
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Solution() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-28 md:py-36 px-6 bg-paper/50">
      <div className="max-w-6xl mx-auto">
        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-4"
        >
          <span className="font-sans text-xs tracking-[0.2em] uppercase text-charcoal/35">
            The signal
          </span>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left: animated UI mockup */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
            className="lg:order-1 order-2"
          >
            <MockUI />
          </motion.div>

          {/* Right: copy */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="lg:order-2 order-1"
          >
            <h2 className="font-serif text-3xl md:text-4xl text-charcoal mb-5 leading-tight">
              Breathe finds, ranks, and schedules the events that matter to you.
            </h2>
            <p className="font-sans text-base text-charcoal/50 mb-10 leading-relaxed">
              Not the most popular events. Not the ones with the biggest budgets.
              The ones that actually move the needle for what you&apos;re working on right now.
            </p>

            <div className="space-y-7">
              {features.map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
                  className="flex gap-4"
                >
                  {/* Dot indicator */}
                  <div className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-sage" />
                  <div>
                    <p className="font-sans text-sm font-medium text-charcoal mb-1">
                      {feature.title}
                    </p>
                    <p className="font-sans text-sm text-charcoal/45 leading-relaxed">
                      {feature.body}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
