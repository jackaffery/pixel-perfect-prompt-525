import type { Database } from "@/integrations/supabase/types";

export type Property = Database["public"]["Tables"]["properties"]["Row"];
export type Agent = Database["public"]["Tables"]["agents"]["Row"];

export const MIN_SALE_PRICE = 40000;

export const PRICE_RANGES = [
  { label: "$40,000 – $75,000", min: 40000, max: 75000 },
  { label: "$75,000 – $150,000", min: 75000, max: 150000 },
  { label: "$150,000 – $300,000", min: 150000, max: 300000 },
  { label: "$300,000 – $500,000", min: 300000, max: 500000 },
  { label: "$500,000 and above", min: 500000, max: undefined },
] as const;

export function isValidPrice(listingType: string, price: number) {
  if (!Number.isFinite(price) || price <= 0) return false;
  if (listingType === "sale" && price < MIN_SALE_PRICE) return false;
  return true;
}

export function formatPrice(p: Pick<Property, "price" | "listing_type">) {
  const s = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(p.price));
  return p.listing_type === "rent" ? `${s}/mo` : s;
}

export function formatSize(p: Pick<Property, "size_sqft" | "category">) {
  if (p.category === "land" && p.size_sqft >= 43560)
    return `${(p.size_sqft / 43560).toFixed(1)} acres`;
  return `${p.size_sqft.toLocaleString("en-US")} sq ft`;
}

export type Filters = {
  q?: string | undefined;
  listing?: "sale" | "rent" | "all" | undefined;
  section?: "standard" | "land" | "development" | undefined;
  category?: string | undefined;
  min?: number | undefined;
  max?: number | undefined;
  beds?: number | undefined;
  baths?: number | undefined;
  minSize?: number | undefined;
};

export function filterProperties(list: Property[], f: Filters) {
  const q = f.q?.trim().toLowerCase();
  return list.filter((p) => {
    if (q && !`${p.city} ${p.state} ${p.address} ${p.title}`.toLowerCase().includes(q)) return false;
    if (f.listing && f.listing !== "all" && p.listing_type !== f.listing) return false;
    if (f.section && p.section !== f.section) return false;
    if (f.category && f.category !== "all" && p.category !== f.category) return false;
    const price = Number(p.price);
    if (f.min != null && price < f.min) return false;
    if (f.max != null && price > f.max) return false;
    if (f.beds != null && p.bedrooms < f.beds) return false;
    if (f.baths != null && Number(p.bathrooms) < f.baths) return false;
    if (f.minSize != null && p.size_sqft < f.minSize) return false;
    return true;
  });
}

export const STATUS_LABEL: Record<string, string> = {
  available: "Available",
  sold: "Sold",
  rented: "Rented",
  pending: "Pending",
};
