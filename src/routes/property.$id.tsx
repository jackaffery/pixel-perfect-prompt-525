import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Bath, BedDouble, Check, Mail, MapPin, Maximize, Phone, Tag } from "lucide-react";
import { agentsQuery, propertiesQuery } from "@/lib/queries";
import { formatPrice, formatSize, STATUS_LABEL } from "@/lib/listing";
import { InquiryForm, ViewingForm } from "@/components/site/Forms";
import { FavoriteButton } from "@/components/site/FavoriteButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { seo } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/property/$id")({
  staticData: { sitemap: false },
  head: () => seo("Property Details", "View photos, pricing, specifications and schedule a viewing for this property."),
  component: PropertyPage,
});

function PropertyPage() {
  const { id } = Route.useParams();
  const { data: props, isLoading } = useQuery(propertiesQuery);
  const { data: agents = [] } = useQuery(agentsQuery);
  const [active, setActive] = useState(0);
  const p = props?.find((x) => x.id === id);
  const agent = agents.find((a) => a.id === p?.agent_id);

  if (isLoading) return <div className="container-x py-32 text-center text-muted-foreground">Loading property…</div>;
  if (!p)
    return (
      <div className="container-x py-32 text-center">
        <h1 className="text-3xl font-semibold">Property not found</h1>
        <Link to="/search" className="mt-4 inline-block text-primary underline">Back to search</Link>
      </div>
    );

  const imgs = p.images.length ? p.images : ["https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1600&q=80"];
  const d = 0.02;

  return (
    <div className="container-x py-10">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-primary">Home</Link> / <Link to={p.listing_type === "rent" ? "/rent" : "/buy"} className="hover:text-primary">{p.listing_type === "rent" ? "Rent" : "Buy"}</Link> / <span className="text-foreground">{p.title}</span>
      </nav>

      <div className="grid gap-3 lg:grid-cols-[3fr_1fr]">
        <div className="overflow-hidden rounded-md">
          <img src={imgs[active]} alt={p.title} className="aspect-[16/10] w-full object-cover" />
        </div>
        <div className="grid grid-cols-4 gap-3 lg:grid-cols-1 lg:content-start">
          {imgs.map((src, i) => (
            <button key={src + i} onClick={() => setActive(i)} className={cn("overflow-hidden rounded-md border-2", i === active ? "border-primary" : "border-transparent")}>
              <img src={src} alt={`${p.title} photo ${i + 1}`} className="aspect-[4/3] w-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_400px]">
        <div className="space-y-10">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-sm bg-primary px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-primary-foreground">{STATUS_LABEL[p.status]}</span>
              <span className="rounded-sm bg-accent px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-accent-foreground">{p.listing_type === "rent" ? "For rent" : "For sale"}</span>
              {p.is_demo && <span className="rounded-sm border px-2.5 py-1 text-xs text-muted-foreground">Demonstration listing</span>}
            </div>
            <div className="mt-4 flex items-start justify-between gap-4">
              <div>
                <h1 className="text-4xl font-semibold text-primary-deep">{p.title}</h1>
                <p className="mt-2 flex items-center gap-1.5 text-muted-foreground"><MapPin className="h-4 w-4" />{p.address}, {p.city}, {p.state}</p>
              </div>
              <FavoriteButton propertyId={p.id} />
            </div>
            <p className="mt-5 font-display text-4xl font-semibold text-primary">{formatPrice(p)}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 rounded-md border bg-card p-6 sm:grid-cols-4">
            {[
              { i: BedDouble, l: "Bedrooms", v: p.bedrooms },
              { i: Bath, l: "Bathrooms", v: Number(p.bathrooms) },
              { i: Maximize, l: "Size", v: formatSize(p) },
              { i: Tag, l: "Type", v: p.category.charAt(0).toUpperCase() + p.category.slice(1) },
            ].map(({ i: I, l, v }) => (
              <div key={l}><I className="h-5 w-5 text-sage" /><p className="mt-2 text-xs uppercase tracking-wider text-muted-foreground">{l}</p><p className="font-semibold">{v}</p></div>
            ))}
          </div>

          <section>
            <h2 className="text-2xl font-semibold text-primary-deep">Description</h2>
            <p className="mt-3 leading-relaxed text-foreground/85">{p.description}</p>
          </section>

          {p.features.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold text-primary-deep">Features & amenities</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {p.features.map((f) => <li key={f} className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" />{f}</li>)}
              </ul>
            </section>
          )}

          {p.lat != null && p.lng != null && (
            <section>
              <h2 className="text-2xl font-semibold text-primary-deep">Location</h2>
              <iframe
                title="Property location map"
                className="mt-4 h-80 w-full rounded-md border"
                loading="lazy"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${p.lng - d}%2C${p.lat - d}%2C${p.lng + d}%2C${p.lat + d}&layer=mapnik&marker=${p.lat}%2C${p.lng}`}
              />
            </section>
          )}
        </div>

        <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
          {agent && (
            <div className="flex gap-4 rounded-md border bg-card p-5">
              <img src={agent.photo_url ?? ""} alt={agent.name} className="h-16 w-16 rounded-full object-cover" />
              <div className="text-sm">
                <p className="font-semibold">{agent.name}</p>
                <p className="text-muted-foreground">{agent.title}</p>
                <a href={`tel:${agent.phone}`} className="mt-1 flex items-center gap-1.5 text-primary"><Phone className="h-3.5 w-3.5" />{agent.phone}</a>
                <a href={`mailto:${agent.email}`} className="flex items-center gap-1.5 text-primary"><Mail className="h-3.5 w-3.5" />{agent.email}</a>
              </div>
            </div>
          )}
          <div className="rounded-md border bg-card p-6 shadow-soft">
            <Tabs defaultValue="contact">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="contact">Contact agent</TabsTrigger>
                <TabsTrigger value="viewing">Schedule viewing</TabsTrigger>
              </TabsList>
              <TabsContent value="contact" className="pt-4">
                <InquiryForm kind="property" propertyId={p.id} defaultMessage={`I'm interested in ${p.title} (${p.address}). Please send me more information.`} />
              </TabsContent>
              <TabsContent value="viewing" className="pt-4">
                <ViewingForm propertyId={p.id} />
              </TabsContent>
            </Tabs>
          </div>
        </aside>
      </div>
    </div>
  );
}
