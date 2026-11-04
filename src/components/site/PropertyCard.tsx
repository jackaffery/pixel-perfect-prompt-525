import { Link } from "@tanstack/react-router";
import { Bath, BedDouble, MapPin, Maximize } from "lucide-react";
import { formatPrice, formatSize, STATUS_LABEL, type Property } from "@/lib/listing";
import { FavoriteButton } from "./FavoriteButton";
import { cn } from "@/lib/utils";

export function PropertyCard({ p }: { p: Property }) {
  return (
    <article className="group overflow-hidden rounded-md border bg-card shadow-soft transition-all hover:-translate-y-1 hover:shadow-lift">
      <Link to="/property/$id" params={{ id: p.id }} className="relative block aspect-[4/3] overflow-hidden">
        <img
          src={p.images[0] ?? "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&q=80"}
          alt={p.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex gap-2">
          <span className={cn("rounded-sm px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-wider",
            p.status === "available" ? "bg-primary text-primary-foreground" : "bg-gold text-primary-deep")}>
            {STATUS_LABEL[p.status]}
          </span>
          <span className="rounded-sm bg-background/90 px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-wider text-primary-deep">
            {p.listing_type === "rent" ? "For rent" : "For sale"}
          </span>
        </div>
        {p.is_demo && (
          <span className="absolute bottom-3 left-3 rounded-sm bg-primary-deep/80 px-2 py-0.5 text-[0.65rem] text-primary-foreground">
            Demonstration listing
          </span>
        )}
      </Link>
      <div className="space-y-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-display text-2xl font-semibold text-primary">{formatPrice(p)}</p>
            <Link to="/property/$id" params={{ id: p.id }} className="mt-1 block font-semibold hover:text-primary">
              {p.title}
            </Link>
          </div>
          <FavoriteButton propertyId={p.id} />
        </div>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" /> {p.address}, {p.city}, {p.state}
        </p>
        <div className="flex flex-wrap gap-4 border-t pt-3 text-sm text-foreground/80">
          {p.category !== "land" && (
            <>
              <span className="flex items-center gap-1.5"><BedDouble className="h-4 w-4 text-sage" />{p.bedrooms} bd</span>
              <span className="flex items-center gap-1.5"><Bath className="h-4 w-4 text-sage" />{Number(p.bathrooms)} ba</span>
            </>
          )}
          <span className="flex items-center gap-1.5"><Maximize className="h-4 w-4 text-sage" />{formatSize(p)}</span>
        </div>
      </div>
    </article>
  );
}
