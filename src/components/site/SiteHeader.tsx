import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, User, X, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "./Logo";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export const NAV = [
  { to: "/buy", label: "Buy" },
  { to: "/rent", label: "Rent" },
  { to: "/sell", label: "Sell" },
  { to: "/land", label: "Land & Plots" },
  { to: "/developments", label: "New Developments" },
  { to: "/agents", label: "Agents" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const signOut = async () => {
    await qc.cancelQueries();
    await supabase.auth.signOut();
    qc.invalidateQueries();
    navigate({ to: "/", replace: true });
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="container-x flex h-20 items-center justify-between gap-6">
        <Logo />
        <nav className="hidden items-center gap-6 xl:flex">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
              activeProps={{ className: "text-primary font-semibold" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 xl:flex">
          {isAdmin && (
            <Button asChild variant="ghost" size="sm">
              <Link to="/admin"><LayoutDashboard /> Admin</Link>
            </Button>
          )}
          {user ? (
            <>
              <Button asChild variant="outline" size="sm">
                <Link to="/account"><User /> My account</Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={signOut}>Sign out</Button>
            </>
          ) : (
            <Button asChild size="sm">
              <Link to="/auth">Sign in</Link>
            </Button>
          )}
        </div>
        <button className="xl:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <div className="border-t bg-background xl:hidden">
          <nav className="container-x flex flex-col py-4">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="py-2.5 font-medium">
                {n.label}
              </Link>
            ))}
            <Link to="/faqs" onClick={() => setOpen(false)} className="py-2.5 font-medium">FAQs</Link>
            <div className="mt-3 flex flex-wrap gap-2">
              {isAdmin && (
                <Button asChild variant="outline" size="sm"><Link to="/admin" onClick={() => setOpen(false)}>Admin</Link></Button>
              )}
              {user ? (
                <>
                  <Button asChild size="sm"><Link to="/account" onClick={() => setOpen(false)}>My account</Link></Button>
                  <Button variant="ghost" size="sm" onClick={signOut}>Sign out</Button>
                </>
              ) : (
                <Button asChild size="sm"><Link to="/auth" onClick={() => setOpen(false)}>Sign in</Link></Button>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
