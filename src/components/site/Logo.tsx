import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label="Asset Houses Realty home">
      <span
        className={cn(
          "grid h-10 w-10 place-items-center rounded-sm",
          light ? "bg-primary-foreground text-primary-deep" : "bg-primary text-primary-foreground",
        )}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M3 11.5 12 4l9 7.5" />
          <path d="M5.5 10v9.5h13V10" />
          <path d="M10 19.5v-5h4v5" />
        </svg>
      </span>
      <span className="leading-none">
        <span className={cn("block font-display text-lg font-semibold tracking-wide", light ? "text-primary-foreground" : "text-primary-deep")}>
          ASSET HOUSES
        </span>
        <span className={cn("block text-[0.62rem] font-bold tracking-[0.42em]", light ? "text-primary-foreground/70" : "text-sage")}>
          REALTY
        </span>
      </span>
    </Link>
  );
}
