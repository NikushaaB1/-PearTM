import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, createRootRouteWithContext, useRouter, HeadContent, Scripts, } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AppProvider } from "@/contexts/AppContext";
import Navbar from "@/components/Navbar";
function NotFoundComponent() {
    return (<div className="page" style={{ display: "grid", placeItems: "center", padding: "2rem" }}>
      <div style={{ textAlign: "center", maxWidth: 400 }}>
        <p style={{ fontFamily: "var(--font-display)", fontSize: "5rem", fontWeight: 600, color: "var(--ink)", margin: 0, lineHeight: 1 }}>404</p>
        <h2 className="e-heading" style={{ fontSize: 20, margin: "16px 0 24px" }}>გვერდი ვერ მოიძებნა</h2>
        <a href="/" className="e-btn e-btn--primary">მთავარი</a>
      </div>
    </div>);
}
function ErrorComponent({ error, reset }: {
    error: Error;
    reset: () => void;
}) {
    console.error(error);
    const router = useRouter();
    useEffect(() => {
        reportLovableError(error, { boundary: "tanstack_root_error_component" });
    }, [error]);
    return (<div className="page" style={{ display: "grid", placeItems: "center", padding: "2rem" }}>
      <div style={{ textAlign: "center", maxWidth: 400 }}>
        <h2 className="e-heading" style={{ fontSize: 20, marginBottom: 24 }}>გვერდი ვერ ჩაიტვირთა</h2>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <button type="button" onClick={() => { router.invalidate(); reset(); }} className="e-btn e-btn--primary">
            სცადე თავიდან
          </button>
          <a href="/" className="e-btn e-btn--outline-dark">მთავარი</a>
        </div>
      </div>
    </div>);
}
export const Route = createRootRouteWithContext<{
    queryClient: QueryClient;
}>()({
    head: () => ({
        meta: [
            { charSet: "utf-8" },
            { name: "viewport", content: "width=device-width, initial-scale=1" },
            { title: "იმედის რუკა × PearTM" },
            { name: "description", content: "ქართული ქველმოქმედი პლატფორმა — დაეხმარე ბავშვებს განკურნებაში. ნახე ვის სჭირდება დახმარება საქართველოს რუკაზე." },
            { name: "theme-color", content: "#3A6B85" },
            { property: "og:type", content: "website" },
            { property: "og:site_name", content: "იმედის რუკა × PearTM" },
            { property: "og:title", content: "იმედის რუკა × PearTM — დავეხმაროთ ბავშვებს" },
            { property: "og:description", content: "ნახე ვის სჭირდება დახმარება საქართველოს რუკაზე და დაეხმარე. ყოველი გაზიარება სიცოცხლეს არჩენს." },
            { property: "og:image", content: "/hero-bg.png" },
            { property: "og:locale", content: "ka_GE" },
            { name: "twitter:card", content: "summary_large_image" },
            { name: "twitter:title", content: "იმედის რუკა × PearTM — დავეხმაროთ ბავშვებს" },
            { name: "twitter:description", content: "ნახე ვის სჭირდება დახმარება და დაეხმარე. ყოველი გაზიარება მნიშვნელოვანია." },
            { name: "twitter:image", content: "/hero-bg.png" },
        ],
        links: [
            { rel: "stylesheet", href: appCss },
            { rel: "preconnect", href: "https://fonts.googleapis.com" },
            { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
            { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Noto+Sans+Georgian:wght@300;400;500;600;700&family=Noto+Serif+Georgian:wght@400;500;600;700;800&display=swap" },
            { rel: "stylesheet", href: "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" },
        ],
    }),
    shellComponent: RootShell,
    component: RootComponent,
    notFoundComponent: NotFoundComponent,
    errorComponent: ErrorComponent,
});
function RootShell({ children }: {
    children: ReactNode;
}) {
    return (<html lang="ka" data-color-theme="hope">
      <head>
        <HeadContent />
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var chosen=localStorage.getItem("colorThemeChosen");var t=chosen?(localStorage.getItem("colorTheme")||"hope"):"hope";var m={hope:["#3A6B85","#558FA8","#C4564A","#9A3D34","#F6F0E8","#EDE5D8"],ocean:["#3D5F94","#5A82BE","#C44B50","#9A3238","#EEF2F8","#E4EBF5"],rose:["#9B4D6A","#C06B8A","#D4536F","#A83250","#FAF0F4","#F3E4EA"],forest:["#2D6A4F","#40916C","#C44B50","#9A3238","#EDF5F0","#E2EEE6"],sunset:["#B85C28","#D47840","#D4533A","#A83220","#FBF4EC","#F5E8D8"],royal:["#4A3B8F","#6B5BB5","#C44B50","#9A3238","#F2EEF9","#E9E3F4"]};var c=m[t]||m.hope;var r=document.documentElement;r.dataset.colorTheme=t;r.style.setProperty("--accent",c[0]);r.style.setProperty("--accent-light",c[1]);r.style.setProperty("--sos",c[2]);r.style.setProperty("--sos-deep",c[3]);r.style.setProperty("--cream",c[4]);r.style.setProperty("--cream-warm",c[5]);}catch(e){}})();` }} />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>);
}
function RootComponent() {
    const { queryClient } = Route.useRouteContext();
    return (<QueryClientProvider client={queryClient}>
      <AppProvider>
        <div className="min-h-screen transition-colors" style={{ background: "var(--cream)" }}>
          <Navbar />
          <Outlet />
        </div>
      </AppProvider>
    </QueryClientProvider>);
}
