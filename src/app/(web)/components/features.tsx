"use client";

import { Zap, Globe, Code2 } from "lucide-react";
import { motion } from "motion/react";

export function Features() {
  return (
    <section className="py-20 px-6 bg-muted/30">
      <div className="max-w-4xl mx-auto">
        <div className="grid gap-6 sm:grid-cols-3">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: 0 }}
            whileHover={{ y: -4 }}
            className="relative group rounded-xl border border-border bg-background p-6 text-center transition-colors hover:border-primary/30"
          >
            <span className="absolute top-4 right-4 text-xs font-mono text-muted-foreground/50">01</span>
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-4 group-hover:bg-primary/15 transition-colors">
              <Code2 className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-sm font-medium mb-2">No SDK required</h3>
            <p className="text-sm text-muted-foreground">
              Works from curl, Python, Go, Ruby, PHP — setup in minutes.
            </p>
          </motion.div>
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ y: -4 }}
            className="relative group rounded-xl border border-border bg-background p-6 text-center transition-colors hover:border-primary/30"
          >
            <span className="absolute top-4 right-4 text-xs font-mono text-muted-foreground/50">02</span>
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-4 group-hover:bg-primary/15 transition-colors">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-sm font-medium mb-2">Fast global CDN</h3>
            <p className="text-sm text-muted-foreground">
              Files served from the edge. Fast everywhere, zero egress fees.
            </p>
          </motion.div>
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ y: -4 }}
            className="relative group rounded-xl border border-border bg-background p-6 text-center transition-colors hover:border-primary/30"
          >
            <span className="absolute top-4 right-4 text-xs font-mono text-muted-foreground/50">03</span>
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-4 group-hover:bg-primary/15 transition-colors">
              <Globe className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-sm font-medium mb-2">Simple pricing</h3>
            <p className="text-sm text-muted-foreground">
              Flat monthly tiers. No confusion, no surprise fees.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
