import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { ListingBrowser } from "@/components/site/ListingBrowser";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/land")({
  staticData: { sitemap: true },
  head: () => seo("Land & Plots", "Acreage, plots and farmland for sale — build your future on land you own."),
  component: () => (
    <>
      <PageHeader eyebrow="Land & plots" title="Land for sale" text="Residential plots, acreage and farmland ready for building or investment." image="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=2000&q=80" />
      <ListingBrowser section="land" />
    </>
  ),
});
