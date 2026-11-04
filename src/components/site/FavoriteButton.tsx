import { Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const LOCAL_STORAGE_KEY = "asset_houses_favorites";

function getLocalFavorites(): string[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setLocalFavorites(favs: string[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(favs));
  } catch {
    // Ignore storage quota errors
  }
}

export function FavoriteButton({ propertyId }: { propertyId: string }) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    setActive(getLocalFavorites().includes(propertyId));
  }, [propertyId]);

  const toggle = () => {
    const favs = getLocalFavorites();
    let updated: string[];
    if (favs.includes(propertyId)) {
      updated = favs.filter((id) => id !== propertyId);
      setActive(false);
      toast.success("Removed from favorites");
    } else {
      updated = [...favs, propertyId];
      setActive(true);
      toast.success("Saved to favorites");
    }
    setLocalFavorites(updated);
  };

  return (
    <button
      onClick={toggle}
      aria-label={active ? "Remove from favorites" : "Save to favorites"}
      className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-full border transition-colors",
        active ? "border-primary bg-primary text-primary-foreground" : "hover:bg-accent")}
    >
      <Heart className={cn("h-4 w-4", active && "fill-current")} />
    </button>
  );
}
