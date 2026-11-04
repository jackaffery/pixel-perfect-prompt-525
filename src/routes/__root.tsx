import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AuthProvider } from "@/lib/auth";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Asset Houses Realty – Find Your Place. Build Your Future." },
      { name: "description", content: "Buy, sell, rent and invest in homes, land and new developments with Asset Houses Realty." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Manrope:wght@400;500;600;700&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function TawkToChat() {
  useEffect(() => {
    // Check if script is already added
    if (document.getElementById("tawk-to-script")) return;

    (window as unknown as { Tawk_API: unknown; Tawk_LoadStart: Date }).Tawk_API =
      (window as unknown as { Tawk_API: unknown }).Tawk_API || {};
    (window as unknown as { Tawk_API: unknown; Tawk_LoadStart: Date }).Tawk_LoadStart = new Date();

    // Auto-correct typo from Tawk trigger in iframe/DOM
    const typoPattern = /I wan(?:t)? to by (?:a )?house/gi;
    const replacement = "I want to buy a house";

    const fixTawkText = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE && node.nodeValue && typoPattern.test(node.nodeValue)) {
        node.nodeValue = node.nodeValue.replace(typoPattern, replacement);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        if (el.tagName === "IFRAME") {
          try {
            const doc = (el as HTMLIFrameElement).contentDocument || (el as HTMLIFrameElement).contentWindow?.document;
            if (doc && doc.body) {
              const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT, null);
              let textNode = walker.nextNode();
              while (textNode) {
                if (textNode.nodeValue && typoPattern.test(textNode.nodeValue)) {
                  textNode.nodeValue = textNode.nodeValue.replace(typoPattern, replacement);
                }
                textNode = walker.nextNode();
              }
            }
          } catch {
            // Ignore cross-origin iframe security restrictions if isolated
          }
        }
        for (let i = 0; i < node.childNodes.length; i++) {
          fixTawkText(node.childNodes[i]);
        }
      }
    };

    const observer = new MutationObserver(() => {
      try {
        fixTawkText(document.body);
        const iframes = document.querySelectorAll("iframe[src*='tawk.to'], iframe[title*='chat']");
        iframes.forEach((iframe) => {
          try {
            const doc = (iframe as HTMLIFrameElement).contentDocument || (iframe as HTMLIFrameElement).contentWindow?.document;
            if (doc && doc.body) {
              fixTawkText(doc.body);
            }
          } catch {
            // Ignore cross-origin
          }
        });
      } catch {
        // Safe fallback
      }
    });

    observer.observe(document.body, { childList: true, subtree: true, characterData: true });

    const s1 = document.createElement("script");
    const s0 = document.getElementsByTagName("script")[0];
    s1.id = "tawk-to-script";
    s1.async = true;
    s1.src = "https://embed.tawk.to/6aeb43a99e1b2b3c385b3ed6/1k6jg0k1b";
    s1.charset = "UTF-8";
    s1.setAttribute("crossorigin", "*");

    if (s0 && s0.parentNode) {
      s0.parentNode.insertBefore(s1, s0);
    } else {
      document.head.appendChild(s1);
    }
  }, []);

  return null;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <main className="flex-1">
            <Outlet />
          </main>
          <SiteFooter />
        </div>
        <TawkToChat />
        <Toaster richColors position="top-center" />
      </AuthProvider>
    </QueryClientProvider>
  );
}
