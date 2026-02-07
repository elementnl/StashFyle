"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Particles } from "@/components/ui/particles";

export function Hero() {
  const [showParticles, setShowParticles] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowParticles(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="pt-64 pb-40 px-6 relative h-[800px] overflow-hidden">
      {showParticles && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          <Particles
            className="h-full w-full"
            quantity={100}
            color="#344966"
            size={0.75}
            staticity={30}
            ease={50}
          />
        </motion.div>
      )}
      <div className="max-w-xl mx-auto text-center relative">
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="text-5xl font-semibold tracking-tight text-foreground sm:text-6xl"
        >
          The{" "}

          <span
            className="text-[86px] -tracking-normal font-light text-primary"
            style={{ fontFamily: "'Road Rage', sans-serif" }}
          >
            no-nonsense
          </span>
         {" "}
          API for file uploads
        </motion.h1>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto"
        >
          POST a file, get a URL. Works with any language, any framework, no bullsh*t.
        </motion.p>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          className="mt-8 flex items-center justify-center gap-3"
        >
          <Button asChild size="lg">
            <Link href="/signup">
              Get started free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="https://stashfyle.mintlify.app" target="_blank">
              Browse docs
            </Link>
          </Button>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="h-6 w-6 text-muted-foreground" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
