import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Mail, Phone } from "lucide-react";
import { PageHeader } from "@/components/site/PageHeader";
import { agentsQuery } from "@/lib/queries";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/agents")({
  staticData: { sitemap: true },
  head: () => seo("Our Agents", "Meet the professional real estate agents of Asset Houses Realty."),
  component: Agents,
});

function Agents() {
  const { data = [] } = useQuery(agentsQuery);
  return (
    <>
      <PageHeader eyebrow="Our agents" title="Experienced people, local expertise" text="Reach out directly to the agent who best fits your needs." />
      <div className="container-x grid gap-7 py-16 sm:grid-cols-2 lg:grid-cols-4">
        {data.map((a) => (
          <article key={a.id} className="overflow-hidden rounded-md border bg-card shadow-soft">
            <img src={a.photo_url ?? ""} alt={a.name} className="aspect-square w-full object-cover" loading="lazy" />
            <div className="space-y-2 p-5">
              <h2 className="text-xl font-semibold">{a.name}</h2>
              <p className="eyebrow">{a.title}</p>
              <p className="text-sm text-muted-foreground">{a.bio}</p>
              <a href={`tel:${a.phone}`} className="flex items-center gap-2 pt-2 text-sm text-primary"><Phone className="h-4 w-4" />{a.phone}</a>
              <a href={`mailto:${a.email}`} className="flex items-center gap-2 text-sm text-primary"><Mail className="h-4 w-4" />{a.email}</a>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
