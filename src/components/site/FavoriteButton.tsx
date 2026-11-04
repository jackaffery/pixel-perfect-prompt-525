import { Heart } from "lucide-react";
import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

const LOCAL_STORAGE_KEY = "asset_houses_favorites";
const FAVORITES_KEY = ["favorites"];

function getLocalFavorites(): string[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
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

/**
 * Saved property ids for the current visitor.
 * Signed-in customers are backed by the database (RLS: own rows only);
 * guests keep their list in this browser so browsing never needs an account.
 */
export function useFavorites() {
  const { user } = useAuth();
  const query = useQuery({
    queryKey: [...FAVORITES_KEY, user?.id ?? "guest"],
    queryFn: async () => {
      if (!user) return getLocalFavorites();
      const { data, error } = await supabase
        .from("favorites")
        .select("property_id")
        .eq("user_id", user.id);
      if (error) throw error;
      return (data ?? []).map((row) => row.property_id);
    },
  });
  useMigrateGuestFavorites();
  return query;
}

let migrationRan = false;

/** Move a guest's browser-saved list into their account the first time they sign in. */
function useMigrateGuestFavorites() {
  const { user } = useAuth();
  const qc = useQueryClient();

  useEffect(() => {
    if (!user || migrationRan) return;
    const local = getLocalFavorites();
    if (local.length === 0) return;
    migrationRan = true;

    void (async () => {
      try {
        // Drop ids whose property no longer exists, otherwise the insert is rejected.
        const { data: existing } = await supabase.from("properties").select("id").in("id", local);
        const valid = new Set((existing ?? []).map((row) => row.id));
        const toSave = local.filter((id) => valid.has(id));
        if (toSave.length > 0) {
          const { error } = await supabase
            .from("favorites")
            .upsert(toSave.map((property_id) => ({ user_id: user.id, property_id })), { ignoreDuplicates: true });
          if (error) return;
        }
        setLocalFavorites(local.filter((id) => !valid.has(id)));
        qc.invalidateQueries({ queryKey: FAVORITES_KEY });
      } catch {
        // Leave the guest list untouched; the next sign-in retries.
      }
    })();
  }, [user, qc]);
}

/** Save or un-save a property for the current visitor. */
export function useToggleFavorite() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ propertyId, save }: { propertyId: string; save: boolean }) => {
      if (!user) {
        const favs = getLocalFavorites();
        setLocalFavorites(save ? Array.from(new Set([...favs, propertyId])) : favs.filter((id) => id !== propertyId));
        return;
      }
      const { error } = save
        ? await supabase
            .from("favorites")
            .upsert({ user_id: user.id, property_id: propertyId }, { ignoreDuplicates: true })
        : await supabase.from("favorites").delete().eq("user_id", user.id).eq("property_id", propertyId);
      if (error) throw error;
    },
    onSuccess: (_result, { save }) => {
      toast.success(save ? "Saved to favorites" : "Removed from favorites");
      qc.invalidateQueries({ queryKey: FAVORITES_KEY });
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : "Could not update your favorites"),
  });
}

export function FavoriteButton({ propertyId }: { propertyId: string }) {
  const { data: favs = [] } = useFavorites();
  const toggle = useToggleFavorite();
  const active = favs.includes(propertyId);

  return (
    <button
      onClick={() => toggle.mutate({ propertyId, save: !active })}
      disabled={toggle.isPending}
      aria-pressed={active}
      aria-label={active ? "Remove from favorites" : "Save to favorites"}
      className={cn(
        "grid h-9 w-9 shrink-0 place-items-center rounded-full border transition-colors disabled:opacity-60",
        active ? "border-primary bg-primary text-primary-foreground" : "hover:bg-accent",
      )}
    >
      <Heart className={cn("h-4 w-4", active && "fill-current")} />
    </button>
  );
}
