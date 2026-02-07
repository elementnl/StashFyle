"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { motion } from "motion/react";
import { CountingNumber } from "@/components/animate-ui/primitives/texts/counting-number";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Free",
    description: "For trying things out",
    price: { monthly: 0, yearly: 0 },
    features: ["1 GB storage", "10 MB max file size", "1,000 uploads/month", "2 API keys"],
    cta: "Get started",
    highlighted: false,
  },
  {
    name: "Hobby",
    description: "For side projects",
    price: { monthly: 9, yearly: 90 },
    features: ["10 GB storage", "100 MB max file size", "50,000 uploads/month", "10 API keys"],
    cta: "Get started",
    highlighted: true,
  },
  {
    name: "Pro",
    description: "For production apps",
    price: { monthly: 29, yearly: 264 },
    features: ["100 GB storage", "500 MB max file size", "500,000 uploads/month", "Unlimited API keys"],
    cta: "Get started",
    highlighted: false,
  },
];

export function Pricing() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section id="pricing" className="py-20 px-6 scroll-mt-24">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl font-semibold tracking-tight">Pricing</h2>
          <p className="mt-2 text-sm text-muted-foreground">Start free, upgrade when you need more</p>

          <div className="flex items-center justify-center mt-6">
            <div className="relative grid grid-cols-2 rounded-full border border-border p-1 w-[200px]">
              <motion.div
                className="absolute inset-y-1 w-[calc(50%-4px)] rounded-full bg-primary"
                initial={false}
                animate={{ left: isYearly ? "calc(50%)" : 4 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
              <button
                onClick={() => setIsYearly(false)}
                className={`relative z-10 rounded-full py-1.5 text-sm font-medium text-center transition-colors ${
                  !isYearly ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setIsYearly(true)}
                className={`relative z-10 rounded-full py-1.5 text-sm font-medium text-center transition-colors ${
                  isYearly ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Yearly
              </button>
            </div>
          </div>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -4 }}
              className={`relative rounded-xl border p-6 transition-colors ${
                plan.highlighted
                  ? "border-primary bg-primary/5 hover:border-primary"
                  : "border-border bg-background hover:border-primary/30"
              }`}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                  Popular
                </span>
              )}

              <div className="mb-4">
                <h3 className="text-lg font-medium">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-semibold">
                    $<CountingNumber
                      number={isYearly ? plan.price.yearly / 12 : plan.price.monthly}
                      decimalPlaces={2}
                      transition={{ stiffness: 100, damping: 20 }}
                    />
                  </span>
                  {plan.price.monthly > 0 && (
                    <span className="text-muted-foreground">/mo</span>
                  )}
                  {isYearly && plan.price.yearly > 0 && (
                    <span className="text-xs text-muted-foreground">
                      (${plan.price.yearly} billed yearly)
                    </span>
                  )}
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                asChild
                variant={plan.highlighted ? "default" : "outline"}
                className="w-full"
              >
                <Link href="/signup">{plan.cta}</Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
