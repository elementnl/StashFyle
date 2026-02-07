"use client";

import { SmoothScrollProvider } from "@/components/smooth-scroll";
import { Navbar } from "./components/navbar";
import { Hero } from "./components/hero";
import { Showcase } from "./components/showcase";
import { Features } from "./components/features";
import { Pricing } from "./components/pricing";
import { CTA } from "./components/cta";
import { Footer } from "./components/footer";

interface LandingClientProps {
  isLoggedIn: boolean;
}

export function LandingClient({ isLoggedIn }: LandingClientProps) {
  return (
    <SmoothScrollProvider>
      <div className="min-h-screen bg-background">
        <Navbar isLoggedIn={isLoggedIn} />
        <Hero />
        <Showcase />
        <Features />
        <Pricing />
        <CTA />
        <Footer />
      </div>
    </SmoothScrollProvider>
  );
}
