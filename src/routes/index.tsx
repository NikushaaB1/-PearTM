import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase, type SiteVideo } from "@/lib/supabase";

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: [{ title: "იმედის რუკა × PearTM" }],
  }),
});

/* ── scroll-reveal ───────────────────────────────────── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setOn(true); },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, on };
}

/* ── design tokens ───────────────────────────────────── */
const C = {
  blue:    "#5B8FFF",
  blue2:   "#3D70FF",
  light:   "#EEF4FF",
  lighter: "#F5F8FF",
  white:   "#FFFFFF",
  text:    "#1A2340",
  muted:   "#6B82A0",
  glass:   "rgba(255,255,255,0.65)",
  gBorder: "rgba(255,255,255,0.85)",
  shadow:  "0 8px 32px rgba(91,143,255,0.12), 0 2px 8px rgba(91,143,255,0.06)",
};

/* ════════════════════════════════════════════════════════ */
function HomePage() {
  const s2 = useReveal();
  const s3 = useReveal();
  const s4 = useReveal();

  return (
    <main style={{ fontFamily: "'Noto Sans Georgian','Inter',sans-serif", overflowX: "hidden", background: C.white }}>

      {/* ── §1 HERO ──────────────────────────────────────── */}
      <section style={{
        minHeight: "calc(100vh - 68px)",
        position: "relative", overflow: "hidden",
        display: "flex", alignItems: "flex-end",
      }}>
        {/* Full-bleed background */}
        <img src="/hero-bg.png?v=2" alt=""
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} />

        {/* Bottom fade to white */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, transparent 45%, rgba(245,248,255,0.97) 100%)",
        }} />

        {/* CTA buttons bottom-left */}
        <div style={{
          position: "relative", zIndex: 2,
          width: "100%", maxWidth: 1080, margin: "0 auto",
          padding: "0 2rem 4rem",
          animation: "slideLeft .8s cubic-bezier(.4,0,.2,1) both",
        }}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link to="/map" style={{
              padding: "14px 30px", borderRadius: 14,
              background: C.blue, color: C.white,
              fontWeight: 700, fontSize: 15, textDecoration: "none",
              boxShadow: `0 8px 28px ${C.blue}50`,
              transition: "transform .25s, box-shadow .25s",
              fontFamily: "'Noto Sans Georgian','Inter',sans-serif",
            }}
              onMouseEnter={e => Object.assign((e.currentTarget as HTMLElement).style, { transform: "translateY(-2px)", boxShadow: `0 12px 36px ${C.blue}65` })}
              onMouseLeave={e => Object.assign((e.currentTarget as HTMLElement).style, { transform: "", boxShadow: `0 8px 28px ${C.blue}50` })}>
              🗺️ &nbsp;რუკის ნახვა
            </Link>
            <Link to="/request" style={{
              padding: "14px 30px", borderRadius: 14,
              background: C.glass, backdropFilter: "blur(14px)",
              border: `1.5px solid ${C.gBorder}`,
              color: C.blue, fontWeight: 700, fontSize: 15, textDecoration: "none",
              boxShadow: C.shadow,
              transition: "transform .25s",
              fontFamily: "'Noto Sans Georgian','Inter',sans-serif",
            }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = ""}>
              დახმარების თხოვნა →
            </Link>
          </div>
        </div>
      </section>

      {/* ── §2 VIDEOS ─────────────────────────────────────── */}
      <VideoSection s2ref={s2.ref} s2on={s2.on} />

      {/* ── §3 REASSURANCE ───────────────────────────────── */}
      <section style={{ padding: "80px 2rem", background: C.light, position: "relative", overflow: "hidden" }}>
        <Blob style={{ top: "0%",    left: "-6%",  width: 340, height: 340, background: "rgba(91,143,255,0.07)" }} />
        <Blob style={{ bottom: "0%", right: "-6%", width: 280, height: 280, background: "rgba(91,143,255,0.07)" }} d="2.5s" />

        <div ref={s3.ref} style={{ maxWidth: 960, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div style={{ textAlign: "center", marginBottom: 52,
            transition: "all .6s cubic-bezier(.4,0,.2,1)",
            opacity: s3.on ? 1 : 0, transform: s3.on ? "none" : "translateY(24px)" }}>
            <h2 style={{
              fontFamily: "'Noto Serif Georgian',serif",
              fontSize: "clamp(1.8rem,4vw,2.8rem)",
              fontWeight: 700, color: C.text, marginBottom: 14,
            }}>
              შენ მარტო <span style={{ color: C.blue }}>არ ხარ</span>
            </h2>
            <p style={{ color: C.muted, fontSize: 16, lineHeight: 1.75 }}>
              ყოველი შეკითხვა მნიშვნელოვანია. ჩვენ თქვენს გვერდით ვართ.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 18 }}>
            {[
              { emoji: "🗺️", title: "ინტერაქტიული რუკა",   desc: "ნახეთ ვის სჭირდება დახმარება — საქართველოს ყველა კუთხეში.",  delay: 0   },
              { emoji: "💊", title: "სამედიცინო დახმარება", desc: "წამლების პოვნიდან სამედიცინო ჩარევამდე — ჩვენ გვერდით ვართ.", delay: 120 },
              { emoji: "🤝", title: "საზოგადოება",          desc: "340+ ადამიანი, ვინც ყოველდღე ირჩევს სიკეთეს.",               delay: 240 },
            ].map((card) => (
              <div key={card.title} style={{
                background: C.glass,
                backdropFilter: "blur(20px)",
                border: `1px solid ${C.gBorder}`,
                borderRadius: 22, padding: "24px 22px",
                boxShadow: C.shadow,
                transition: "transform .35s cubic-bezier(.4,0,.2,1), opacity .6s, translate .6s",
                transitionDelay: `${card.delay}ms`,
                opacity: s3.on ? 1 : 0,
                translate: s3.on ? "0 0" : "0 28px",
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; }}>
                <div style={{
                  width: 50, height: 50, borderRadius: "50%",
                  background: `linear-gradient(135deg,${C.blue},${C.blue2})`,
                  display: "grid", placeItems: "center",
                  fontSize: 24, marginBottom: 16,
                  boxShadow: `0 6px 20px ${C.blue}35`,
                }}>
                  {card.emoji}
                </div>
                <h3 style={{
                  fontFamily: "'Noto Serif Georgian',serif",
                  fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 8,
                }}>
                  {card.title}
                </h3>
                <p style={{ color: C.muted, fontSize: 13, lineHeight: 1.75, margin: 0 }}>
                  {card.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── §3.5 SOS ──────────────────────────────────────── */}
      <SOSSection s4ref={s4.ref} s4on={s4.on} />

      {/* ── §4 FOOTER ─────────────────────────────────────── */}
      <footer style={{
        background: "#0F1726",
        borderTop: `3px solid ${C.blue}`,
        padding: "56px 2rem 32px",
        position: "relative", overflow: "hidden",
      }}>
        <Blob style={{ top: "20%", left: "5%",   width: 280, height: 280, background: "rgba(91,143,255,0.05)" }} />
        <Blob style={{ bottom: "10%", right: "5%", width: 220, height: 220, background: "rgba(91,143,255,0.05)" }} d="2s" />

        <div style={{ maxWidth: 1080, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div className="footer-grid" style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr",
            gap: "2.5rem", marginBottom: 48,
          }}>
            {/* Brand */}
            <div>
              <div style={{ marginBottom: 16, display: "inline-block" }}>
                <div style={{
                  background: "#F5F0E4", borderRadius: 16,
                  padding: "6px 18px 6px 10px",
                  border: "1px solid rgba(180,160,100,0.25)",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                  display: "inline-flex", alignItems: "center",
                }}>
                  <img src="/logo.png" alt="იმედის რუკა × PearTM"
                    style={{ height: 44, width: "auto", objectFit: "contain" }} />
                </div>
              </div>
              <p style={{ color: "#5A6E8C", fontSize: 13, lineHeight: 1.8, maxWidth: 260, marginBottom: 20 }}>
                ქართული ქველმოქმედი პლატფორმა, სადაც ყოველი ბავშვი პოულობს მხარდაჭერას.
              </p>
              <a href="https://kisa.ge" target="_blank" rel="noreferrer" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "9px 18px", borderRadius: 12,
                background: C.blue, color: "#fff", fontSize: 13, fontWeight: 700,
                textDecoration: "none", boxShadow: `0 4px 16px ${C.blue}40`,
              }}>
                💙 kisa.ge
              </a>
            </div>

            <FCol title="ნავიგაცია" items={[
              { label: "მთავარი",  href: "/" },
              { label: "რუკა",     href: "/map" },
              { label: "დახმარება", href: "/request" },
              { label: "პროფილი",  href: "/profile" },
            ]} />

            <FCol title="კონტაქტი" items={[
              { label: "info@imedisruka.ge", href: "mailto:info@imedisruka.ge" },
              { label: "kisa.ge",            href: "https://kisa.ge" },
            ]} />
          </div>

          <div style={{ height: 1, background: "rgba(255,255,255,0.06)", marginBottom: 24 }} />

          <div style={{
            display: "flex", justifyContent: "space-between",
            alignItems: "center", flexWrap: "wrap", gap: 8,
          }}>
            <p style={{ color: "#3A4E6A", fontSize: 12, margin: 0 }}>
              © 2026 იმედის რუკა × PearTM
            </p>
            <p style={{ color: "#3A4E6A", fontSize: 12, margin: 0, display: "flex", alignItems: "center", gap: 5 }}>
              Made with 💙 by{" "}
              <span style={{ color: C.blue, fontWeight: 700, fontFamily: "'Inter',sans-serif" }}>PearTeam</span>
            </p>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes slideLeft  { from{opacity:0;transform:translateX(-28px)} to{opacity:1;transform:none} }
        @keyframes slideRight { from{opacity:0;transform:translateX(28px)}  to{opacity:1;transform:none} }
        @keyframes floatY { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-16px)} }
        @media(max-width:768px){
          .hero-grid  { grid-template-columns:1fr!important; }
          .hero-grid>div:last-child { display:none!important; }
          .footer-grid{ grid-template-columns:1fr 1fr!important; }
        }
        @media(max-width:480px){
          .footer-grid{ grid-template-columns:1fr!important; }
        }
      `}</style>
    </main>
  );
}

/* ── VideoSection ────────────────────────────────────── */
/* ── SOS appeals ─────────────────────────────────────── */
const SOS_CASES = [
  {
    pos: 3,
    family: "კილაძეების ოჯახი",
    address: "ქ. თბილისი, ვარკეთილი 3, მე-4 მ/რ, კორპუსი 403",
    body: "კეთილო ადამიანო, დაუყოვნებლივ გააზიარე ეს პოსტი! დაეხმარე შენს მეგობრებს, იპოვონ უფლის გზა! 🧡 რაც უფრო მეტ ადამიანს ეცოდინება ამის შესახებ, მით უფრო მალე შეგროვდება საჭირო თანხა. არ არსებობს მცირედი დახმარება. 🇬🇪",
    purpose: "კილაძეების ოჯახი 2",
  },
  {
    pos: 4,
    family: "მაღრაძეების ოჯახი",
    address: "ქ. ბოლნისი, თამარ მეფის ქ. №39",
    body: "ამ ჯოჯოხეთისგან თავის დაღწევის ერთადერთი გზა — ურთულესი ოპერაციაა საზღვარგარეთ. უნდა მოხდეს იმპლანტის ჩასმა ხერხემალში. სამინისტრომ 27 000 ლარით დააფინანსა, დანარჩენს დედა ამატებს. 🆘 აკლია 6 000 ლარი — ეს გადაწყვეტს, თეკლე თანატოლებთან ერთად ირბენს თუ ეტლიდან ადევნებს თვალს თამაშს. არ არსებობს მცირედი დახმარება. 🇬🇪",
    purpose: "მაღრაძეების ოჯახი",
  },
];

const BANK_ACCOUNTS = [
  { bank: "საქართველოს ბანკი", num: "GE64BG0000000470458000" },
  { bank: "თიბისი ბანკი",      num: "GE15TB7194336080100003" },
  { bank: "ლიბერთი ბანკი",     num: "GE42LB0115113036665000" },
];

function SOSSection({ s4ref, s4on }: { s4ref: React.RefObject<HTMLDivElement | null>; s4on: boolean }) {
  const [videos, setVideos] = useState<SiteVideo[]>([]);

  useEffect(() => {
    supabase.from("videos").select("*").order("position")
      .then(({ data }) => { if (data) setVideos(data as SiteVideo[]); });
  }, []);

  return (
    <section style={{ padding: "80px 2rem", background: "#FFF7F7", position: "relative", overflow: "hidden" }}>
      <div ref={s4ref} style={{ maxWidth: 1080, margin: "0 auto" }}>
        {/* Header */}
        <div style={{
          textAlign: "center", marginBottom: 56,
          transition: "all .6s cubic-bezier(.4,0,.2,1)",
          opacity: s4on ? 1 : 0, transform: s4on ? "none" : "translateY(24px)",
        }}>
          <span style={{
            display: "inline-block", background: "rgba(230,57,70,0.12)",
            border: "1px solid rgba(230,57,70,0.3)", borderRadius: 50,
            padding: "6px 20px", fontSize: 13, fontWeight: 800,
            color: "#e63946", letterSpacing: "0.2em", marginBottom: 16,
            fontFamily: "'Inter',sans-serif",
          }}>
            🆘 SOS
          </span>
          <h2 style={{
            fontFamily: "'Noto Serif Georgian',serif",
            fontSize: "clamp(1.7rem,3.5vw,2.4rem)",
            fontWeight: 700, color: "#1A2340", margin: 0,
          }}>
            გადაუდებელი დახმარება სჭირდებათ
          </h2>
        </div>

        {/* SOS cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 48 }}>
          {SOS_CASES.map((c, i) => {
            const vid = videos.find(v => v.position === c.pos);
            const reversed = i % 2 === 1;
            return (
              <div key={c.pos} className="sos-row" style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 32, alignItems: "center",
                direction: reversed ? "rtl" : "ltr",
                transition: "all .6s cubic-bezier(.4,0,.2,1)",
                transitionDelay: `${i * 150}ms`,
                opacity: s4on ? 1 : 0,
                transform: s4on ? "none" : `translateX(${reversed ? 40 : -40}px)`,
              }}>
                {/* Video */}
                <div style={{ direction: "ltr" }}>
                  <div style={{
                    borderRadius: 24, overflow: "hidden",
                    boxShadow: "0 16px 48px rgba(230,57,70,0.18)",
                    border: "1px solid rgba(230,57,70,0.15)",
                    aspectRatio: "16/9", background: "#000", position: "relative",
                  }}>
                    {vid?.url ? (
                      <video src={vid.url} controls style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{
                        width: "100%", height: "100%",
                        display: "flex", flexDirection: "column",
                        alignItems: "center", justifyContent: "center", gap: 8,
                        background: "rgba(230,57,70,0.06)", color: "#e6394680",
                      }}>
                        <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
                          <path strokeLinecap="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"/>
                        </svg>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>ვიდეო {c.pos}</span>
                        <span style={{ fontSize: 11, opacity: 0.6 }}>ადმინ პანელიდან დაამატეთ</span>
                      </div>
                    )}
                    <div style={{
                      position: "absolute", top: 12, left: 12,
                      background: "#e63946", color: "#fff",
                      fontSize: 11, fontWeight: 800, letterSpacing: "0.15em",
                      padding: "4px 12px", borderRadius: 50,
                      boxShadow: "0 4px 12px rgba(230,57,70,0.4)",
                      fontFamily: "'Inter',sans-serif",
                    }}>🆘 SOS</div>
                  </div>
                </div>

                {/* Text */}
                <div style={{ direction: "ltr" }}>
                  <h3 style={{
                    fontFamily: "'Noto Serif Georgian',serif",
                    fontSize: 22, fontWeight: 700, color: "#1A2340", marginBottom: 12,
                  }}>
                    {c.family}
                  </h3>
                  <p style={{ color: "#5A6E8C", fontSize: 14, lineHeight: 1.8, marginBottom: 16 }}>
                    {c.body}
                  </p>

                  {/* Address */}
                  <div style={{
                    display: "flex", alignItems: "flex-start", gap: 8,
                    background: "rgba(230,57,70,0.06)",
                    border: "1px solid rgba(230,57,70,0.15)",
                    borderRadius: 14, padding: "10px 14px", marginBottom: 16,
                  }}>
                    <span style={{ fontSize: 15 }}>📍</span>
                    <p style={{ color: "#4A5568", fontSize: 13, margin: 0, lineHeight: 1.5 }}>{c.address}</p>
                  </div>

                  {/* Bank accounts */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {BANK_ACCOUNTS.map(b => (
                      <div key={b.num} style={{
                        display: "flex", alignItems: "center", gap: 10,
                        background: "#fff", border: "1px solid #FFE0E0",
                        borderRadius: 12, padding: "8px 12px",
                      }}>
                        <span style={{ fontSize: 12, color: "#6B82A0", fontWeight: 600, minWidth: 110 }}>{b.bank}</span>
                        <span style={{
                          fontSize: 12, color: "#1A2340", fontWeight: 700,
                          fontFamily: "'Inter',monospace", flex: 1,
                        }}>{b.num}</span>
                        <button onClick={() => navigator.clipboard?.writeText(b.num)} style={{
                          background: "rgba(230,57,70,0.1)", border: "none",
                          borderRadius: 8, padding: "4px 8px", cursor: "pointer",
                          fontSize: 11, color: "#e63946", fontWeight: 600,
                        }}>📋</button>
                      </div>
                    ))}
                    <p style={{ color: "#8B9BB4", fontSize: 12, margin: "4px 0 0" }}>
                      👉 დანიშნულება: <strong style={{ color: "#e63946" }}>{c.purpose}</strong>
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @media(max-width:768px){
          .sos-row { grid-template-columns:1fr !important; direction:ltr !important; }
        }
      `}</style>
    </section>
  );
}

function VideoSection({ s2ref, s2on }: { s2ref: React.RefObject<HTMLDivElement | null>; s2on: boolean }) {
  const [videos, setVideos] = useState<SiteVideo[]>([]);

  useEffect(() => {
    supabase.from("videos").select("*").order("position")
      .then(({ data }) => { if (data) setVideos(data as SiteVideo[]); });
  }, []);

  const v1 = videos.find(v => v.position === 1);
  const v2 = videos.find(v => v.position === 2);

  return (
    <section style={{ padding: "80px 2rem", background: C.white }}>
      <div ref={s2ref} style={{ maxWidth: 1100, margin: "0 auto" }}>

        <div style={{
          textAlign: "center", marginBottom: 48,
          transition: "all .6s cubic-bezier(.4,0,.2,1)",
          opacity: s2on ? 1 : 0, transform: s2on ? "none" : "translateY(24px)",
        }}>
          <h2 style={{
            fontFamily: "'Noto Serif Georgian',serif",
            fontSize: "clamp(1.6rem,3vw,2.2rem)",
            fontWeight: 700, color: C.text, marginBottom: 10,
          }}>
            საქართველოში გავრცელებული დაავადებები
          </h2>
          <p style={{ color: C.muted, fontSize: 15 }}>ვიდეო ისტორიები</p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(420px,1fr))",
          gap: 24,
        }}>
          {[{ slot: v1, n: 1, delay: 0 }, { slot: v2, n: 2, delay: 140 }].map(({ slot, n, delay }) => (
            <div key={n} style={{
              borderRadius: 24, overflow: "hidden",
              boxShadow: C.shadow,
              border: `1px solid ${C.gBorder}`,
              transition: "opacity .6s, translate .6s",
              transitionDelay: `${delay}ms`,
              opacity: s2on ? 1 : 0,
              translate: s2on ? "0 0" : "0 28px",
              aspectRatio: "16/9",
              background: `${C.blue}08`,
            }}>
              {slot?.url ? (
                <video
                  src={slot.url}
                  controls
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  title={slot.title ?? `ვიდეო ${n}`}
                />
              ) : (
                <div style={{
                  width: "100%", height: "100%",
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                  gap: 10, color: `${C.blue}60`,
                }}>
                  <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.3}>
                    <path strokeLinecap="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"/>
                  </svg>
                  <p style={{ fontSize: 13, fontWeight: 600, margin: 0, color: C.muted }}>ვიდეო {n}</p>
                  <p style={{ fontSize: 11, margin: 0, color: `${C.muted}88` }}>ადმინ პანელიდან დაამატეთ</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── helpers ─────────────────────────────────────────── */
function Blob({ style, d = "0s" }: { style: React.CSSProperties; d?: string }) {
  return (
    <div style={{
      position: "absolute", borderRadius: "50%",
      filter: "blur(52px)", pointerEvents: "none",
      animation: `floatY 9s ease-in-out ${d} infinite`,
      ...style,
    }} />
  );
}

function FCol({ title, items }: { title: string; items: { label: string; href: string }[] }) {
  return (
    <div>
      <p style={{
        fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase",
        fontWeight: 700, color: "#3A5E8A", marginBottom: 14,
        fontFamily: "'Inter',sans-serif",
      }}>
        {title}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {items.map(l => (
          <a key={l.label} href={l.href} style={{
            color: "#5A7090", fontSize: 13, textDecoration: "none",
            transition: "color .2s",
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#fff"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#5A7090"; }}>
            {l.label}
          </a>
        ))}
      </div>
    </div>
  );
}
