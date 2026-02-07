import Link from "next/link";
import { Logo } from "@/components/logo";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <Link href="/" className="inline-flex items-center gap-1 mb-12">
          <Logo className="size-6 text-primary" />
          <span
            className="text-2xl text-foreground"
            style={{ fontFamily: "'Road Rage', sans-serif" }}
          >
            StashFyle
          </span>
        </Link>

        <h1 className="text-3xl font-semibold mb-8">Terms of Service</h1>

        <div className="prose prose-neutral dark:prose-invert prose-sm">
          <p className="text-muted-foreground mb-6">
            Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>

          <section className="mb-8">
            <h2 className="text-lg font-medium mb-3">Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By accessing or using StashFyle, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-medium mb-3">Service Description</h2>
            <p className="text-muted-foreground">
              StashFyle provides a file upload and storage API service. You can upload files via our API and receive URLs to access those files. We provide different tiers of service with varying storage limits and features.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-medium mb-3">Acceptable Use</h2>
            <p className="text-muted-foreground mb-4">
              You agree not to use StashFyle to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Upload illegal content or content that violates third-party rights</li>
              <li>Distribute malware or harmful software</li>
              <li>Abuse or overload our systems</li>
              <li>Circumvent usage limits or access controls</li>
              <li>Resell access to our service without authorization</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-medium mb-3">Account Responsibilities</h2>
            <p className="text-muted-foreground">
              You are responsible for maintaining the security of your account and API keys. You are responsible for all activity that occurs under your account. Notify us immediately if you suspect unauthorized access.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-medium mb-3">Payment and Billing</h2>
            <p className="text-muted-foreground">
              Paid subscriptions are billed in advance on a monthly or yearly basis. You can cancel your subscription at any time, and you will retain access until the end of your billing period. Refunds are provided at our discretion.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-medium mb-3">Service Availability</h2>
            <p className="text-muted-foreground">
              We strive to maintain high availability but do not guarantee uninterrupted service. We may perform maintenance or updates that temporarily affect availability. We are not liable for any damages resulting from service interruptions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-medium mb-3">Termination</h2>
            <p className="text-muted-foreground">
              We reserve the right to suspend or terminate your account if you violate these terms. You may delete your account at any time. Upon termination, your files will be deleted within 30 days.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-medium mb-3">Limitation of Liability</h2>
            <p className="text-muted-foreground">
              StashFyle is provided &quot;as is&quot; without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-medium mb-3">Changes to Terms</h2>
            <p className="text-muted-foreground">
              We may update these terms from time to time. We will notify you of significant changes via email or through our service. Continued use after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-medium mb-3">Contact</h2>
            <p className="text-muted-foreground">
              If you have questions about these Terms of Service, please contact us at legal@stashfyle.com.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
