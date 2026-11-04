import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { categoriesQuery, propertiesQuery } from "@/lib/queries";
import { filterProperties, PRICE_RANGES, type Filters } from "@/lib/listing";
import { PropertyCard } from "./PropertyCard";

type Props = {
  initial?: Filters;
  lockListing?: boolean;
  section?: Filters["section"];
  showListingToggle?: boolean;
};

const num = (v: string) => (v === "" || v === "any" ? undefined : Number(v));

export function ListingBrowser({ initial = {}, lockListing, section, showListingToggle }: Props) {
  const { data = [], isLoading } = useQuery(propertiesQuery);
  const { data: cats = [] } = useQuery(categoriesQuery);
  const [f, setF] = useState<Filters>({ listing: "all", ...initial, section });
  const set = (patch: Partial<Filters>) => setF((s) => ({ ...s, ...patch }));
  const results = useMemo(() => filterProperties(data, f), [data, f]);
  const rangeValue =
    PRICE_RANGES.findIndex((r) => r.min === f.min && r.max === f.max).toString();

  return (
    <div className="container-x py-12">
      <div className="rounded-md border bg-card p-5 shadow-soft">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-primary-deep">
          <SlidersHorizontal className="h-4 w-4" /> Refine your search
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
          <Input
            className="xl:col-span-2"
            placeholder="City or location"
            value={f.q ?? ""}
            onChange={(e) => set({ q: e.target.value })}
          />
          {showListingToggle && !lockListing && (
            <Select value={f.listing ?? "all"} onValueChange={(v) => set({ listing: v as Filters["listing"] })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Sale or rent</SelectItem>
                <SelectItem value="sale">For sale</SelectItem>
                <SelectItem value="rent">For rent</SelectItem>
              </SelectContent>
            </Select>
          )}
          <Select value={f.category ?? "all"} onValueChange={(v) => set({ category: v })}>
            <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {cats.map((c) => <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          {f.listing !== "rent" && (
            <Select
              value={rangeValue === "-1" ? "any" : rangeValue}
              onValueChange={(v) => {
                const r = v === "any" ? undefined : PRICE_RANGES[Number(v)];
                set({ min: r?.min, max: r?.max });
              }}
            >
              <SelectTrigger><SelectValue placeholder="Price range" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any price</SelectItem>
                {PRICE_RANGES.map((r, i) => <SelectItem key={r.label} value={String(i)}>{r.label}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
          <Input type="number" placeholder="Min price" value={f.min ?? ""} onChange={(e) => set({ min: num(e.target.value) })} />
          <Input type="number" placeholder="Max price" value={f.max ?? ""} onChange={(e) => set({ max: num(e.target.value) })} />
          {section !== "land" && (
            <>
              <Select value={f.beds?.toString() ?? "any"} onValueChange={(v) => set({ beds: num(v) })}>
                <SelectTrigger><SelectValue placeholder="Beds" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any beds</SelectItem>
                  {[1, 2, 3, 4, 5].map((n) => <SelectItem key={n} value={String(n)}>{n}+ beds</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={f.baths?.toString() ?? "any"} onValueChange={(v) => set({ baths: num(v) })}>
                <SelectTrigger><SelectValue placeholder="Baths" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any baths</SelectItem>
                  {[1, 2, 3, 4].map((n) => <SelectItem key={n} value={String(n)}>{n}+ baths</SelectItem>)}
                </SelectContent>
              </Select>
            </>
          )}
          <Input type="number" placeholder="Min size (sq ft)" value={f.minSize ?? ""} onChange={(e) => set({ minSize: num(e.target.value) })} />
        </div>
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>{isLoading ? "Loading…" : `${results.length} ${results.length === 1 ? "property" : "properties"} found`}</span>
          <Button variant="link" size="sm" onClick={() => setF({ listing: initial.listing ?? "all", section })}>Clear filters</Button>
        </div>
      </div>

      <div className="mt-10 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((p) => <PropertyCard key={p.id} p={p} />)}
      </div>
      {!isLoading && results.length === 0 && (
        <p className="py-20 text-center text-muted-foreground">No properties match your search. Try widening your filters.</p>
      )}
    </div>
  );
}
