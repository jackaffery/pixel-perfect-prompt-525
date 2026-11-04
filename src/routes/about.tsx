import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, Eye, Handshake, Heart, ShieldCheck, Target } from "lucide-react";
import { PageHeader, SectionHeading } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/about")({
  staticData: { sitemap: true },
  head: () => seo("About Us", "Our background, mission, vision and values at Asset Houses Realty."),
  component: About,
});

function About() {
  return (
    <>
      <PageHeader eyebrow="About us" title="Built on trust. Driven by home." text="Asset Houses Realty is a full-service real estate company helping people buy, sell, rent and invest with confidence." image="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=2000&q=80" />
      <section className="container-x grid gap-14 py-20 lg:grid-cols-2 lg:items-center">
        <div className="space-y-5">
          <SectionHeading eyebrow="Our story" title="An established partner in American real estate" />
          <p className="text-muted-foreground">From starter cottages to luxury villas, acreage to brand-new communities, our team brings local knowledge and honest guidance to every transaction. We believe a home is more than an asset — it's where your future is built.</p>
          <p className="text-muted-foreground">Our agents work across residential sales, rentals, land and new developments, offering one trusted point of contact for every stage of your property journey.</p>
        </div>
        <img src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1400&q=80" alt="Elegant home interior" className="aspect-[4/3] w-full rounded-md object-cover shadow-lift" loading="lazy" />
      </section>
      <section className="bg-secondary py-20">
        <div className="container-x grid gap-6 md:grid-cols-2">
          <div className="rounded-md bg-card p-8 shadow-soft"><Target className="h-8 w-8 text-sage" /><h3 className="mt-4 text-2xl font-semibold">Our Mission</h3><p className="mt-2 text-muted-foreground">To make buying, selling, renting and investing in property simple, transparent and rewarding for every client we serve.</p></div>
          <div className="rounded-md bg-card p-8 shadow-soft"><Eye className="h-8 w-8 text-sage" /><h3 className="mt-4 text-2xl font-semibold">Our Vision</h3><p className="mt-2 text-muted-foreground">To be America's most trusted name in home and land ownership — helping people find their place and build their future.</p></div>
        </div>
      </section>
      <section className="container-x py-20">
        <SectionHeading center eyebrow="Our values" title="What guides us" />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {[
            { i: Award, t: "Professional Service" }, { i: Handshake, t: "Property Transparency" },
            { i: Heart, t: "Customer Satisfaction" }, { i: ShieldCheck, t: "Secure Transactions" }, { i: Target, t: "Integrity" },
          ].map(({ i: I, t }) => (
            <div key={t} className="rounded-md border p-6 text-center"><I className="mx-auto h-8 w-8 text-primary" /><p className="mt-3 font-semibold">{t}</p></div>
          ))}
        </div>
        <div className="mt-14 text-center"><Button asChild size="lg"><Link to="/agents">Meet our agents</Link></Button></div>
      </section>
    </>
  );
}
