import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { propertiesQuery } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const sel = "h-8 rounded-md border border-input bg-background px-2 text-sm";
const fmt = (d: string) => new Date(d).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });

async function notify(userId: string | null, title: string, body: string) {
  if (!userId) return;
  await supabase.from("notifications").insert({ user_id: userId, title, body });
}

function usePropName() {
  const { data = [] } = useQuery(propertiesQuery);
  return (id: string | null) => data.find((p) => p.id === id)?.title ?? "—";
}

export function SubmissionsAdmin() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ["admin-subs"], queryFn: async () => (await supabase.from("submissions").select("*").order("created_at", { ascending: false })).data ?? [] });

  const decide = async (s: (typeof data)[number], approve: boolean) => {
    if (approve) {
      const { error } = await supabase.from("properties").insert({
        title: `${s.category.charAt(0).toUpperCase() + s.category.slice(1)} at ${s.address}`, address: s.address, city: s.city,
        price: s.asking_price, listing_type: s.listing_type, category: s.category, section: s.category === "land" ? "land" : "standard",
        bedrooms: s.bedrooms ?? 0, bathrooms: s.bathrooms ?? 0, size_sqft: s.size_sqft ?? 0, description: s.description ?? "", images: s.images,
      });
      if (error) { toast.error(error.message); return; }
    }
    await supabase.from("submissions").update({ status: approve ? "approved" : "rejected" }).eq("id", s.id);
    await notify(s.user_id, approve ? "Your property was approved" : "Your property submission was declined",
      approve ? `${s.address} is now listed on our website.` : `Unfortunately we couldn't list ${s.address} at this time. Contact us for details.`);
    toast.success(approve ? "Approved and published" : "Submission rejected");
    qc.invalidateQueries();
  };

  return (
    <div className="overflow-x-auto rounded-md border bg-card">
      <Table>
        <TableHeader><TableRow><TableHead>Property</TableHead><TableHead>Owner</TableHead><TableHead>Price</TableHead><TableHead>Status</TableHead><TableHead /></TableRow></TableHeader>
        <TableBody>
          {data.map((s) => (
            <TableRow key={s.id}>
              <TableCell><p className="font-medium">{s.address}, {s.city}</p><p className="text-xs text-muted-foreground">{s.category} · {s.listing_type} · {s.bedrooms}bd/{s.bathrooms}ba · {s.images.length} photos</p><p className="max-w-sm text-xs text-muted-foreground">{s.description}</p></TableCell>
              <TableCell className="text-sm">{s.name}<br /><span className="text-muted-foreground">{s.email} {s.phone}</span></TableCell>
              <TableCell>${Number(s.asking_price).toLocaleString()}</TableCell>
              <TableCell><Badge variant={s.status === "pending" ? "secondary" : s.status === "approved" ? "default" : "destructive"}>{s.status}</Badge></TableCell>
              <TableCell className="whitespace-nowrap">
                {s.status === "pending" && (<><Button size="sm" onClick={() => decide(s, true)}>Approve</Button> <Button size="sm" variant="outline" onClick={() => decide(s, false)}>Reject</Button></>)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {data.length === 0 && <p className="p-8 text-center text-muted-foreground">No submissions yet.</p>}
    </div>
  );
}

export function InquiriesAdmin() {
  const qc = useQueryClient();
  const name = usePropName();
  const { data = [] } = useQuery({ queryKey: ["admin-inq"], queryFn: async () => (await supabase.from("inquiries").select("*").order("created_at", { ascending: false })).data ?? [] });
  const update = async (id: string, status: string) => {
    await supabase.from("inquiries").update({ status }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-inq"] });
  };
  return (
    <div className="overflow-x-auto rounded-md border bg-card">
      <Table>
        <TableHeader><TableRow><TableHead>From</TableHead><TableHead>About</TableHead><TableHead>Message</TableHead><TableHead>Received</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
        <TableBody>
          {data.map((i) => (
            <TableRow key={i.id}>
              <TableCell className="text-sm"><p className="font-medium">{i.name}</p><a href={`mailto:${i.email}`} className="text-primary">{i.email}</a><p className="text-muted-foreground">{i.phone}</p></TableCell>
              <TableCell className="text-sm">{i.kind === "property" ? name(i.property_id) : "General contact"}</TableCell>
              <TableCell className="max-w-sm text-sm">{i.message}</TableCell>
              <TableCell className="text-xs text-muted-foreground">{fmt(i.created_at)}</TableCell>
              <TableCell><select className={sel} value={i.status} onChange={(e) => update(i.id, e.target.value)}><option value="new">New</option><option value="in_progress">In progress</option><option value="closed">Closed</option></select></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {data.length === 0 && <p className="p-8 text-center text-muted-foreground">No inquiries yet.</p>}
    </div>
  );
}

export function ViewingsAdmin() {
  const qc = useQueryClient();
  const name = usePropName();
  const { data = [] } = useQuery({ queryKey: ["admin-view"], queryFn: async () => (await supabase.from("viewings").select("*").order("preferred_date")).data ?? [] });
  const update = async (v: (typeof data)[number], status: string) => {
    await supabase.from("viewings").update({ status }).eq("id", v.id);
    if (status === "confirmed" || status === "cancelled")
      await notify(v.user_id, `Viewing ${status}`, `Your viewing of ${name(v.property_id)} on ${v.preferred_date} at ${v.preferred_time} has been ${status}.`);
    toast.success(`Viewing ${status}`);
    qc.invalidateQueries({ queryKey: ["admin-view"] });
  };
  return (
    <div className="overflow-x-auto rounded-md border bg-card">
      <Table>
        <TableHeader><TableRow><TableHead>Client</TableHead><TableHead>Property</TableHead><TableHead>Date & time</TableHead><TableHead>Notes</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
        <TableBody>
          {data.map((v) => (
            <TableRow key={v.id}>
              <TableCell className="text-sm"><p className="font-medium">{v.name}</p><p className="text-muted-foreground">{v.email} {v.phone}</p></TableCell>
              <TableCell className="text-sm">{name(v.property_id)}</TableCell>
              <TableCell className="text-sm">{v.preferred_date} · {v.preferred_time}</TableCell>
              <TableCell className="max-w-xs text-sm">{v.notes}</TableCell>
              <TableCell><select className={sel} value={v.status} onChange={(e) => update(v, e.target.value)}>{["requested", "confirmed", "completed", "cancelled"].map((s) => <option key={s}>{s}</option>)}</select></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {data.length === 0 && <p className="p-8 text-center text-muted-foreground">No viewing requests yet.</p>}
    </div>
  );
}
