import { useState, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { agentsQuery, categoriesQuery, settingsQuery, uploadMedia } from "@/lib/queries";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function CustomersAdmin() {
  const qc = useQueryClient();
  const [target, setTarget] = useState<{ id: string; name: string } | "all" | null>(null);
  const { data } = useQuery({
    queryKey: ["admin-customers"],
    queryFn: async () => {
      const [{ data: profiles }, { data: roles }] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("user_roles").select("*"),
      ]);
      return (profiles ?? []).map((p) => ({ ...p, admin: (roles ?? []).some((r) => r.user_id === p.id && r.role === "admin") }));
    },
  });
  const toggleAdmin = async (id: string, isAdmin: boolean) => {
    const { error } = isAdmin
      ? await supabase.from("user_roles").delete().eq("user_id", id).eq("role", "admin")
      : await supabase.from("user_roles").insert({ user_id: id, role: "admin" });
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["admin-customers"] });
  };
  const send = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const ids = target === "all" ? (data ?? []).map((c) => c.id) : target ? [target.id] : [];
    const { error } = await supabase.from("notifications").insert(ids.map((user_id) => ({ user_id, title: String(fd.get("title")), body: String(fd.get("body")) })));
    if (error) { toast.error(error.message); return; }
    toast.success(`Notification sent to ${ids.length} customer(s)`);
    setTarget(null);
  };
  return (
    <div>
      <div className="mb-4 flex justify-end"><Button onClick={() => setTarget("all")}>Notify all customers</Button></div>
      <div className="overflow-x-auto rounded-md border bg-card">
        <Table>
          <TableHeader><TableRow><TableHead>Customer</TableHead><TableHead>Phone</TableHead><TableHead>Joined</TableHead><TableHead>Role</TableHead><TableHead /></TableRow></TableHeader>
          <TableBody>
            {(data ?? []).map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.full_name || "—"}</TableCell>
                <TableCell>{c.phone || "—"}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</TableCell>
                <TableCell>{c.admin ? <Badge>Admin</Badge> : <Badge variant="secondary">Customer</Badge>}</TableCell>
                <TableCell className="whitespace-nowrap text-right">
                  <Button size="sm" variant="outline" onClick={() => setTarget({ id: c.id, name: c.full_name ?? "customer" })}>Notify</Button>{" "}
                  <Button size="sm" variant="ghost" onClick={() => toggleAdmin(c.id, c.admin)}>{c.admin ? "Remove admin" : "Make admin"}</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Dialog open={!!target} onOpenChange={(o) => !o && setTarget(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Send notification {target === "all" ? "to all customers" : target ? `to ${target.name}` : ""}</DialogTitle></DialogHeader>
          <form onSubmit={send} className="space-y-4">
            <div className="space-y-1.5"><Label>Title</Label><Input name="title" required /></div>
            <div className="space-y-1.5"><Label>Message</Label><Textarea name="body" rows={4} required /></div>
            <Button type="submit" className="w-full">Send</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function AgentsAdmin() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { data = [] } = useQuery(agentsQuery);
  const [editing, setEditing] = useState<Partial<(typeof data)[number]> | null>(null);
  const save = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const file = fd.get("photo") as File;
    let photo_url = editing?.photo_url ?? null;
    if (file && file.size > 0 && user) photo_url = await uploadMedia(user.id, file);
    const row = { name: String(fd.get("name")), title: String(fd.get("title")), email: String(fd.get("email")), phone: String(fd.get("phone")), bio: String(fd.get("bio")), photo_url };
    const { error } = editing?.id ? await supabase.from("agents").update(row).eq("id", editing.id) : await supabase.from("agents").insert(row);
    if (error) { toast.error(error.message); return; }
    toast.success("Agent saved");
    qc.invalidateQueries({ queryKey: ["agents"] });
    setEditing(null);
  };
  const remove = async (id: string) => {
    if (!confirm("Remove this agent?")) return;
    await supabase.from("agents").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["agents"] });
  };
  return (
    <div>
      <div className="mb-4 flex justify-end"><Button onClick={() => setEditing({})}>Add agent</Button></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {data.map((a) => (
          <div key={a.id} className="rounded-md border bg-card p-4">
            <img src={a.photo_url ?? ""} alt={a.name} className="aspect-square w-full rounded object-cover" />
            <p className="mt-3 font-semibold">{a.name}</p><p className="text-sm text-muted-foreground">{a.title}</p>
            <div className="mt-3 flex gap-2"><Button size="sm" variant="outline" onClick={() => setEditing(a)}>Edit</Button><Button size="icon" variant="ghost" onClick={() => remove(a.id)} aria-label="Delete"><Trash2 /></Button></div>
          </div>
        ))}
      </div>
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing?.id ? "Edit agent" : "Add agent"}</DialogTitle></DialogHeader>
          <form onSubmit={save} className="space-y-3">
            <Input name="name" placeholder="Name" required defaultValue={editing?.name ?? ""} />
            <Input name="title" placeholder="Title" defaultValue={editing?.title ?? "Real Estate Agent"} />
            <Input name="email" type="email" placeholder="Email" defaultValue={editing?.email ?? ""} />
            <Input name="phone" placeholder="Phone" defaultValue={editing?.phone ?? ""} />
            <Textarea name="bio" placeholder="Bio" defaultValue={editing?.bio ?? ""} />
            <div className="space-y-1.5"><Label>Photo</Label><Input name="photo" type="file" accept="image/*" /></div>
            <Button type="submit" className="w-full">Save agent</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function CategoriesAdmin() {
  const qc = useQueryClient();
  const { data = [] } = useQuery(categoriesQuery);
  const add = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const name = String(new FormData(e.currentTarget).get("name")).trim();
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const { error } = await supabase.from("categories").insert({ slug, name });
    if (error) { toast.error(error.message); return; }
    e.currentTarget.reset();
    qc.invalidateQueries({ queryKey: ["categories"] });
  };
  const remove = async (slug: string) => {
    await supabase.from("categories").delete().eq("slug", slug);
    qc.invalidateQueries({ queryKey: ["categories"] });
  };
  return (
    <div className="max-w-lg space-y-4">
      <form onSubmit={add} className="flex gap-2"><Input name="name" placeholder="New category name" required /><Button type="submit">Add</Button></form>
      <ul className="divide-y rounded-md border bg-card">
        {data.map((c) => (
          <li key={c.slug} className="flex items-center justify-between px-4 py-2.5"><span>{c.name}</span><Button size="icon" variant="ghost" onClick={() => remove(c.slug)} aria-label="Delete"><Trash2 /></Button></li>
        ))}
      </ul>
    </div>
  );
}

export function SettingsAdmin() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { data: s } = useQuery(settingsQuery);
  if (!s) return null;
  const save = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const file = fd.get("hero_file") as File;
    let hero_image = String(fd.get("hero_image"));
    if (file && file.size > 0 && user) hero_image = await uploadMedia(user.id, file);
    const { error } = await supabase.from("site_settings").update({
      hero_headline: String(fd.get("hero_headline")), hero_subtext: String(fd.get("hero_subtext")), hero_image,
      phone: String(fd.get("phone")), email: String(fd.get("email")), whatsapp: String(fd.get("whatsapp")).replace(/\D/g, ""),
      address: String(fd.get("address")), hours: String(fd.get("hours")), updated_at: new Date().toISOString(),
    }).eq("id", 1);
    if (error) { toast.error(error.message); return; }
    toast.success("Website settings updated");
    qc.invalidateQueries({ queryKey: ["settings"] });
  };
  return (
    <form onSubmit={save} className="grid max-w-3xl gap-4">
      <h2 className="text-xl font-semibold">Homepage banner</h2>
      <div className="space-y-1.5"><Label>Headline</Label><Input name="hero_headline" defaultValue={s.hero_headline} /></div>
      <div className="space-y-1.5"><Label>Supporting text</Label><Textarea name="hero_subtext" rows={3} defaultValue={s.hero_subtext} /></div>
      <div className="space-y-1.5"><Label>Banner image URL</Label><Input name="hero_image" defaultValue={s.hero_image} /></div>
      <div className="space-y-1.5"><Label>…or upload a new banner image</Label><Input name="hero_file" type="file" accept="image/*" /></div>
      <h2 className="mt-4 text-xl font-semibold">Company contact information</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5"><Label>Phone</Label><Input name="phone" defaultValue={s.phone} /></div>
        <div className="space-y-1.5"><Label>Email</Label><Input name="email" type="email" defaultValue={s.email} /></div>
        <div className="space-y-1.5"><Label>WhatsApp number (with country code)</Label><Input name="whatsapp" defaultValue={s.whatsapp} /></div>
        <div className="space-y-1.5"><Label>Office hours</Label><Input name="hours" defaultValue={s.hours} /></div>
      </div>
      <div className="space-y-1.5"><Label>Office address</Label><Input name="address" defaultValue={s.address} /></div>
      <p className="text-sm text-muted-foreground">Featured homepage properties are managed with the "Featured" switch on the Properties tab.</p>
      <Button type="submit" className="w-fit">Save settings</Button>
    </form>
  );
}
