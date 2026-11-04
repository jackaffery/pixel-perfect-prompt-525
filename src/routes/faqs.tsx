import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/faqs")({
  head: () => seo("FAQs", "Answers to frequently asked questions about buying, selling and renting property."),
  component: Faqs,
});

const FAQS: [string, string][] = [
  ["Do I need an account to browse properties?", "No. You can browse and search every listing without registering. An account lets you save favorites, track inquiries and manage viewings."],
  ["What is the starting price for properties for sale?", "Properties for sale start at $40,000, with listings across every range up to $500,000 and above."],
  ["How do I schedule a property viewing?", "Open any property and choose \"Schedule viewing\". Pick a preferred date and time and we'll confirm your appointment."],
  ["How do I list my property with you?", "Use the Sell Your Property page to submit details and photos. Our team reviews each submission and contacts you within 48 hours."],
  ["Are the listings on the website real?", "Listings marked \"Demonstration listing\" are samples shown while our live inventory is being added."],
  ["Can I contact you on WhatsApp?", "Yes — tap the WhatsApp button at the bottom right of any page to chat with our team."],
  ["Do you help with land and investment purchases?", "Yes. Our land and investment advisors help with plots, acreage, farmland and new developments."],
];

function Faqs() {
  return (
    <>
      <PageHeader eyebrow="FAQs" title="Frequently asked questions" />
      <div className="container-x max-w-3xl py-16">
        <Accordion type="single" collapsible>
          {FAQS.map(([q, a]) => (
            <AccordionItem key={q} value={q}>
              <AccordionTrigger className="text-left text-base font-semibold">{q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </>
  );
}
