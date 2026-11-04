import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/privacy")({
  head: () => seo("Privacy Policy", "How Asset Houses Realty collects, uses and protects your personal information."),
  component: () => (
    <>
      <PageHeader eyebrow="Legal" title="Privacy Policy" />
      <div className="container-x max-w-3xl space-y-4 py-16 text-muted-foreground">
        <p>We collect the information you provide when you create an account, send an inquiry, request a viewing or submit a property — such as your name, email, phone number and property details.</p>
        <p>We use this information only to respond to your requests, provide our real estate services and improve our website. We never sell your personal information.</p>
        <p>Your data is stored securely and access is restricted to authorized staff. You may request access to or deletion of your data at any time by contacting us.</p>
      </div>
    </>
  ),
});
