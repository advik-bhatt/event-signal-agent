"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

const footerLinks = {
  Product: ["How it works", "Pricing", "Changelog", "Roadmap"],
  Company: ["About", "Blog", "Press", "Careers"],
  Legal: ["Privacy", "Terms", "Cookies"],
};

export default function FooterCTA() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [focused, setFocused] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
    }
  }

  return (
    <footer ref={ref} className="relative overflow-hidden">
      {/* CTA section */}
      <div className="relative py-28 md:py-36 px-6">
        {/* Background gradient */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 80% at 50% 100%, rgba(90,122,90,0.07) 0%, transparent 65%)",
          }}
        />

        <div className="max-w-2xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="mb-4"
          >
            <span className="font-sans text-xs tracking-[0.2em] uppercase text-charcoal/35">
              Join the waitlist
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.08 }}
            className="font-serif text-4xl md:text-5xl text-charcoal mb-4 leading-tight"
          >
            Stop searching.
            <br />
            Start attending.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="font-sans text-base text-charcoal/50 mb-10 leading-relaxed"
          >
            Early access is limited. Join the waitlist and we&apos;ll reach out
            when your spot is ready — no newsletters, just one email.
          </motion.p>

          {/* Email form */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            {submitted ? (
              <div className="flex flex-col items-center gap-3">
                {/* Breathing dot animation */}
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <motion.div
                    animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 rounded-full bg-sage/20"
                  />
                  <div className="w-3 h-3 rounded-full bg-sage" />
                </div>
                <p className="font-serif text-lg text-charcoal">
                  You&apos;re on the list.
                </p>
                <p className="font-sans text-sm text-charcoal/45">
                  We&apos;ll reach out when your spot opens up. Just breathe.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
              >
                <div
                  className={`flex-1 relative rounded-full border transition-all duration-300 ${
                    focused
                      ? "border-sage/40 shadow-sm shadow-sage/10"
                      : "border-charcoal/12"
                  }`}
                >
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    placeholder="your@email.com"
                    required
                    className="w-full h-12 px-5 bg-white/60 rounded-full font-sans text-sm text-charcoal placeholder:text-charcoal/30 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="h-12 px-7 bg-sage text-white font-sans text-sm rounded-full hover:bg-sage-dark transition-all duration-300 hover:shadow-lg hover:shadow-sage/20 hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap"
                >
                  Join waitlist
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>

      {/* Footer nav */}
      <div className="border-t border-charcoal/6 px-6 py-14">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <a
                href="/"
                className="font-serif text-xl text-charcoal tracking-tight hover:text-sage transition-colors duration-200 inline-block mb-3"
              >
                breathe
              </a>
              <p className="font-sans text-xs text-charcoal/35 leading-relaxed max-w-[160px]">
                Event discovery for people who value their time and their calm.
              </p>
            </div>

            {/* Links */}
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <p className="font-sans text-[10px] uppercase tracking-[0.15em] text-charcoal/30 mb-4">
                  {category}
                </p>
                <ul className="space-y-2.5">
                  {links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="font-sans text-sm text-charcoal/45 hover:text-charcoal/75 transition-colors duration-200"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-charcoal/5">
            <p className="font-sans text-xs text-charcoal/25">
              &copy; 2025 Breathe. All rights reserved.
            </p>
            <p className="font-sans text-xs text-charcoal/20 italic">
              just breathe.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
