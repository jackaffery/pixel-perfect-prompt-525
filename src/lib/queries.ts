import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { REAL_ILLINOIS_PROPERTIES } from "@/data/illinoisProperties";

export const propertiesQuery = queryOptions({
  queryKey: ["properties"],
  queryFn: async () => {
    let remoteData: typeof REAL_ILLINOIS_PROPERTIES = [];
    try {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) {
        remoteData = data as typeof REAL_ILLINOIS_PROPERTIES;
      }
    } catch {
      // Fallback cleanly to verified Illinois properties
    }

    // Merge and prioritize real Illinois active properties across Chicago, Springfield, Naperville, Aurora, Rockford, Peoria, Elgin, Champaign, Bloomington, Evanston, Schaumburg, Joliet
    const propertyMap = new Map<string, (typeof REAL_ILLINOIS_PROPERTIES)[0]>();

    // 1. Add verified Illinois properties first
    REAL_ILLINOIS_PROPERTIES.forEach((p) => {
      propertyMap.set(p.id, p);
    });

    // 2. Add any custom properties added through the admin or database
    remoteData.forEach((p) => {
      if (!propertyMap.has(p.id)) {
        propertyMap.set(p.id, {
          ...p,
          state: p.state || "IL",
        });
      }
    });

    return Array.from(propertyMap.values());
  },
});

export const agentsQuery = queryOptions({
  queryKey: ["agents"],
  queryFn: async () => {
    const { data, error } = await supabase.from("agents").select("*").order("created_at");
    if (error) throw error;
    return (data ?? []).map((a) => ({
      ...a,
      phone: "+1 (815)-AHR",
      email: "support@assethousesrealtly.online",
      bio: a.bio?.replace(/Texas/gi, "Rockford, Illinois") ?? a.bio,
    }));
  },
});

export const settingsQuery = queryOptions({
  queryKey: ["settings"],
  queryFn: async () => {
    const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).single();
    if (error) throw error;
    return {
      ...data,
      phone: "+1 (815)-AHR",
      email: "support@assethousesrealtly.online",
      address: "120 E State St, Suite 400, Rockford, IL 61104",
      hero_subtext: data?.hero_subtext?.replace(/Texas/gi, "Rockford, Illinois") ?? data?.hero_subtext,
    };
  },
});

export const categoriesQuery = queryOptions({
  queryKey: ["categories"],
  queryFn: async () => {
    const { data, error } = await supabase.from("categories").select("*").order("name");
    if (error) throw error;
    return data;
  },
});

/** Upload a file to private storage and return a long-lived signed URL. */
export async function uploadMedia(userId: string, file: File) {
  const path = `${userId}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
  const { error } = await supabase.storage.from("media").upload(path, file);
  if (error) throw error;
  const { data, error: e2 } = await supabase.storage
    .from("media")
    .createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
  if (e2 || !data) throw e2 ?? new Error("Could not create link");
  return data.signedUrl;
}
