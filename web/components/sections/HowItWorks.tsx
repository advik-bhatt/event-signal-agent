"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Tell Breathe what you're working on",
    body: "Connect your GitHub repo, paste your project goals, or just describe what you're building in plain language. The more context you give, the sharper your recommendations.",
    visual: (
      <div className="w-full max-w-xs mx-auto">
        <div className="rounded-2xl border border-charcoal/8 bg-white/60 p-5 shadow-sm">
          <p className="font-sans text-xs text-charcoal/35 mb-3 uppercase tracking-wider">
            What are you working on?
          </p>
          <div className="p-4 rounded-xl bg-paper/80 border border-charcoal/6 font-sans text-sm text-charcoal/70 leading-relaxed">
            "Building a B2B SaaS for engineering teams. Looking to meet potential design partners and learn from other founders doing enterprise sales for the first time."
          </div>
          <div className="mt-3 flex gap-2">
            <div className="h-7 flex-1 rounded-lg bg-charcoal/4 flex items-center px-3">
              <span className="text-xs text-charcoal/25">Connect GitHub</span>
            </div>
            <button className="h-7 px-4 rounded-lg bg-sage text-white text-xs font-sans">
              Done
            </button>
          </div>
        </div>
      </div>
    ),
  },
  {
    number: "02",
    title: "We surface events across every source",
    body: "Breathe scans NYC Tech Week, Luma, Eventbrite, Meetup, Twitter/X, and dozens more — in real time. No more context-switching between tabs.",
    visual: (
      <div className="w-full max-w-xs mx-auto">
        <div className="rounded-2xl border border-charcoal/8 bg-white/60 p-5 shadow-sm">
          <p className="font-sans text-xs text-charcoal/35 mb-3 uppercase tracking-wider">
            Scanning sources
          </p>
          <div className="space-y-2">
            {[
              { name: "NYC Tech Week", count: "142 events", pct: 88 },
              { name: "Luma", count: "89 events", pct: 70 },
              { name: "Eventbrite", count: "203 events", pct: 95 },
              { name: "Meetup", count: "67 events", pct: 55 },
              { name: "Twitter/X", count: "31 events", pct: 30 },
            ].map((src) => (
              <div key={src.name} className="flex items-center gap-3">
                <span className="font-sans text-xs text-charcoal/55 w-24 flex-shrink-0">{src.name}</span>
                <div className="flex-1 h-1.5 bg-charcoal/6 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${src.pct}%` }}
                    transition={{ duration: 0.9, delay: 0.3, ease: "easeOut" }}
                    className="h-full bg-sage/50 rounded-full"
                  />
                </div>
                <span className="font-sans text-[10px] text-charcoal/30 w-16 text-right">{src.count}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-charcoal/6 flex justify-between">
            <span className="text-xs text-charcoal/35">Total found</span>
            <span className="text-xs font-medium text-charcoal/60">532 events</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    number: "03",
    title: "One tap to add the ones that matter",
    body: "Your ranked shortlist arrives clean and calm. Read a quick brief on each one. Tap to add. That's it — no forms, no friction, no FOMO.",
    visual: (
      <div className="w-full max-w-xs mx-auto">
        <div className="rounded-2xl border border-charcoal/8 bg-white/60 p-5 shadow-sm">
          <p className="font-sans text-xs text-charcoal/35 mb-3 uppercase tracking-wider">
            Your shortlist
          </p>
          <div className="space-y-3">
            {[
              { title: "Founder Fireside: Building in Uncertainty", added: true },
              { title: "Enterprise Sales for Engineers", added: false },
              { title: "B2B SaaS Growth Roundtable", added: false },
            ].map((ev, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-colors duration-200 ${
                  ev.added
                    ? "bg-sage/8 border-sage/20"
                    : "bg-paper/60 border-charcoal/5"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center transition-colors duration-200 ${
                    ev.added ? "bg-sage" : "border border-charcoal/15"
                  }`}
                >
                  {ev.added && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="2,5 4,7.5 8,2.5" />
                    </svg>
                  )}
                </div>
                <span className="font-sans text-xs text-charcoal/70 leading-snug line-clamp-2">
                  {ev.title}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-center text-[10px] text-charcoal/30 font-sans">
            Added to your calendar in one tap
          </p>
        </div>
      </div>
    ),
  },
];

export default function HowItWorks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section
      id="how-it-works"
      ref={ref}
      className="py-28 md:py-36 px-6"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-4"
        >
          <span className="font-sans text-xs tracking-[0.2em] uppercase text-charcoal/35">
            How it works
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.08 }}
          className="font-serif text-3xl md:text-4xl text-charcoal text-center mb-16"
        >
          Three steps. No overwhelm.
        </motion.h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left: step list */}
          <div className="space-y-1">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -16 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2 + i * 0.12 }}
                onClick={() => setActiveStep(i)}
                className={`group cursor-pointer p-6 rounded-2xl transition-all duration-400 ${
                  activeStep === i
                    ? "bg-white/80 border border-charcoal/8 shadow-sm"
                    : "hover:bg-white/40 border border-transparent"
                }`}
              >
                <div className="flex gap-5">
                  {/* Step number */}
                  <div
                    className={`flex-shrink-0 font-serif text-3xl leading-none transition-colors duration-300 ${
                      activeStep === i ? "text-sage/40" : "text-charcoal/10"
                    }`}
                  >
                    {step.number}
                  </div>
                  <div>
                    <h3
                      className={`font-serif text-xl mb-2 transition-colors duration-300 ${
                        activeStep === i ? "text-charcoal" : "text-charcoal/60"
                      }`}
                    >
                      {step.title}
                    </h3>
                    <p
                      className={`font-sans text-sm leading-relaxed transition-all duration-300 ${
                        activeStep === i
                          ? "text-charcoal/55 max-h-40 opacity-100"
                          : "text-charcoal/35 max-h-0 opacity-0 overflow-hidden"
                      }`}
                    >
                      {step.body}
                    </p>
                  </div>
                </div>

                {/* Progress line */}
                {activeStep === i && i < steps.length - 1 && (
                  <div className="mt-4 ml-[52px] flex items-center gap-3">
                    <div className="flex-1 h-px bg-charcoal/8" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Right: visual */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="lg:sticky lg:top-24"
          >
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              {steps[activeStep].visual}
            </motion.div>

            {/* Step dots */}
            <div className="flex justify-center gap-2 mt-6">
              {steps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveStep(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    activeStep === i ? "bg-sage w-4" : "bg-charcoal/15 hover:bg-charcoal/25"
                  }`}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
