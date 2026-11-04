import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { PageHeader } from "@/components/site/PageHeader";
import { ListingBrowser } from "@/components/site/ListingBrowser";
import { seo } from "@/lib/seo";

const schema = z.object({
  q: z.string().optional(),
  listing: z.enum(["sale", "rent", "all"]).optional(),
  category: z.string().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  beds: z.number().optional(),
});

export const Route = createFileRoute("/search")({
  staticData: { sitemap: true },
  validateSearch: schema,
  head: () => seo("Search Properties", "Search homes, rentals, land and new developments by location, price, bedrooms and more."),
  component: SearchPage,
});

function SearchPage() {
  const s = Route.useSearch();
  return (
    <>
      <PageHeader eyebrow="Property search" title="Search all properties" text="Filter homes, rentals, land and developments to find the right fit." image="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=2000&q=80" />
      <ListingBrowser key={JSON.stringify(s)} initial={{ ...s, listing: s.listing ?? "all" }} showListingToggle />
    </>
  );
}
