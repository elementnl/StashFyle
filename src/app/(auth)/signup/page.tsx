"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createBrowserSupabaseClient } from "@/lib/auth/browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Logo } from "@/components/logo";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!agreedToTerms) {
      setError("Please agree to the Terms of Service to continue");
      return;
    }

    setLoading(true);

    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center p-6 bg-white overflow-hidden">
      <AnimatedGridPattern
        numSquares={30}
        maxOpacity={0.1}
        duration={3}
        repeatDelay={1}
        className="mask-[radial-gradient(700px_circle_at_center,white,transparent)] inset-x-0 inset-y-[-30%] h-[200%] skew-y-12 fill-primary/30 stroke-primary/30"
      />
      <div className="relative flex w-full max-w-4xl overflow-hidden rounded-xl border border-border bg-background">
        {/* Left Panel - Illustration */}
        <div className="hidden md:flex md:w-1/2 bg-slate-50 items-center justify-center p-8">
          <div className="max-w-xs">
            <AuthIllustration />
            <div className="mt-6 text-center">
              <h2 className="text-base font-medium text-foreground">
                File uploads, simplified
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                POST a file, get a URL. No complicated setup.
              </p>
            </div>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="flex w-full md:w-1/2 flex-col justify-center p-8">
          <Link href="/" className="inline-flex items-center gap-1 mb-6">
            <Logo className="size-6 text-primary" />
            <span
              className="text-2xl text-foreground"
              style={{ fontFamily: "'Road Rage', sans-serif" }}
            >
              StashFyle
            </span>
          </Link>

          <h1 className="text-lg font-medium text-foreground">
            Create an account
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Get started with StashFyle for free
          </p>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name" className="text-xs font-medium">
                Name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="text-sm h-9"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email" className="text-xs font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="text-sm h-9"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password" className="text-xs font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="text-sm h-9"
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) =>
                  setAgreedToTerms(checked === true)
                }
              />
              <label htmlFor="terms" className="text-xs text-muted-foreground">
                I agree to the{" "}
                <Link href="/terms" target="_blank" className="text-primary underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" target="_blank" className="text-primary underline">
                  Privacy Policy
                </Link>
              </label>
            </div>

            {error && <p className="text-xs text-destructive">{error}</p>}

            <Button
              type="submit"
              disabled={loading}
              className="w-full text-sm h-9"
            >
              {loading ? "Creating account..." : "Create account"}
            </Button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-background px-2 text-muted-foreground">
                or
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full text-sm h-9"
            type="button"
          >
            <svg
              className="mr-2 h-4 w-4"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            Continue with GitHub
          </Button>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function AuthIllustration() {
  return (
    <svg
      viewBox="0 0 300 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto"
    >
      {/* Background cloud/storage shape */}
      <ellipse
        cx="150"
        cy="140"
        rx="100"
        ry="60"
        fill="#344966"
        fillOpacity="0.08"
      />

      {/* Main file stack - three files offset */}
      <g>
        {/* Back file */}
        <rect
          x="90"
          y="55"
          width="80"
          height="105"
          rx="6"
          fill="#344966"
          fillOpacity="0.2"
        />
        <rect
          x="102"
          y="70"
          width="40"
          height="3"
          rx="1.5"
          fill="#344966"
          fillOpacity="0.3"
        />
        <rect
          x="102"
          y="80"
          width="56"
          height="3"
          rx="1.5"
          fill="#344966"
          fillOpacity="0.3"
        />
        <rect
          x="102"
          y="90"
          width="32"
          height="3"
          rx="1.5"
          fill="#344966"
          fillOpacity="0.3"
        />

        {/* Middle file */}
        <rect
          x="105"
          y="43"
          width="80"
          height="105"
          rx="6"
          fill="#344966"
          fillOpacity="0.4"
        />
        <rect
          x="117"
          y="58"
          width="40"
          height="3"
          rx="1.5"
          fill="#344966"
          fillOpacity="0.5"
        />
        <rect
          x="117"
          y="68"
          width="56"
          height="3"
          rx="1.5"
          fill="#344966"
          fillOpacity="0.5"
        />
        <rect
          x="117"
          y="78"
          width="32"
          height="3"
          rx="1.5"
          fill="#344966"
          fillOpacity="0.5"
        />

        {/* Front file */}
        <rect
          x="120"
          y="30"
          width="80"
          height="105"
          rx="6"
          fill="#344966"
          fillOpacity="0.7"
        />
        <rect
          x="132"
          y="45"
          width="40"
          height="3"
          rx="1.5"
          fill="white"
          fillOpacity="0.6"
        />
        <rect
          x="132"
          y="55"
          width="56"
          height="3"
          rx="1.5"
          fill="white"
          fillOpacity="0.6"
        />
        <rect
          x="132"
          y="65"
          width="32"
          height="3"
          rx="1.5"
          fill="white"
          fillOpacity="0.6"
        />
      </g>

      {/* Upload arrow */}
      <g>
        <circle cx="235" cy="70" r="22" fill="#344966" fillOpacity="0.15" />
        <path
          d="M235 58L235 82M235 58L227 66M235 58L243 66"
          stroke="#344966"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {/* URL/link indicator */}
      <g>
        <rect
          x="55"
          y="160"
          width="190"
          height="28"
          rx="14"
          fill="#344966"
          fillOpacity="0.1"
        />
        <circle cx="75" cy="174" r="8" fill="#344966" fillOpacity="0.3" />
        <rect
          x="90"
          y="171"
          width="60"
          height="6"
          rx="3"
          fill="#344966"
          fillOpacity="0.25"
        />
        <rect
          x="158"
          y="171"
          width="30"
          height="6"
          rx="3"
          fill="#344966"
          fillOpacity="0.25"
        />
      </g>

      {/* Decorative dots */}
      <circle cx="40" cy="70" r="3" fill="#344966" fillOpacity="0.2" />
      <circle cx="52" cy="100" r="2" fill="#344966" fillOpacity="0.15" />
      <circle cx="260" cy="130" r="4" fill="#344966" fillOpacity="0.2" />
    </svg>
  );
}
