import { useState } from "react";
type Props = {
    text?: string;
    url?: string;
    variant?: "light" | "dark";
    size?: "sm" | "md";
};
export default function ShareButtons({ text = "", url, variant = "dark", size = "md" }: Props) {
    const [copied, setCopied] = useState(false);
    const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");
    const isLight = variant === "light";
    const dim = size === "sm" ? 34 : 40;
    const fs = size === "sm" ? 14 : 16;
    function fb() {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank", "width=620,height=520");
    }
    async function copy() {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        }
        catch { }
    }
    function nativeShare() {
        if (navigator.share) {
            navigator.share({ title: "იმედის რუკა × PearTM", text, url: shareUrl }).catch(() => { });
        }
        else {
            copy();
        }
    }
    const base: React.CSSProperties = {
        width: dim, height: dim, borderRadius: 12,
        display: "grid", placeItems: "center", cursor: "pointer",
        fontSize: fs, border: "1px solid",
        transition: "transform .15s, background .2s",
    };
    const style = (bg: string, border: string, color: string): React.CSSProperties => ({
        ...base, background: bg, borderColor: border, color,
    });
    const lightBtn = style("rgba(255,255,255,0.08)", "rgba(255,255,255,0.14)", "#fff");
    return (<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <button title="გააზიარე Facebook-ზე" onClick={fb} style={isLight ? lightBtn : style("#1877F2", "#1877F2", "#fff")} onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"} onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = ""}>
        <svg width={fs + 2} height={fs + 2} viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.88v2.26h3.32l-.53 3.49h-2.79V24C19.61 23.1 24 18.1 24 12.07z"/>
        </svg>
      </button>

      <button title={copied ? "დაკოპირდა!" : "ბმულის კოპირება"} onClick={copy} style={isLight ? lightBtn : style("#fff", "#FFE0E0", "#e63946")} onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"} onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = ""}>
        {copied ? "✓" : (<svg width={fs} height={fs} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.69L9.5 12.38m0 0l-1.42 1.42a3 3 0 104.24 4.24l3-3a3 3 0 00-4.24-4.24m4.93-.81l1.42-1.42a3 3 0 10-4.24-4.24l-3 3a3 3 0 004.24 4.24"/>
          </svg>)}
      </button>

      <button title="გააზიარე" onClick={nativeShare} style={isLight ? lightBtn : style("rgba(230,57,70,0.1)", "#FFE0E0", "#e63946")} onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"} onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = ""}>
        <svg width={fs} height={fs} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"/>
        </svg>
      </button>
    </div>);
}
