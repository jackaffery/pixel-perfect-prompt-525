import { describe, expect, it } from "vitest";
import { filterProperties, isValidPrice, type Property } from "@/lib/listing";

const base = {
  city: "Rockford", state: "IL", address: "1 A St", title: "Home", listing_type: "sale",
  section: "standard", category: "house", price: 100000, bedrooms: 3, bathrooms: 2, size_sqft: 1500,
} as unknown as Property;

describe("pricing rules", () => {
  it("rejects sale prices below $40,000", () => {
    expect(isValidPrice("sale", 39999)).toBe(false);
  });
  it("accepts a sale price of exactly $40,000", () => {
    expect(isValidPrice("sale", 40000)).toBe(true);
  });
  it("allows monthly rent below $40,000", () => {
    expect(isValidPrice("rent", 1800)).toBe(true);
  });
});

describe("search filters", () => {
  const list = [
    base,
    { ...base, city: "Dallas", price: 300000, bedrooms: 5 },
    { ...base, listing_type: "rent", price: 2000 },
  ] as Property[];
  it("filters by city", () => {
    expect(filterProperties(list, { q: "dallas" })).toHaveLength(1);
  });
  it("filters by price range and bedrooms", () => {
    expect(filterProperties(list, { min: 150000, beds: 4 })).toHaveLength(1);
  });
  it("filters for rent", () => {
    expect(filterProperties(list, { listing: "rent" })).toHaveLength(1);
  });
});
