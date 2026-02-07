import Link from "next/link";
import { Logo } from "@/components/logo";

export default function PrivacyPage() {
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

        <h1 className="text-3xl font-semibold mb-8">Privacy Policy</h1>

        <div className="prose prose-neutral dark:prose-invert prose-sm">
          <p className="text-muted-foreground mb-6">
            Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>

          <section className="mb-8">
            <h2 className="text-lg font-medium mb-3">Information We Collect</h2>
            <p className="text-muted-foreground mb-4">
              When you use StashFyle, we collect information necessary to provide our file storage service:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Account information (email address)</li>
              <li>Files you upload to our service</li>
              <li>Usage data (upload counts, storage usage)</li>
              <li>Payment information (processed securely by Stripe)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-medium mb-3">How We Use Your Information</h2>
            <p className="text-muted-foreground mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Provide and maintain our file storage service</li>
              <li>Process your payments and manage your subscription</li>
              <li>Send you service-related communications</li>
              <li>Improve and optimize our service</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-medium mb-3">Data Storage</h2>
            <p className="text-muted-foreground">
              Your files are stored securely using Cloudflare R2. We do not access or analyze the content of your files unless required by law or to investigate abuse of our service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-medium mb-3">Data Retention</h2>
            <p className="text-muted-foreground">
              We retain your files and account data for as long as your account is active. When you delete files or your account, we remove the associated data from our systems within 30 days.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-medium mb-3">Third-Party Services</h2>
            <p className="text-muted-foreground">
              We use the following third-party services to operate StashFyle:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-4">
              <li>Supabase (authentication and database)</li>
              <li>Cloudflare R2 (file storage)</li>
              <li>Stripe (payment processing)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-medium mb-3">Contact</h2>
            <p className="text-muted-foreground">
              If you have questions about this Privacy Policy, please contact us at privacy@stashfyle.com.
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
