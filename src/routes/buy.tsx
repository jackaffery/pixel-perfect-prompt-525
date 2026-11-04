import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { ListingBrowser } from "@/components/site/ListingBrowser";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/buy")({
  head: () => seo("Buy a Home", "Browse houses, condos and villas for sale, from $40,000 and above."),
  component: () => (
    <>
      <PageHeader eyebrow="Buy a home" title="Homes for sale" text="Houses, townhomes, condos and villas — with prices from $40,000 and above." image="https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=2000&q=80" />
      <ListingBrowser initial={{ listing: "sale" }} lockListing section="standard" />
    </>
  ),
});
