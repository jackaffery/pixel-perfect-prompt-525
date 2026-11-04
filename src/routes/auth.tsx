import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/site/Logo";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/auth")({
  staticData: { sitemap: false },
  head: () => seo("Sign In", "Sign in or create your Asset Houses Realty account."),
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<"in" | "up" | "forgot">("in");
  const [busy, setBusy] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { if (user) navigate({ to: "/account" }); }, [user, navigate]);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email"));
    const password = String(fd.get("password") ?? "");
    setBusy(true);
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) toast.error(error.message);
    } else if (mode === "up") {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: window.location.origin, data: { full_name: String(fd.get("name")) } },
      });
      if (error) toast.error(error.message);
      else toast.success("Check your email to confirm your account.");
    } else {
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
      if (error) toast.error(error.message);
      else toast.success("Password reset link sent to your email.");
    }
    setBusy(false);
  };

  const google = async () => {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (r.error) toast.error("Google sign-in failed");
  };

  return (
    <div className="grid min-h-[80vh] lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <img src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1600&q=80" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-hero-overlay" />
        <div className="absolute bottom-12 left-12 max-w-md text-primary-foreground">
          <h2 className="text-4xl font-semibold">Find your place. Build your future.</h2>
          <p className="mt-3 text-primary-foreground/80">Save favorites, track inquiries and manage your viewing appointments.</p>
        </div>
      </div>
      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm space-y-6">
          <Logo />
          <div>
            <h1 className="text-3xl font-semibold">{mode === "in" ? "Welcome back" : mode === "up" ? "Create your account" : "Reset password"}</h1>
            <p className="mt-1 text-sm text-muted-foreground">Browsing is always free — no account required.</p>
          </div>
          <form onSubmit={submit} className="space-y-4">
            {mode === "up" && <div className="space-y-1.5"><Label htmlFor="name">Full name</Label><Input id="name" name="name" required /></div>}
            <div className="space-y-1.5"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" required /></div>
            {mode !== "forgot" && <div className="space-y-1.5"><Label htmlFor="password">Password</Label><Input id="password" name="password" type="password" minLength={6} required /></div>}
            <Button type="submit" className="w-full" size="lg" disabled={busy}>
              {mode === "in" ? "Sign in" : mode === "up" ? "Create account" : "Send reset link"}
            </Button>
          </form>
          {mode !== "forgot" && (
            <>
              <div className="flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" /></div>
              <Button variant="outline" className="w-full" size="lg" onClick={google}>Continue with Google</Button>
            </>
          )}
          <div className="flex justify-between text-sm">
            {mode === "in" ? (
              <>
                <button className="text-primary hover:underline" onClick={() => setMode("up")}>Create an account</button>
                <button className="text-muted-foreground hover:underline" onClick={() => setMode("forgot")}>Forgot password?</button>
              </>
            ) : (
              <button className="text-primary hover:underline" onClick={() => setMode("in")}>Back to sign in</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
