import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { PageHeader } from "@/components/site/PageHeader";
import { InquiryForm } from "@/components/site/Forms";
import { settingsQuery } from "@/lib/queries";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/contact")({
  staticData: { sitemap: true },
  head: () => seo("Contact Us", "Call, email, WhatsApp or visit the Asset Houses Realty office."),
  component: Contact,
});

function Contact() {
  const { data: s } = useQuery(settingsQuery);
  const items = [
    { i: MapPin, l: "Office", v: s?.address },
    { i: Phone, l: "Phone", v: s?.phone, href: `tel:${s?.phone}` },
    { i: Mail, l: "Email", v: s?.email, href: `mailto:${s?.email}` },
    { i: MessageCircle, l: "WhatsApp", v: "Chat with us", href: `https://wa.me/${s?.whatsapp}` },
    { i: Clock, l: "Hours", v: s?.hours },
  ];
  return (
    <>
      <PageHeader eyebrow="Contact us" title="We'd love to hear from you" text="Questions about buying, selling or renting? Send us a message and we'll reply within one business day." />
      <div className="container-x grid gap-12 py-16 lg:grid-cols-[1fr_1.4fr]">
        <ul className="space-y-6">
          {items.map(({ i: I, l, v, href }) => (
            <li key={l} className="flex gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-accent text-primary"><I className="h-5 w-5" /></span>
              <div><p className="eyebrow">{l}</p>{href ? <a href={href} target={l === "WhatsApp" ? "_blank" : undefined} rel="noreferrer" className="font-medium hover:text-primary">{v}</a> : <p className="font-medium">{v}</p>}</div>
            </li>
          ))}
        </ul>
        <div className="rounded-md border bg-card p-7 shadow-soft">
          <h2 className="mb-5 text-2xl font-semibold">Send us a message</h2>
          <InquiryForm />
        </div>
      </div>
    </>
  );
}
