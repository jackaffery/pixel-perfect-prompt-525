import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { PageHeader, SectionHeading } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { isValidPrice, MIN_SALE_PRICE } from "@/lib/listing";
import { uploadMedia } from "@/lib/queries";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/sell")({
  head: () => seo("Sell Your Property", "List your home, rental or land with Asset Houses Realty. Submit your property for review."),
  component: SellPage,
});

function SellPage() {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const listing_type = String(fd.get("listing_type"));
    const asking_price = Number(fd.get("price"));
    if (!isValidPrice(listing_type, asking_price)) {
      return toast.error(`Sale prices must be at least $${MIN_SALE_PRICE.toLocaleString()}.`);
    }
    setBusy(true);
    try {
      const files = (fd.getAll("photos") as File[]).filter((f) => f.size > 0);
      const images = user ? await Promise.all(files.slice(0, 8).map((f) => uploadMedia(user.id, f))) : [];
      const { error } = await supabase.from("submissions").insert({
        user_id: user?.id ?? null,
        name: String(fd.get("name")), email: String(fd.get("email")), phone: String(fd.get("phone") || "") || null,
        address: String(fd.get("address")), city: String(fd.get("city")),
        listing_type, category: String(fd.get("category")), asking_price,
        bedrooms: Number(fd.get("bedrooms") || 0), bathrooms: Number(fd.get("bathrooms") || 0), size_sqft: Number(fd.get("size") || 0),
        description: String(fd.get("description") || ""), images,
      });
      if (error) throw error;
      toast.success("Property submitted! Our team will review it shortly.");
      setDone(true);
    } catch {
      toast.error("Could not submit your property. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader eyebrow="Sell your property" title="List with confidence" text="Tell us about your property. Our team reviews every submission and contacts you within 48 hours." image="https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=2000&q=80" />
      <div className="container-x grid gap-14 py-16 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-6">
          <SectionHeading eyebrow="How it works" title="Three simple steps" />
          {["Submit your property details and photos.", "An agent reviews and values your listing.", "Once approved, your property goes live to buyers or renters."].map((t, i) => (
            <div key={t} className="flex gap-4"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary font-display text-primary-foreground">{i + 1}</span><p className="pt-2">{t}</p></div>
          ))}
          {!user && <p className="rounded-md bg-accent p-4 text-sm text-accent-foreground">Tip: sign in to upload photos and track your submission status in your account.</p>}
        </div>
        {done ? (
          <div className="rounded-md border bg-card p-10 text-center shadow-soft">
            <CheckCircle2 className="mx-auto h-12 w-12 text-primary" />
            <h2 className="mt-4 text-2xl font-semibold">Thank you for your submission</h2>
            <p className="mt-2 text-muted-foreground">We've received your property details and will be in touch soon.</p>
            <Button className="mt-6" onClick={() => setDone(false)}>Submit another property</Button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-5 rounded-md border bg-card p-7 shadow-soft">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5"><Label>Your name</Label><Input name="name" required maxLength={100} /></div>
              <div className="space-y-1.5"><Label>Email</Label><Input name="email" type="email" required defaultValue={user?.email ?? ""} /></div>
              <div className="space-y-1.5"><Label>Phone</Label><Input name="phone" maxLength={30} /></div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5"><Label>Property address</Label><Input name="address" required maxLength={200} /></div>
              <div className="space-y-1.5"><Label>City & state</Label><Input name="city" required maxLength={100} /></div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5"><Label>Listing</Label>
                <select name="listing_type" className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="sale">For sale</option><option value="rent">For rent</option></select>
              </div>
              <div className="space-y-1.5"><Label>Category</Label>
                <select name="category" className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                  {["house", "apartment", "condo", "townhouse", "villa", "land"].map((c) => <option key={c} value={c}>{c[0].toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>
              <div className="space-y-1.5"><Label>Asking price (USD)</Label><Input name="price" type="number" min={1} required placeholder="Sale min. $40,000" /></div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5"><Label>Bedrooms</Label><Input name="bedrooms" type="number" min={0} /></div>
              <div className="space-y-1.5"><Label>Bathrooms</Label><Input name="bathrooms" type="number" min={0} step="0.5" /></div>
              <div className="space-y-1.5"><Label>Size (sq ft)</Label><Input name="size" type="number" min={0} /></div>
            </div>
            <div className="space-y-1.5"><Label>Description</Label><Textarea name="description" rows={4} maxLength={3000} /></div>
            {user && <div className="space-y-1.5"><Label>Photos (up to 8)</Label><Input name="photos" type="file" accept="image/*" multiple /></div>}
            <Button type="submit" size="lg" className="w-full" disabled={busy}>{busy ? "Submitting…" : "Submit property"}</Button>
          </form>
        )}
      </div>
    </>
  );
}
