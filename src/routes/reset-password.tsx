import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/reset-password")({
  head: () => seo("Reset Password", "Set a new password for your Asset Houses Realty account."),
  component: Reset,
});

function Reset() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    const password = String(new FormData(e.currentTarget).get("password"));
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Password updated");
    navigate({ to: "/account" });
  };
  return (
    <div className="container-x max-w-sm py-24">
      <h1 className="text-3xl font-semibold">Set a new password</h1>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <div className="space-y-1.5"><Label htmlFor="pw">New password</Label><Input id="pw" name="password" type="password" minLength={6} required /></div>
        <Button className="w-full" disabled={busy}>Update password</Button>
      </form>
    </div>
  );
}
