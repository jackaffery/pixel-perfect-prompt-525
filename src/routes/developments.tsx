import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { ListingBrowser } from "@/components/site/ListingBrowser";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/developments")({
  staticData: { sitemap: true },
  head: () => seo("New Developments", "Newly built homes and master-planned communities with builder warranties."),
  component: () => (
    <>
      <PageHeader eyebrow="New developments" title="Newly built homes" text="Brand-new, energy-efficient homes in thoughtfully planned communities." image="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=2000&q=80" />
      <ListingBrowser section="development" />
    </>
  ),
});
