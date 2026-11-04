import type { ReactNode } from "react";

export function PageHeader({ eyebrow, title, text, image }: { eyebrow: string; title: string; text?: ReactNode; image?: string }) {
  return (
    <section className="relative overflow-hidden bg-primary-deep text-primary-foreground">
      {image && <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />}
      <div className="absolute inset-0 bg-hero-overlay" />
      <div className="container-x relative py-20 md:py-28">
        <p className="eyebrow fade-up !text-primary-foreground/70">{eyebrow}</p>
        <h1 className="fade-up mt-3 max-w-3xl text-4xl font-semibold md:text-6xl">{title}</h1>
        {text && <p className="fade-up mt-5 max-w-2xl text-lg text-primary-foreground/80">{text}</p>}
      </div>
    </section>
  );
}

export function SectionHeading({ eyebrow, title, text, center }: { eyebrow: string; title: string; text?: string; center?: boolean }) {
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-semibold text-primary-deep md:text-4xl">{title}</h2>
      {text && <p className="mt-4 text-muted-foreground">{text}</p>}
    </div>
  );
}
