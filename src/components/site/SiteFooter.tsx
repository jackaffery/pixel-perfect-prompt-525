import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Youtube } from "lucide-react";
import { Logo } from "./Logo";
import { settingsQuery } from "@/lib/queries";

export function SiteFooter() {
  const { data: s } = useQuery(settingsQuery);
  return (
    <footer className="bg-primary-deep text-primary-foreground">
      <div className="container-x grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-5">
          <Logo light />
          <p className="text-sm leading-relaxed text-primary-foreground/70">
            Asset Houses Realty helps families and investors buy, sell, rent and invest in property with
            transparency and care. Find your place. Build your future.
          </p>
          <div className="flex flex-wrap gap-3">
            {[
              {
                icon: Facebook,
                href: "https://facebook.com",
                label: "Facebook",
              },
              {
                icon: Instagram,
                href: "https://instagram.com",
                label: "Instagram",
              },
              {
                icon: Linkedin,
                href: "https://linkedin.com",
                label: "LinkedIn",
              },
              {
                icon: Youtube,
                href: "https://youtube.com",
                label: "YouTube",
              },
            ].map(({ icon: I, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="grid h-9 w-9 place-items-center rounded-sm border border-primary-foreground/20 hover:bg-primary-foreground/10"
              >
                <I className="h-4 w-4" />
              </a>
            ))}
            {s?.whatsapp && (
              <a
                href={`https://wa.me/${s.whatsapp}?text=${encodeURIComponent("Hello Asset Houses Realty, I'm interested in a property.")}`}
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp"
                title="Chat on WhatsApp"
                className="grid h-9 w-9 place-items-center rounded-sm border border-primary-foreground/20 hover:bg-primary-foreground/10"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                  <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.4a.5.5 0 0 0 0-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.4.8 3.2.7a2.8 2.8 0 0 0 1.8-1.3 2.3 2.3 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3Z" />
                </svg>
              </a>
            )}
          </div>
        </div>
        <div>
          <h4 className="mb-4 font-display text-lg">Quick links</h4>
          <ul className="space-y-2 text-sm text-primary-foreground/75">
            <li><Link to="/about" className="hover:text-primary-foreground">About Us</Link></li>
            <li><Link to="/agents" className="hover:text-primary-foreground">Our Agents</Link></li>
            <li><Link to="/sell" className="hover:text-primary-foreground">Sell Your Property</Link></li>
            <li><Link to="/faqs" className="hover:text-primary-foreground">FAQs</Link></li>
            <li><Link to="/contact" className="hover:text-primary-foreground">Contact Us</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 font-display text-lg">Properties</h4>
          <ul className="space-y-2 text-sm text-primary-foreground/75">
            <li><Link to="/buy" className="hover:text-primary-foreground">Homes for Sale</Link></li>
            <li><Link to="/rent" className="hover:text-primary-foreground">Rental Properties</Link></li>
            <li><Link to="/land" className="hover:text-primary-foreground">Land & Plots</Link></li>
            <li><Link to="/developments" className="hover:text-primary-foreground">New Developments</Link></li>
            <li><Link to="/search" className="hover:text-primary-foreground">Advanced Search</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 font-display text-lg">Contact</h4>
          <ul className="space-y-3 text-sm text-primary-foreground/75">
            <li className="flex gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0" />{s?.address}</li>
            <li className="flex gap-2"><Phone className="h-4 w-4" /><a href={`tel:${s?.phone}`}>{s?.phone}</a></li>
            <li className="flex gap-2"><Mail className="h-4 w-4" /><a href={`mailto:${s?.email}`}>{s?.email}</a></li>
            <li>{s?.hours}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10">
        <div className="container-x flex flex-col justify-between gap-3 py-6 text-xs text-primary-foreground/60 md:flex-row">
          <p>© {new Date().getFullYear()} Asset Houses Realty. All rights reserved.</p>
          <div className="flex gap-5">
            <Link to="/privacy" className="hover:text-primary-foreground">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-primary-foreground">Terms & Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function WhatsAppButton() {
  const { data: s } = useQuery(settingsQuery);
  if (!s?.whatsapp) return null;
  return (
    <a
      href={`https://wa.me/${s.whatsapp}?text=${encodeURIComponent("Hello Asset Houses Realty, I'm interested in a property.")}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-lift transition-transform hover:scale-105"
    >
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.4a.5.5 0 0 0 0-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.4.8 3.2.7a2.8 2.8 0 0 0 1.8-1.3 2.3 2.3 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3Z"/></svg>
    </a>
  );
}
