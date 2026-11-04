import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowRight, Award, Eye, Handshake, Search, ShieldCheck, Smile, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PropertyCard } from "@/components/site/PropertyCard";
import { SectionHeading } from "@/components/site/PageHeader";
import { categoriesQuery, propertiesQuery, settingsQuery } from "@/lib/queries";
import { PRICE_RANGES } from "@/lib/listing";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () => seo("Find a Place to Call Home", "Discover beautiful homes, land and investment properties for sale and rent with Asset Houses Realty."),
  component: Home,
});

export const TESTIMONIALS = [
  { name: "Jennifer & Mark T.", place: "Austin, TX", text: "Asset Houses Realty made buying our first home stress-free. Clear pricing, honest advice and quick answers every step of the way." },
  { name: "Robert L.", place: "Dallas, TX", text: "Sold my townhome above asking within three weeks. The team handled everything professionally." },
  { name: "Angela P.", place: "Houston, TX", text: "Found a beautiful rental for my family in days. Viewing scheduling was simple and the agent was wonderful." },
];

function HeroSearch() {
  const navigate = useNavigate();
  const { data: cats = [] } = useQuery(categoriesQuery);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");
  const [range, setRange] = useState("any");
  const [beds, setBeds] = useState("any");
  const go = () => {
    const r = range === "any" ? undefined : PRICE_RANGES[Number(range)];
    navigate({
      to: "/search",
      search: {
        q: q || undefined,
        category: category === "all" ? undefined : category,
        min: r?.min,
        max: r?.max,
        beds: beds === "any" ? undefined : Number(beds),
      },
    });
  };
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); go(); }}
      className="fade-up grid gap-2 rounded-md bg-background p-3 shadow-lift sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_0.8fr_auto]"
    >
      <Input placeholder="City, state or address" value={q} onChange={(e) => setQ(e.target.value)} className="h-12 border-0 bg-muted" />
      <Select value={category} onValueChange={setCategory}>
        <SelectTrigger className="!h-12 w-full border-0 bg-muted"><SelectValue placeholder="Property type" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Any property type</SelectItem>
          {cats.map((c) => <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={range} onValueChange={setRange}>
        <SelectTrigger className="!h-12 w-full border-0 bg-muted"><SelectValue placeholder="Price range" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="any">Any price</SelectItem>
          {PRICE_RANGES.map((r, i) => <SelectItem key={r.label} value={String(i)}>{r.label}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={beds} onValueChange={setBeds}>
        <SelectTrigger className="!h-12 w-full border-0 bg-muted"><SelectValue placeholder="Bedrooms" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="any">Any beds</SelectItem>
          {[1, 2, 3, 4, 5].map((n) => <SelectItem key={n} value={String(n)}>{n}+ beds</SelectItem>)}
        </SelectContent>
      </Select>
      <Button type="submit" size="lg" className="h-12"><Search /> Search</Button>
    </form>
  );
}

function Home() {
  const { data: s } = useQuery(settingsQuery);
  const { data: props = [] } = useQuery(propertiesQuery);
  const featured = props.filter((p) => p.featured).slice(0, 6);

  return (
    <>
      <section className="relative isolate min-h-[88vh] overflow-hidden text-primary-foreground">
        <img
          src={s?.hero_image ?? "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=2000&q=80"}
          alt="Beautiful suburban American home"
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-hero-overlay" />
        <div className="container-x flex min-h-[88vh] flex-col justify-center gap-8 py-20">
          <p className="eyebrow fade-up !text-primary-foreground/80">Asset Houses Realty · Find your place. Build your future.</p>
          <h1 className="fade-up max-w-4xl text-5xl font-semibold leading-[1.05] md:text-7xl">
            {s?.hero_headline ?? "FIND A PLACE TO CALL HOME."}
          </h1>
          <p className="fade-up max-w-2xl text-lg text-primary-foreground/85">{s?.hero_subtext}</p>
          <div className="fade-up flex flex-wrap gap-3">
            <Button asChild size="lg" variant="hero"><Link to="/search">Browse Properties</Link></Button>
            <Button asChild size="lg" variant="heroOutline"><Link to="/buy">Explore Homes</Link></Button>
            <Button asChild size="lg" variant="gold"><Link to="/sell">List Your Property</Link></Button>
          </div>
          <div className="max-w-5xl"><HeroSearch /></div>
        </div>
      </section>

      <section className="container-x py-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow="Featured listings" title="Homes our clients love" text="A hand-picked selection of available homes, rentals and land. Sale prices start from $40,000." />
          <Button asChild variant="outline"><Link to="/search">View all properties <ArrowRight /></Link></Button>
        </div>
        <div className="mt-12 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => <PropertyCard key={p.id} p={p} />)}
        </div>
      </section>

      <section className="bg-secondary py-24">
        <div className="container-x">
          <SectionHeading center eyebrow="Shop by budget" title="Properties for every price range" />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {PRICE_RANGES.map((r) => (
              <Link
                key={r.label}
                to="/search"
                search={{ listing: "sale", min: r.min, max: r.max }}
                className="rounded-md border bg-card p-6 text-center shadow-soft transition-all hover:-translate-y-1 hover:border-primary"
              >
                <p className="font-display text-xl font-semibold text-primary">{r.label}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {props.filter((p) => p.listing_type === "sale" && Number(p.price) >= r.min && (r.max == null || Number(p.price) <= r.max)).length} listings
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="container-x grid gap-14 py-24 lg:grid-cols-2 lg:items-center">
        <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1400&q=80" alt="Modern family home" className="aspect-[4/3] w-full rounded-md object-cover shadow-lift" loading="lazy" />
        <div className="space-y-8">
          <SectionHeading eyebrow="Who we are" title="An established partner for your property journey" text="Asset Houses Realty connects buyers, sellers, renters and investors with homes and land they can trust." />
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="flex gap-3"><Target className="h-6 w-6 shrink-0 text-sage" /><div><p className="font-semibold">Our Mission</p><p className="text-sm text-muted-foreground">To make buying, selling and renting property simple, transparent and rewarding.</p></div></div>
            <div className="flex gap-3"><Eye className="h-6 w-6 shrink-0 text-sage" /><div><p className="font-semibold">Our Vision</p><p className="text-sm text-muted-foreground">To be America's most trusted name in home and land ownership.</p></div></div>
          </div>
          <Button asChild><Link to="/about">Learn about us <ArrowRight /></Link></Button>
        </div>
      </section>

      <section className="bg-primary-deep py-24 text-primary-foreground">
        <div className="container-x">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow !text-gold">Why choose us</p>
            <h2 className="mt-3 text-3xl font-semibold md:text-4xl">Why Choose Asset Houses Realty?</h2>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { i: Award, t: "Professional Service", d: "Licensed, experienced agents who put your goals first." },
              { i: Handshake, t: "Property Transparency", d: "Clear pricing, honest descriptions and no hidden surprises." },
              { i: Smile, t: "Customer Satisfaction", d: "Personal guidance from first viewing to closing day." },
              { i: ShieldCheck, t: "Secure Transactions", d: "Verified listings and protected, well-documented deals." },
            ].map(({ i: I, t, d }) => (
              <div key={t} className="rounded-md border border-primary-foreground/15 p-7">
                <I className="h-8 w-8 text-gold" />
                <p className="mt-5 font-display text-xl">{t}</p>
                <p className="mt-2 text-sm text-primary-foreground/70">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-x py-24">
        <SectionHeading center eyebrow="Client reviews" title="What our clients say" text="Sample testimonials shown until genuine client reviews are added." />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure key={t.name} className="rounded-md border bg-card p-7 shadow-soft">
              <p className="font-display text-4xl leading-none text-sage">“</p>
              <blockquote className="mt-2 text-foreground/85">{t.text}</blockquote>
              <figcaption className="mt-5 text-sm"><span className="font-semibold">{t.name}</span> · <span className="text-muted-foreground">{t.place}</span> <span className="ml-1 rounded-sm bg-muted px-1.5 py-0.5 text-[0.65rem] uppercase tracking-wider text-muted-foreground">Sample</span></figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="container-x pb-24">
        <div className="flex flex-col items-start justify-between gap-6 rounded-md bg-primary p-10 text-primary-foreground md:flex-row md:items-center md:p-14">
          <div>
            <h2 className="text-3xl font-semibold">Ready to sell or list your property?</h2>
            <p className="mt-2 text-primary-foreground/80">Submit your property and our team will review it within 48 hours.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="hero" size="lg"><Link to="/sell">List Your Property</Link></Button>
            <Button asChild variant="heroOutline" size="lg"><Link to="/contact">Talk to an agent</Link></Button>
          </div>
        </div>
      </section>
    </>
  );
}
