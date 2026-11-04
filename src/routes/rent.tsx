import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { ListingBrowser } from "@/components/site/ListingBrowser";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/rent")({
  staticData: { sitemap: true },
  head: () => seo("Rent a Property", "Find quality rental homes, apartments and condos with monthly pricing."),
  component: () => (
    <>
      <PageHeader eyebrow="Rent a property" title="Rental homes & apartments" text="Comfortable, well-managed rentals with clear monthly pricing." image="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=2000&q=80" />
      <ListingBrowser initial={{ listing: "rent" }} lockListing />
    </>
  ),
});
