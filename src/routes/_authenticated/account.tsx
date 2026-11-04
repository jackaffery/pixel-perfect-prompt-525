import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { propertiesQuery, uploadMedia } from "@/lib/queries";
import { useFavorites } from "@/components/site/FavoriteButton";
import { PropertyCard } from "@/components/site/PropertyCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/_authenticated/account")({
  staticData: { sitemap: false },
  head: () => seo("My Account", "Your profile, saved properties, inquiries and viewing appointments."),
  component: Account,
});

const fmt = (d: string) => new Date(d).toLocaleDateString("en-US", { dateStyle: "medium" });

function Account() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const uid = user?.id;
  const { data: props = [] } = useQuery(propertiesQuery);
  const { data: favs = [] } = useFavorites();
  const propName = (id: string | null) => props.find((p) => p.id === id)?.title ?? "General inquiry";

  const profile = useQuery({ queryKey: ["profile", uid], enabled: !!uid, queryFn: async () => (await supabase.from("profiles").select("*").eq("id", uid!).maybeSingle()).data });
  const inquiries = useQuery({ queryKey: ["my-inquiries", uid], enabled: !!uid, queryFn: async () => (await supabase.from("inquiries").select("*").eq("user_id", uid!).order("created_at", { ascending: false })).data ?? [] });
  const viewings = useQuery({ queryKey: ["my-viewings", uid], enabled: !!uid, queryFn: async () => (await supabase.from("viewings").select("*").eq("user_id", uid!).order("preferred_date")).data ?? [] });
  const subs = useQuery({ queryKey: ["my-subs", uid], enabled: !!uid, queryFn: async () => (await supabase.from("submissions").select("*").eq("user_id", uid!).order("created_at", { ascending: false })).data ?? [] });
  const notifs = useQuery({ queryKey: ["my-notifs", uid], enabled: !!uid, queryFn: async () => (await supabase.from("notifications").select("*").eq("user_id", uid!).order("created_at", { ascending: false })).data ?? [] });
  const unread = (notifs.data ?? []).filter((n) => !n.read).length;

  const [avatarBusy, setAvatarBusy] = useState(false);

  const saveProfile = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const { error } = await supabase.from("profiles").upsert({ id: uid!, full_name: String(fd.get("full_name")), phone: String(fd.get("phone")) });
    if (error) { toast.error(error.message); return; }
    toast.success("Profile saved");
    qc.invalidateQueries({ queryKey: ["profile"] });
  };

  const uploadAvatar = async (file?: File) => {
    if (!file || !uid) return;
    setAvatarBusy(true);
    try {
      const url = await uploadMedia(uid, file);
      await supabase.from("profiles").upsert({ id: uid, avatar_url: url });
      toast.success("Photo updated");
      qc.invalidateQueries({ queryKey: ["profile"] });
    } catch { toast.error("Upload failed"); }
    setAvatarBusy(false);
  };

  const changePassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const { error } = await supabase.auth.updateUser({ password: String(fd.get("new")), current_password: String(fd.get("current")) } as never);
    if (error) { toast.error(error.message); return; }
    toast.success("Password changed");
    e.currentTarget.reset();
  };

  const markAllRead = async () => {
    await supabase.from("notifications").update({ read: true }).eq("user_id", uid!).eq("read", false);
    qc.invalidateQueries({ queryKey: ["my-notifs"] });
  };

  const p = profile.data;

  return (
    <div className="container-x py-12">
      <div className="mb-8 flex items-center gap-5">
        <img src={p?.avatar_url ?? `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(p?.full_name ?? user?.email ?? "U")}`} alt="Profile" className="h-20 w-20 rounded-full border object-cover" />
        <div>
          <h1 className="text-3xl font-semibold">{p?.full_name || "My account"}</h1>
          <p className="text-muted-foreground">{user?.email}</p>
        </div>
      </div>
      <Tabs defaultValue="favorites">
        <TabsList className="h-auto flex-wrap justify-start">
          <TabsTrigger value="favorites">Saved ({favs.length})</TabsTrigger>
          <TabsTrigger value="inquiries">Inquiries</TabsTrigger>
          <TabsTrigger value="viewings">Viewings</TabsTrigger>
          <TabsTrigger value="submissions">My listings</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="mr-1 h-3.5 w-3.5" />Notifications {unread > 0 && <Badge className="ml-1.5">{unread}</Badge>}</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="favorites" className="pt-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {props.filter((x) => favs.includes(x.id)).map((x) => <PropertyCard key={x.id} p={x} />)}
          </div>
          {favs.length === 0 && <p className="py-10 text-muted-foreground">You haven't saved any properties yet. Tap the heart on a listing to save it.</p>}
        </TabsContent>

        <TabsContent value="inquiries" className="space-y-3 pt-6">
          {(inquiries.data ?? []).map((i) => (
            <div key={i.id} className="rounded-md border bg-card p-4">
              <div className="flex justify-between gap-3"><p className="font-semibold">{propName(i.property_id)}</p><Badge variant="secondary">{i.status.replace("_", " ")}</Badge></div>
              <p className="mt-1 text-sm text-muted-foreground">{i.message}</p>
              <p className="mt-2 text-xs text-muted-foreground">{fmt(i.created_at)}</p>
            </div>
          ))}
          {inquiries.data?.length === 0 && <p className="py-10 text-muted-foreground">No inquiries yet.</p>}
        </TabsContent>

        <TabsContent value="viewings" className="space-y-3 pt-6">
          {(viewings.data ?? []).map((v) => (
            <div key={v.id} className="flex justify-between gap-3 rounded-md border bg-card p-4">
              <div><p className="font-semibold">{propName(v.property_id)}</p><p className="text-sm text-muted-foreground">{fmt(v.preferred_date)} at {v.preferred_time}</p></div>
              <Badge variant={v.status === "confirmed" ? "default" : "secondary"}>{v.status}</Badge>
            </div>
          ))}
          {viewings.data?.length === 0 && <p className="py-10 text-muted-foreground">No viewing appointments yet.</p>}
        </TabsContent>

        <TabsContent value="submissions" className="space-y-3 pt-6">
          {(subs.data ?? []).map((s) => (
            <div key={s.id} className="flex justify-between gap-3 rounded-md border bg-card p-4">
              <div><p className="font-semibold">{s.address}, {s.city}</p><p className="text-sm text-muted-foreground">${Number(s.asking_price).toLocaleString()} · {s.listing_type}</p></div>
              <Badge variant={s.status === "approved" ? "default" : s.status === "rejected" ? "destructive" : "secondary"}>{s.status}</Badge>
            </div>
          ))}
          {subs.data?.length === 0 && <p className="py-10 text-muted-foreground">You haven't submitted any properties.</p>}
        </TabsContent>

        <TabsContent value="notifications" className="space-y-3 pt-6">
          {unread > 0 && <Button variant="outline" size="sm" onClick={markAllRead}>Mark all as read</Button>}
          {(notifs.data ?? []).map((n) => (
            <div key={n.id} className={`rounded-md border p-4 ${n.read ? "bg-card" : "border-primary/40 bg-accent"}`}>
              <p className="font-semibold">{n.title}</p><p className="text-sm text-muted-foreground">{n.body}</p><p className="mt-1 text-xs text-muted-foreground">{fmt(n.created_at)}</p>
            </div>
          ))}
          {notifs.data?.length === 0 && <p className="py-10 text-muted-foreground">No notifications.</p>}
        </TabsContent>

        <TabsContent value="profile" className="pt-6">
          <form key={p?.id} onSubmit={saveProfile} className="max-w-md space-y-4">
            <div className="space-y-1.5"><Label>Profile photo</Label><Input type="file" accept="image/*" disabled={avatarBusy} onChange={(e) => uploadAvatar(e.target.files?.[0])} /></div>
            <div className="space-y-1.5"><Label htmlFor="fn">Full name</Label><Input id="fn" name="full_name" defaultValue={p?.full_name ?? ""} /></div>
            <div className="space-y-1.5"><Label htmlFor="ph">Phone</Label><Input id="ph" name="phone" defaultValue={p?.phone ?? ""} /></div>
            <Button type="submit">Save profile</Button>
          </form>
        </TabsContent>

        <TabsContent value="settings" className="pt-6">
          <form onSubmit={changePassword} className="max-w-md space-y-4">
            <h2 className="text-xl font-semibold">Change password</h2>
            <div className="space-y-1.5"><Label htmlFor="cur">Current password</Label><Input id="cur" name="current" type="password" required /></div>
            <div className="space-y-1.5"><Label htmlFor="new">New password</Label><Input id="new" name="new" type="password" minLength={6} required /></div>
            <Button type="submit">Update password</Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
