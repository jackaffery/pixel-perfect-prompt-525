import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const count = async (table: "properties" | "inquiries" | "viewings" | "submissions" | "profiles" | "favorites", f?: [string, string]) => {
  let q = supabase.from(table).select("*", { count: "exact", head: true });
  if (f) q = q.eq(f[0], f[1]);
  const { count } = await q;
  return count ?? 0;
};

export function Overview() {
  const { data } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: async () => {
      const [props, avail, sold, inq, newInq, view, req, subs, pend, users, favs] = await Promise.all([
        count("properties"), count("properties", ["status", "available"]), count("properties", ["status", "sold"]),
        count("inquiries"), count("inquiries", ["status", "new"]), count("viewings"), count("viewings", ["status", "requested"]),
        count("submissions"), count("submissions", ["status", "pending"]), count("profiles"), count("favorites"),
      ]);
      return { props, avail, sold, inq, newInq, view, req, subs, pend, users, favs };
    },
  });
  const cards = data
    ? [
        ["Total properties", data.props, `${data.avail} available · ${data.sold} sold`],
        ["Inquiries", data.inq, `${data.newInq} new`],
        ["Viewing requests", data.view, `${data.req} awaiting confirmation`],
        ["Property submissions", data.subs, `${data.pend} pending review`],
        ["Customer accounts", data.users, "registered users"],
        ["Saved favorites", data.favs, "across all customers"],
      ]
    : [];
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map(([l, v, s]) => (
        <div key={l as string} className="rounded-md border bg-card p-6 shadow-soft">
          <p className="eyebrow">{l}</p>
          <p className="mt-2 font-display text-4xl font-semibold text-primary">{v}</p>
          <p className="mt-1 text-sm text-muted-foreground">{s}</p>
        </div>
      ))}
    </div>
  );
}
