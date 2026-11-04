import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/terms")({
  staticData: { sitemap: true },
  head: () => seo("Terms & Conditions", "Terms and conditions for using the Asset Houses Realty website."),
  component: () => (
    <>
      <PageHeader eyebrow="Legal" title="Terms & Conditions" />
      <div className="container-x max-w-3xl space-y-4 py-16 text-muted-foreground">
        <p>Property information on this website is provided in good faith and may change without notice. Prices, availability and details should be confirmed with an agent.</p>
        <p>Listings marked as demonstration listings are examples and are not available for purchase or rent.</p>
        <p>By submitting a property, you confirm you have the right to list it and that the details provided are accurate.</p>
      </div>
    </>
  ),
});
