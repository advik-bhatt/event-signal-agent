"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Start calm. See if it fits.",
    lines: [
      "Up to 3 curated events per week",
      "One calendar integration",
      "Basic AI ranking",
    ],
    cta: "Start free",
    href: "/sign-up",
    highlight: false,
    delay: 0,
  },
  {
    name: "Pro",
    price: "$9",
    period: "per month",
    description: "For people who take events seriously.",
    lines: [
      "Unlimited event recommendations",
      "All calendar integrations",
      "Advanced AI with goal tracking",
    ],
    cta: "Start free trial",
    href: "/sign-up?plan=pro",
    highlight: true,
    delay: 0.1,
  },
  {
    name: "Team",
    price: "$29",
    period: "per month",
    description: "For teams that move together.",
    lines: [
      "Everything in Pro",
      "Shared team workspace",
      "Up to 8 team members",
    ],
    cta: "Try for free",
    href: "/sign-up?plan=team",
    highlight: false,
    delay: 0.2,
  },
];

export default function Pricing() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section ref={ref} className="py-28 md:py-36 px-6" id="pricing">
      <div className="max-w-4xl mx-auto">
        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-4"
        >
          <span className="font-sans text-xs tracking-[0.2em] uppercase text-charcoal/35">
            Pricing
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.08 }}
          className="font-serif text-3xl md:text-4xl text-charcoal text-center mb-4"
        >
          Simple. No surprises.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="font-sans text-base text-charcoal/45 text-center mb-14"
        >
          Cancel any time. No feature walls, no dark patterns.
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.25 + plan.delay }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              className={`relative rounded-2xl p-7 transition-all duration-400 ${
                plan.highlight
                  ? "bg-sage text-white border border-sage shadow-lg shadow-sage/15"
                  : "bg-white/60 border border-charcoal/6 hover:border-charcoal/12 hover:bg-white/80"
              } ${hovered === i && !plan.highlight ? "shadow-md" : ""}`}
            >
              {/* Popular badge */}
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 rounded-full bg-charcoal text-white text-[10px] font-sans tracking-wider uppercase whitespace-nowrap">
                    Most popular
                  </span>
                </div>
              )}

              {/* Plan name */}
              <p
                className={`font-sans text-xs tracking-[0.15em] uppercase mb-4 ${
                  plan.highlight ? "text-white/60" : "text-charcoal/35"
                }`}
              >
                {plan.name}
              </p>

              {/* Price */}
              <div className="flex items-baseline gap-1 mb-1">
                <span
                  className={`font-serif text-4xl ${
                    plan.highlight ? "text-white" : "text-charcoal"
                  }`}
                >
                  {plan.price}
                </span>
                <span
                  className={`font-sans text-sm ${
                    plan.highlight ? "text-white/50" : "text-charcoal/40"
                  }`}
                >
                  / {plan.period}
                </span>
              </div>

              {/* Description */}
              <p
                className={`font-sans text-sm mb-6 ${
                  plan.highlight ? "text-white/70" : "text-charcoal/50"
                }`}
              >
                {plan.description}
              </p>

              {/* Divider */}
              <div
                className={`h-px mb-6 ${
                  plan.highlight ? "bg-white/15" : "bg-charcoal/6"
                }`}
              />

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.lines.map((line, j) => (
                  <li key={j} className="flex items-start gap-2.5">
                    <div
                      className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${
                        plan.highlight
                          ? "bg-white/20"
                          : "bg-sage/10"
                      }`}
                    >
                      <svg
                        width="8"
                        height="8"
                        viewBox="0 0 8 8"
                        fill="none"
                        stroke={plan.highlight ? "white" : "#5a7a5a"}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="1,4 3,6.5 7,1.5" />
                      </svg>
                    </div>
                    <span
                      className={`font-sans text-sm leading-snug ${
                        plan.highlight ? "text-white/80" : "text-charcoal/60"
                      }`}
                    >
                      {line}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <a
                href={plan.href}
                className={`block w-full py-3 rounded-xl font-sans text-sm text-center transition-all duration-300 ${
                  plan.highlight
                    ? "bg-white text-sage hover:bg-white/90 font-medium"
                    : "border border-charcoal/10 text-charcoal/60 hover:border-charcoal/20 hover:text-charcoal/80 hover:bg-charcoal/2"
                }`}
              >
                {plan.cta}
              </a>
            </motion.div>
          ))}
        </div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-8 text-center font-sans text-xs text-charcoal/25"
        >
          All plans include a 14-day free trial of Pro features. No credit card required.
        </motion.p>
      </div>
    </section>
  );
}
