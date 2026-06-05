import Hero from "@/components/sections/Hero";
import Problem from "@/components/sections/Problem";
import Solution from "@/components/sections/Solution";
import HowItWorks from "@/components/sections/HowItWorks";
import DataViz from "@/components/sections/DataViz";
import Testimonials from "@/components/sections/Testimonials";
import Pricing from "@/components/sections/Pricing";
import FooterCTA from "@/components/sections/FooterCTA";

export default function Home() {
  return (
    <main className="min-h-screen bg-paper">
      <Hero />
      <Problem />
      <Solution />
      <HowItWorks />
      <DataViz />
      <Testimonials />
      <Pricing />
      <FooterCTA />
    </main>
  );
}
