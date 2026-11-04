import { useState, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { agentsQuery, categoriesQuery, propertiesQuery, uploadMedia } from "@/lib/queries";
import { formatPrice, isValidPrice, MIN_SALE_PRICE, type Property } from "@/lib/listing";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const sel = "h-9 w-full rounded-md border border-input bg-background px-3 text-sm";

export function PropertiesAdmin() {
  const { data = [] } = useQuery(propertiesQuery);
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Partial<Property> | null>(null);

  const quickUpdate = async (id: string, patch: Partial<Property>) => {
    const { error } = await supabase.from("properties").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["properties"] });
  };
  const remove = async (id: string) => {
    if (!confirm("Delete this property permanently?")) return;
    const { error } = await supabase.from("properties").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Property deleted");
    qc.invalidateQueries({ queryKey: ["properties"] });
  };

  return (
    <div>
      <div className="mb-4 flex justify-between">
        <p className="text-sm text-muted-foreground">{data.length} properties. Changes go live on the website immediately.</p>
        <Button onClick={() => setEditing({ listing_type: "sale", section: "standard", category: "house", status: "available", images: [], features: [] })}><Plus /> Add property</Button>
      </div>
      <div className="overflow-x-auto rounded-md border bg-card">
        <Table>
          <TableHeader><TableRow><TableHead>Property</TableHead><TableHead>Price</TableHead><TableHead>Status</TableHead><TableHead>Featured</TableHead><TableHead /></TableRow></TableHeader>
          <TableBody>
            {data.map((p) => (
              <TableRow key={p.id}>
                <TableCell><div className="flex items-center gap-3"><img src={p.images[0]} alt="" className="h-10 w-14 rounded object-cover" /><div><p className="font-medium">{p.title}</p><p className="text-xs text-muted-foreground">{p.city}, {p.state} · {p.section}</p></div></div></TableCell>
                <TableCell>{formatPrice(p)}</TableCell>
                <TableCell>
                  <select className={sel} value={p.status} onChange={(e) => quickUpdate(p.id, { status: e.target.value })}>
                    {["available", "pending", "sold", "rented"].map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </TableCell>
                <TableCell><Switch checked={p.featured} onCheckedChange={(v) => quickUpdate(p.id, { featured: v })} /></TableCell>
                <TableCell className="whitespace-nowrap text-right">
                  <Button size="icon" variant="ghost" onClick={() => setEditing(p)} aria-label="Edit"><Pencil /></Button>
                  <Button size="icon" variant="ghost" onClick={() => remove(p.id)} aria-label="Delete"><Trash2 /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader><DialogTitle>{editing?.id ? "Edit property" : "Add property"}</DialogTitle></DialogHeader>
          {editing && <PropertyForm initial={editing} onDone={() => setEditing(null)} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function PropertyForm({ initial, onDone }: { initial: Partial<Property>; onDone: () => void }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: agents = [] } = useQuery(agentsQuery);
  const { data: cats = [] } = useQuery(categoriesQuery);
  const [images, setImages] = useState<string[]>(initial.images ?? []);
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);

  const upload = async (files: FileList | null) => {
    if (!files || !user) return;
    setUploading(true);
    try {
      const urls = await Promise.all(Array.from(files).map((f) => uploadMedia(user.id, f)));
      setImages((i) => [...i, ...urls]);
    } catch { toast.error("Upload failed"); }
    setUploading(false);
  };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const listing_type = String(fd.get("listing_type"));
    const price = Number(fd.get("price"));
    if (!isValidPrice(listing_type, price)) return toast.error(`Sale prices must be at least $${MIN_SALE_PRICE.toLocaleString()}`);
    const row = {
      title: String(fd.get("title")), address: String(fd.get("address")), city: String(fd.get("city")), state: String(fd.get("state")),
      price, listing_type, category: String(fd.get("category")), section: String(fd.get("section")), status: String(fd.get("status")),
      bedrooms: Number(fd.get("bedrooms") || 0), bathrooms: Number(fd.get("bathrooms") || 0), size_sqft: Number(fd.get("size_sqft") || 0),
      description: String(fd.get("description")), features: String(fd.get("features")).split(",").map((s) => s.trim()).filter(Boolean),
      lat: fd.get("lat") ? Number(fd.get("lat")) : null, lng: fd.get("lng") ? Number(fd.get("lng")) : null,
      agent_id: String(fd.get("agent_id")) || null, featured: fd.get("featured") === "on", is_demo: fd.get("is_demo") === "on", images,
    };
    setBusy(true);
    const { error } = initial.id
      ? await supabase.from("properties").update(row).eq("id", initial.id)
      : await supabase.from("properties").insert(row);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(initial.id ? "Property updated" : "Property added");
    qc.invalidateQueries({ queryKey: ["properties"] });
    onDone();
  };

  const F = ({ n, l, ...rest }: { n: keyof Property; l: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
    <div className="space-y-1.5"><Label>{l}</Label><Input name={n} defaultValue={(initial[n] as string | number | undefined) ?? ""} {...rest} /></div>
  );

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <F n="title" l="Property name" required />
        <F n="address" l="Address" required />
        <F n="city" l="City" required />
        <F n="state" l="State" />
      </div>
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="space-y-1.5"><Label>Listing</Label><select name="listing_type" defaultValue={initial.listing_type} className={sel}><option value="sale">For sale</option><option value="rent">For rent (monthly)</option></select></div>
        <F n="price" l="Price (USD)" type="number" min={1} required />
        <div className="space-y-1.5"><Label>Category</Label><select name="category" defaultValue={initial.category} className={sel}>{cats.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select></div>
        <div className="space-y-1.5"><Label>Page section</Label><select name="section" defaultValue={initial.section} className={sel}><option value="standard">Buy / Rent</option><option value="land">Land & Plots</option><option value="development">New Developments</option></select></div>
      </div>
      <div className="grid gap-4 sm:grid-cols-4">
        <F n="bedrooms" l="Bedrooms" type="number" min={0} />
        <F n="bathrooms" l="Bathrooms" type="number" min={0} step="0.5" />
        <F n="size_sqft" l="Size (sq ft)" type="number" min={0} />
        <div className="space-y-1.5"><Label>Status</Label><select name="status" defaultValue={initial.status} className={sel}>{["available", "pending", "sold", "rented"].map((s) => <option key={s}>{s}</option>)}</select></div>
      </div>
      <div className="space-y-1.5"><Label>Description</Label><Textarea name="description" rows={4} defaultValue={initial.description ?? ""} /></div>
      <div className="space-y-1.5"><Label>Features (comma separated)</Label><Input name="features" defaultValue={(initial.features ?? []).join(", ")} /></div>
      <div className="grid gap-4 sm:grid-cols-3">
        <F n="lat" l="Latitude" type="number" step="any" />
        <F n="lng" l="Longitude" type="number" step="any" />
        <div className="space-y-1.5"><Label>Agent</Label><select name="agent_id" defaultValue={initial.agent_id ?? ""} className={sel}><option value="">None</option>{agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select></div>
      </div>
      <div className="space-y-2">
        <Label>Photographs (interior & exterior)</Label>
        <div className="flex flex-wrap gap-2">
          {images.map((src, i) => (
            <div key={src + i} className="relative">
              <img src={src} alt="" className="h-20 w-28 rounded object-cover" />
              <button type="button" onClick={() => setImages(images.filter((_, j) => j !== i))} className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-destructive text-destructive-foreground" aria-label="Remove photo"><X className="h-3 w-3" /></button>
            </div>
          ))}
        </div>
        <Input type="file" accept="image/*" multiple disabled={uploading} onChange={(e) => upload(e.target.files)} />
        <Input placeholder="…or paste an image URL and press Enter" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); const v = e.currentTarget.value.trim(); if (v) setImages([...images, v]); e.currentTarget.value = ""; } }} />
      </div>
      <div className="flex gap-6 text-sm">
        <label className="flex items-center gap-2"><input type="checkbox" name="featured" defaultChecked={initial.featured} /> Featured on homepage</label>
        <label className="flex items-center gap-2"><input type="checkbox" name="is_demo" defaultChecked={initial.is_demo} /> Demonstration listing</label>
      </div>
      <Button type="submit" className="w-full" disabled={busy || uploading}>{busy ? "Saving…" : "Save property"}</Button>
    </form>
  );
}
