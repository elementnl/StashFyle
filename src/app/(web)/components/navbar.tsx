"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Logo } from "@/components/logo";

interface NavbarProps {
  isLoggedIn: boolean;
}

export function Navbar({ isLoggedIn }: NavbarProps) {
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4"
    >
      <div className="flex items-center justify-between rounded-full border border-border bg-background/80 backdrop-blur-[6px] px-4 py-2">
        <Link href="/" className="flex items-center gap-1">
          <Logo className="size-7 text-primary" />
          <span
            className="text-3xl text-foreground"
            style={{ fontFamily: "'Road Rage', sans-serif" }}
          >
            StashFyle
          </span>
        </Link>
        <div className="flex items-center gap-1">
          <button
            onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}
            className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Pricing
          </button>
          <Link
            href="https://stashfyle.mintlify.app"
            target="_blank"
            className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Docs
          </Link>
          <div className="h-4 w-px bg-border mx-2" />
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="px-4 py-1.5 text-sm font-medium text-primary-foreground bg-primary rounded-full hover:bg-primary/90 transition-colors"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="px-4 py-1.5 text-sm font-medium text-primary-foreground bg-primary rounded-full hover:bg-primary/90 transition-colors"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
