import { Heart } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export function useFavorites() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["favorites", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("favorites").select("property_id");
      if (error) throw error;
      return data.map((d) => d.property_id);
    },
  });
}

export function FavoriteButton({ propertyId }: { propertyId: string }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: favs = [] } = useFavorites();
  const active = favs.includes(propertyId);

  const toggle = async () => {
    if (!user) {
      toast("Sign in to save favorite properties");
      navigate({ to: "/auth" });
      return;
    }
    const { error } = active
      ? await supabase.from("favorites").delete().eq("user_id", user.id).eq("property_id", propertyId)
      : await supabase.from("favorites").insert({ user_id: user.id, property_id: propertyId });
    if (error) return toast.error(error.message);
    toast.success(active ? "Removed from favorites" : "Saved to favorites");
    qc.invalidateQueries({ queryKey: ["favorites"] });
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
