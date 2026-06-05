"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const testimonials = [
  {
    quote:
      "I used to spend Sunday night scrolling four different sites figuring out what was happening that week. Now I open Breathe, glance at my three, and that's it. The mental weight is just… gone.",
    name: "Priya Mehta",
    role: "Co-founder, Fieldwork",
    initials: "PM",
    delay: 0,
  },
  {
    quote:
      "As an engineer who hates FOMO but also hates noise, this is exactly right. It surfaces the Luma dinners and the small roundtables that actually have the right people in the room.",
    name: "Marcus Chen",
    role: "Staff Engineer, Linear",
    initials: "MC",
    delay: 0.1,
  },
  {
    quote:
      "I sent it to my whole team for NYC Tech Week. Everyone added 2–3 events to their calendars in under five minutes. No group chat chaos, no duplicate signups. Calm.",
    name: "Tara Sullivan",
    role: "Head of Community, Notion",
    initials: "TS",
    delay: 0.2,
  },
  {
    quote:
      "The AI actually learns. First week it was decent. By week three it was surfacing events I wouldn't have found in an hour of searching. That's the product.",
    name: "James Okafor",
    role: "Founder, Relay",
    initials: "JO",
    delay: 0.3,
  },
];

export default function Testimonials() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} className="py-28 md:py-36 px-6 bg-paper/30">
      <div className="max-w-5xl mx-auto">
        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-4"
        >
          <span className="font-sans text-xs tracking-[0.2em] uppercase text-charcoal/35">
            Early voices
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.08 }}
          className="font-serif text-3xl md:text-4xl text-charcoal text-center mb-16"
        >
          People who&apos;ve breathed.
        </motion.h2>

        {/* Newspaper column layout */}
        <div className="columns-1 md:columns-2 gap-6 space-y-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + t.delay }}
              className="break-inside-avoid"
            >
              <div className="p-7 rounded-2xl border border-charcoal/6 bg-white/50 hover:bg-white/70 hover:border-charcoal/10 transition-all duration-400">
                {/* Opening quote mark */}
                <div className="font-serif text-5xl leading-none text-charcoal/10 mb-2 -mt-1">
                  &ldquo;
                </div>

                {/* Quote */}
                <blockquote className="font-serif text-base md:text-lg text-charcoal/75 leading-relaxed mb-6 italic">
                  {t.quote}
                </blockquote>

                {/* Attribution */}
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-sage/15 flex items-center justify-center flex-shrink-0">
                    <span className="font-sans text-xs font-medium text-sage/70">
                      {t.initials}
                    </span>
                  </div>
                  <div>
                    <p className="font-sans text-sm font-medium text-charcoal">
                      {t.name}
                    </p>
                    <p className="font-sans text-xs text-charcoal/40">
                      {t.role}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Social proof note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-10 text-center font-sans text-xs text-charcoal/25"
        >
          Quotes from early access users. Names used with permission.
        </motion.p>
      </div>
    </section>
  );
}
