import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

function Success({ text, onReset }: { text: string; onReset: () => void }) {
  return (
    <div className="rounded-md border border-primary/30 bg-accent p-6 text-center">
      <CheckCircle2 className="mx-auto h-10 w-10 text-primary" />
      <p className="mt-3 font-semibold text-primary-deep">Thank you — request received!</p>
      <p className="mt-1 text-sm text-muted-foreground">{text}</p>
      <Button variant="link" onClick={onReset}>Send another</Button>
    </div>
  );
}

export function InquiryForm({ propertyId, kind = "contact", defaultMessage = "" }: { propertyId?: string; kind?: "contact" | "property"; defaultMessage?: string }) {
  const { user } = useAuth();
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    const { error } = await supabase.from("inquiries").insert({
      user_id: user?.id ?? null,
      property_id: propertyId ?? null,
      kind,
      name: String(fd.get("name")).trim(),
      email: String(fd.get("email")).trim(),
      phone: String(fd.get("phone") ?? "").trim() || null,
      message: String(fd.get("message")).trim(),
    });
    setBusy(false);
    if (error) return toast.error("Could not send your message. Please try again.");
    toast.success("Your inquiry has been sent. We'll be in touch shortly.");
    setDone(true);
  };

  if (done) return <Success text="An agent will contact you within one business day." onReset={() => setDone(false)} />;

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5"><Label htmlFor="iq-name">Full name</Label><Input id="iq-name" name="name" required maxLength={100} defaultValue={user?.user_metadata?.full_name ?? ""} /></div>
        <div className="space-y-1.5"><Label htmlFor="iq-email">Email</Label><Input id="iq-email" name="email" type="email" required maxLength={255} defaultValue={user?.email ?? ""} /></div>
      </div>
      <div className="space-y-1.5"><Label htmlFor="iq-phone">Phone (optional)</Label><Input id="iq-phone" name="phone" maxLength={30} /></div>
      <div className="space-y-1.5"><Label htmlFor="iq-msg">Message</Label><Textarea id="iq-msg" name="message" required rows={4} maxLength={2000} defaultValue={defaultMessage} /></div>
      <Button type="submit" className="w-full" size="lg" disabled={busy}>{busy ? "Sending…" : "Send inquiry"}</Button>
    </form>
  );
}

export function ViewingForm({ propertyId }: { propertyId: string }) {
  const { user } = useAuth();
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const today = new Date().toISOString().slice(0, 10);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    const { error } = await supabase.from("viewings").insert({
      user_id: user?.id ?? null,
      property_id: propertyId,
      name: String(fd.get("name")).trim(),
      email: String(fd.get("email")).trim(),
      phone: String(fd.get("phone") ?? "").trim() || null,
      preferred_date: String(fd.get("date")),
      preferred_time: String(fd.get("time")),
      notes: String(fd.get("notes") ?? "").trim() || null,
    });
    setBusy(false);
    if (error) return toast.error("Could not book the viewing. Please try again.");
    toast.success("Viewing requested! We'll confirm your appointment soon.");
    setDone(true);
  };

  if (done) return <Success text="We'll confirm your viewing appointment by email or phone." onReset={() => setDone(false)} />;

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5"><Label htmlFor="v-name">Full name</Label><Input id="v-name" name="name" required maxLength={100} /></div>
        <div className="space-y-1.5"><Label htmlFor="v-email">Email</Label><Input id="v-email" name="email" type="email" required defaultValue={user?.email ?? ""} /></div>
        <div className="space-y-1.5"><Label htmlFor="v-date">Preferred date</Label><Input id="v-date" name="date" type="date" min={today} required /></div>
        <div className="space-y-1.5"><Label htmlFor="v-time">Preferred time</Label><Input id="v-time" name="time" type="time" required /></div>
      </div>
      <div className="space-y-1.5"><Label htmlFor="v-phone">Phone</Label><Input id="v-phone" name="phone" maxLength={30} /></div>
      <div className="space-y-1.5"><Label htmlFor="v-notes">Notes</Label><Textarea id="v-notes" name="notes" rows={2} maxLength={1000} /></div>
      <Button type="submit" className="w-full" size="lg" disabled={busy}>{busy ? "Booking…" : "Schedule viewing"}</Button>
    </form>
  );
}
