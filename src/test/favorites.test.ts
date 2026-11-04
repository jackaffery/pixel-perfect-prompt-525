import { describe, expect, it } from "vitest";

import { FavoriteButton, useFavorites, useToggleFavorite } from "@/components/site/FavoriteButton";

// The account page imports useFavorites from this module; a missing export there
// broke the production build, so the module's public surface is pinned here.
describe("Saved properties", () => {
  it("exposes the hooks the account page and listing cards rely on", () => {
    expect(typeof useFavorites).toBe("function");
    expect(typeof useToggleFavorite).toBe("function");
    expect(typeof FavoriteButton).toBe("function");
  });
});
