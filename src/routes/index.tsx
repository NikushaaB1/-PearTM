import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase, type SiteVideo } from "@/lib/supabase";
import { fetchSiteStats, type SiteStats } from "@/lib/platform";
export const Route = createFileRoute("/")({
    component: HomePage,
    head: () => ({
        meta: [{ title: "იმედის რუკა × PearTM" }],
    }),
});
function useReveal() {
    const ref = useRef<HTMLDivElement>(null);
    const [on, setOn] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el)
            return;
        const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting)
            setOn(true); }, { threshold: 0.1 });
        obs.observe(el);
        return () => obs.disconnect();
    }, []);
    return { ref, on };
}
const C = {
    ink: "#141B2D",
    inkSoft: "#2C3548",
    muted: "#6B7280",
    faint: "#9CA3AF",
    cream: "#FAFAF8",
    creamWarm: "#F7F5F0",
    accent: "#4A6FA5",
    accentLight: "#6B8FC4",
    line: "rgba(20,27,45,0.08)",
    lineStrong: "rgba(20,27,45,0.14)",
    sos: "#B5454A",
    sosSoft: "#FDF8F8",
    white: "#FFFFFF",
};
function HomePage() {
    const s2 = useReveal();
    const s3 = useReveal();
    const s4 = useReveal();
    const s5 = useReveal();
    return (<main style={{ fontFamily: "'Noto Sans Georgian','Inter',sans-serif", overflowX: "hidden", background: "transparent" }}>

      
      <section className="hero-premium">
        <img src="/hero-bg.png?v=2" alt="" className="hero-premium__bg" />
        <div className="hero-premium__overlay" />
        <div className="hero-premium__fade" />
        <div className="hero-premium__orbs">
          <div className="glow-orb glow-orb--accent" />
          <div className="glow-orb glow-orb--sos" />
        </div>

        <div className="hero-premium__content">
          <div className="hero-premium__inner" style={{ animation: "fadeUp 1s cubic-bezier(.4,0,.2,1) both" }}>
            <span className="pill pill--light" style={{ marginBottom: 24, animation: "fadeUp .8s .05s both" }}>
              ✦ ქველმოქმედი პლატფორმა
            </span>

            <h1 className="e-heading e-heading--light" style={{
                fontSize: "clamp(2.4rem, 6vw, 4rem)",
                margin: "0 0 24px",
                animation: "fadeUp .9s .12s both",
            }}>
              დავეხმაროთ <em>ბავშვებს</em> განკურნებაში
            </h1>

            <p className="hero-premium__lead" style={{ animation: "fadeUp .9s .22s both" }}>
              ნახეთ ვის სჭირდება დახმარება საქართველოს რუკაზე.
              ყოველი გაზიარება და შემოწირულობა სიცოცხლეს არჩენს.
            </p>

            <div className="hero-premium__actions" style={{ animation: "fadeUp .9s .32s both" }}>
              <Link to="/map" className="e-btn e-btn--white e-btn--lg">რუკის ნახვა</Link>
              <Link to="/forum" className="e-btn e-btn--outline e-btn--lg">სიკეთის ფორუმი</Link>
            </div>

            <div className="hero-premium__stats" style={{ animation: "fadeUp .9s .42s both" }}>
              <HeroStats />
            </div>
          </div>
        </div>
      </section>

      
      <VideoSection s2ref={s2.ref} s2on={s2.on}/>

      
      <section className="e-section e-section--warm" style={{ position: "relative" }}>
        <div ref={s3.ref} className="e-container" style={{ position: "relative", zIndex: 1 }}>
          <div style={{ textAlign: "center", marginBottom: 64,
            transition: "all .7s cubic-bezier(.4,0,.2,1)",
            opacity: s3.on ? 1 : 0, transform: s3.on ? "none" : "translateY(20px)" }}>
            <p className="e-label">რატომ ჩვენ</p>
            <h2 className="e-heading" style={{ fontSize: "clamp(1.7rem,3.5vw,2.5rem)", marginBottom: 16 }}>
              შენ მარტო <em>არ ხარ</em>
            </h2>
            <p style={{ color: C.muted, fontSize: 15, lineHeight: 1.85, maxWidth: 480, margin: "0 auto", fontWeight: 300 }}>
              ყოველი შეკითხვა მნიშვნელოვანია. ჩვენ თქვენს გვერდით ვართ.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 20 }}>
            {[
            { num: "01", title: "ინტერაქტიული რუკა", desc: "ნახეთ ვის სჭირდება დახმარება — საქართველოს ყველა კუთხეში.", delay: 0 },
            { num: "02", title: "სამედიცინო დახმარება", desc: "წამლების პოვნიდან სამედიცინო ჩარევამდე — ჩვენ გვერდით ვართ.", delay: 100 },
            { num: "03", title: "საზოგადოება", desc: "340-ზე მეტი ადამიანი, ვინც ყოველდღე ირჩევს სიკეთეს.", delay: 200 },
        ].map((card) => (<div key={card.title} className="e-card" style={{
                transitionDelay: `${card.delay}ms`,
                opacity: s3.on ? 1 : 0,
                translate: s3.on ? "0 0" : "0 20px",
                transition: "opacity .7s, translate .7s, border-color .4s, box-shadow .4s",
            }}>
                <p className="e-card__num">{card.num}</p>
                <h3 style={{
                fontFamily: "'Noto Serif Georgian',serif",
                fontSize: 18, fontWeight: 600, color: C.ink, marginBottom: 10,
            }}>
                  {card.title}
                </h3>
                <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.8, margin: 0, fontWeight: 300 }}>
                  {card.desc}
                </p>
              </div>))}
          </div>
        </div>
      </section>

      
      <SOSSection s4ref={s4.ref} s4on={s4.on}/>

      
      <ImpactSection s5ref={s5.ref} s5on={s5.on}/>

      
      <section className="e-section e-section--dark" style={{ textAlign: "center", padding: "88px 2rem" }}>
        <div className="e-container--narrow">
          <p className="e-label e-label--light">შემოუერთდი</p>
          <h2 className="e-heading e-heading--light" style={{ fontSize: "clamp(1.5rem,3vw,2.2rem)", margin: "0 0 16px" }}>
            შენც შეგიძლია გადამწყვეტი იყო
          </h2>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 15, lineHeight: 1.85, margin: "0 0 40px", fontWeight: 300 }}>
            ერთი გაზიარება, ერთი შემოწირულობა — ეს შეიძლება იყოს ვინმეს გადარჩენა.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/map" className="e-btn e-btn--white">რუკის ნახვა</Link>
            <Link to="/forum" className="e-btn e-btn--outline">სიკეთის ფორუმი</Link>
          </div>
        </div>
      </section>

      
      <footer style={{
            background: C.ink,
            borderTop: `1px solid rgba(255,255,255,0.06)`,
            padding: "72px 2rem 40px",
        }}>
        <div className="e-container">
          <div className="footer-grid" style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr",
            gap: "3rem", marginBottom: 56,
        }}>
            <div>
              <img src="/logo.png" alt="იმედის რუკა × PearTM" style={{ height: 40, width: "auto", objectFit: "contain", marginBottom: 20, opacity: 0.9 }}/>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, lineHeight: 1.85, maxWidth: 280, marginBottom: 24, fontWeight: 300 }}>
                ქართული ქველმოქმედი პლატფორმა, სადაც ყოველი ბავშვი პოულობს მხარდაჭერას.
              </p>
              <a href="https://kisa.ge" target="_blank" rel="noreferrer" className="e-btn e-btn--outline" style={{ fontSize: 13, padding: "10px 22px" }}>
                kisa.ge
              </a>
            </div>

            <FCol title="ნავიგაცია" items={[
            { label: "მთავარი", href: "/" },
            { label: "რუკა", href: "/map" },
            { label: "სიკეთის ფორუმი", href: "/forum" },
            { label: "ჩვენ შესახებ", href: "/about" },
            { label: "დახმარება", href: "/request" },
        ]}/>

            <FCol title="კონტაქტი" items={[
            { label: "info@imedisruka.ge", href: "mailto:info@imedisruka.ge" },
            { label: "kisa.ge", href: "https://kisa.ge" },
        ]}/>
          </div>

          <div style={{ height: 1, background: "rgba(255,255,255,0.06)", marginBottom: 28 }}/>

          <div style={{
            display: "flex", justifyContent: "space-between",
            alignItems: "center", flexWrap: "wrap", gap: 8,
        }}>
            <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 12, margin: 0, fontWeight: 300 }}>
              © 2026 იმედის რუკა × PearTM
            </p>
            <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 12, margin: 0, fontWeight: 300 }}>
              PearTeam
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
          main section { padding-left:1.1rem!important; padding-right:1.1rem!important; }
        }
        @media(max-width:480px){
          .footer-grid{ grid-template-columns:1fr!important; }
          main section { padding-top:54px!important; padding-bottom:54px!important; }
        }
      `}</style>
    </main>);
}

function HeroStats() {
    const [stats, setStats] = useState<SiteStats | null>(null);
    useEffect(() => { fetchSiteStats().then(s => setStats(s)); }, []);
    const items = [
        { num: stats?.activeCases ?? 0, label: "აქტიური შემთხვევა" },
        { num: stats?.verifiedPosts ?? 0, label: "გადამოწმებული" },
        { num: `${(stats?.totalRaised ?? 0).toLocaleString()} ₾`, label: "შეგროვებული" },
    ];
    return (
        <>
            {items.map(s => (
                <div key={s.label} className="e-stat">
                    <span className="e-stat__val">{s.num}</span>
                    <span className="e-stat__lbl">{s.label}</span>
                </div>
            ))}
        </>
    );
}

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
    { bank: "თიბისი ბანკი", num: "GE15TB7194336080100003" },
    { bank: "ლიბერთი ბანკი", num: "GE42LB0115113036665000" },
];
function ImpactSection({ s5ref, s5on }: {
    s5ref: React.RefObject<HTMLDivElement | null>;
    s5on: boolean;
}) {
    const [stats, setStats] = useState<SiteStats | null>(null);
    useEffect(() => { fetchSiteStats().then(s => setStats(s)); }, []);
    const items = [
        { value: (stats?.totalRequests ?? 0) + (stats?.totalPosts ?? 0), label: "მოთხოვნა დარეგისტრირდა", suffix: "" },
        { value: stats?.completedRequests ?? 0, label: "წარმატებით დასრულდა", suffix: "" },
        { value: stats?.totalRaised ?? 0, label: "ლარი შეგროვდა", suffix: "₾" },
        { value: stats?.activeVolunteers ?? 0, label: "აქტიური დამხმარე", suffix: "" },
    ];
    return (<section className="e-section e-section--white" style={{ borderTop: `1px solid ${C.line}` }}>
      <div ref={s5ref} className="e-container">
        <div style={{
            textAlign: "center", marginBottom: 64,
            transition: "all .7s cubic-bezier(.4,0,.2,1)",
            opacity: s5on ? 1 : 0, transform: s5on ? "none" : "translateY(20px)",
        }}>
          <p className="e-label">ჩვენი გავლენა</p>
          <h2 className="e-heading" style={{ fontSize: "clamp(1.6rem,3vw,2.3rem)", margin: 0 }}>
            ერთად <em>ვცვლით</em> ცხოვრებებს
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 20 }}>
          {items.map((it, i) => (<div key={it.label} className="e-card" style={{
                textAlign: "center",
                padding: "44px 28px",
                transitionDelay: `${i * 80}ms`,
                opacity: s5on ? 1 : 0, transform: s5on ? "none" : "translateY(20px)",
                transition: "opacity .7s, transform .7s, box-shadow .4s",
            }}>
              <p style={{
                fontFamily: "'Noto Serif Georgian',serif",
                fontSize: "clamp(2.2rem,4vw,3rem)", fontWeight: 700, color: C.ink,
                margin: 0, lineHeight: 1,
            }}>
                {it.value.toLocaleString()}{it.suffix}
              </p>
              <p style={{ fontSize: 12, color: C.muted, margin: "12px 0 0", lineHeight: 1.5, fontWeight: 300, letterSpacing: "0.02em" }}>
                {it.label}
              </p>
            </div>))}
        </div>
      </div>
    </section>);
}
function SOSSection({ s4ref, s4on }: {
    s4ref: React.RefObject<HTMLDivElement | null>;
    s4on: boolean;
}) {
    const [videos, setVideos] = useState<SiteVideo[]>([]);
    useEffect(() => {
        supabase.from("videos").select("*").order("position")
            .then(({ data }) => { if (data)
            setVideos(data as SiteVideo[]); });
    }, []);
    return (<section className="e-section" style={{
            background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(196,75,80,0.06) 0%, transparent 55%), var(--sos-soft)",
        }}>
      <div ref={s4ref} className="e-container">
        <div style={{
            textAlign: "center", marginBottom: 64,
            transition: "all .7s cubic-bezier(.4,0,.2,1)",
            opacity: s4on ? 1 : 0, transform: s4on ? "none" : "translateY(20px)",
        }}>
          <p className="e-label e-label--sos">გადაუდებელი</p>
          <h2 className="e-heading" style={{ fontSize: "clamp(1.6rem,3vw,2.3rem)", margin: 0 }}>
            დახმარება სჭირდებათ
          </h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 80 }}>
          {SOS_CASES.map((c, i) => {
            const vid = videos.find(v => v.position === c.pos);
            const reversed = i % 2 === 1;
            return (<div key={c.pos} className="sos-row" style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 48, alignItems: "start",
                    direction: reversed ? "rtl" : "ltr",
                    transition: "all .7s cubic-bezier(.4,0,.2,1)",
                    transitionDelay: `${i * 120}ms`,
                    opacity: s4on ? 1 : 0,
                    transform: s4on ? "none" : `translateY(24px)`,
                }}>
                <div style={{ direction: "ltr" }}>
                  <div style={{
                    overflow: "hidden",
                    borderRadius: "var(--radius-xl)",
                    border: `1px solid ${C.line}`,
                    boxShadow: "var(--shadow-md)",
                    aspectRatio: "16/9", background: "#000", position: "relative",
                }}>
                    {vid?.url ? (<video src={vid.url} controls style={{ width: "100%", height: "100%", objectFit: "cover" }}/>) : (<div style={{
                        width: "100%", height: "100%",
                        display: "flex", flexDirection: "column",
                        alignItems: "center", justifyContent: "center", gap: 8,
                        background: C.creamWarm, color: C.faint,
                    }}>
                        <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                          <path strokeLinecap="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"/>
                        </svg>
                        <span style={{ fontSize: 12, fontWeight: 400, letterSpacing: "0.05em" }}>ვიდეო {c.pos}</span>
                      </div>)}
                    <div style={{
                    position: "absolute", top: 16, left: 16,
                    fontSize: 10, fontWeight: 500, letterSpacing: "0.2em",
                    padding: "5px 12px",
                    border: `1px solid ${C.sos}`,
                    color: C.sos,
                    fontFamily: "'Inter',sans-serif",
                    textTransform: "uppercase",
                    background: "rgba(255,255,255,0.9)",
                }}>SOS</div>
                  </div>
                </div>

                <div style={{ direction: "ltr" }}>
                  <h3 style={{
                    fontFamily: "'Noto Serif Georgian',serif",
                    fontSize: 22, fontWeight: 600, color: C.ink, marginBottom: 16,
                }}>
                    {c.family}
                  </h3>
                  <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.9, marginBottom: 24, fontWeight: 300 }}>
                    {c.body}
                  </p>

                  <div style={{
                    display: "flex", alignItems: "flex-start", gap: 10,
                    borderLeft: `2px solid ${C.sos}`,
                    paddingLeft: 16, marginBottom: 28,
                }}>
                    <p style={{ color: C.inkSoft, fontSize: 13, margin: 0, lineHeight: 1.6, fontWeight: 300 }}>{c.address}</p>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 1, background: C.line }}>
                    {BANK_ACCOUNTS.map(b => (<div key={b.num} style={{
                        display: "flex", alignItems: "center", gap: 12,
                        background: "#fff", padding: "12px 16px",
                    }}>
                        <span style={{ fontSize: 11, color: C.faint, fontWeight: 500, minWidth: 110, letterSpacing: "0.03em" }}>{b.bank}</span>
                        <span style={{
                        fontSize: 12, color: C.ink, fontWeight: 500,
                        fontFamily: "'Inter',monospace", flex: 1, letterSpacing: "0.02em",
                    }}>{b.num}</span>
                        <button onClick={() => navigator.clipboard?.writeText(b.num)} style={{
                        background: "none", border: `1px solid ${C.line}`,
                        padding: "4px 10px", cursor: "pointer",
                        fontSize: 10, color: C.muted, fontWeight: 500,
                        letterSpacing: "0.08em", textTransform: "uppercase",
                        transition: "border-color .2s, color .2s",
                    }} onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = C.ink; el.style.color = C.ink; }} onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = C.line; el.style.color = C.muted; }}>კოპირება</button>
                      </div>))}
                    <p style={{ color: C.faint, fontSize: 12, margin: "12px 0 0", fontWeight: 300 }}>
                      დანიშნულება: <span style={{ color: C.sos, fontWeight: 500 }}>{c.purpose}</span>
                    </p>
                  </div>
                </div>
              </div>);
        })}
        </div>
      </div>

      <style>{`
        @media(max-width:768px){
          .sos-row { grid-template-columns:1fr !important; direction:ltr !important; }
        }
      `}</style>
    </section>);
}
function VideoSection({ s2ref, s2on }: {
    s2ref: React.RefObject<HTMLDivElement | null>;
    s2on: boolean;
}) {
    const [videos, setVideos] = useState<SiteVideo[]>([]);
    useEffect(() => {
        supabase.from("videos").select("*").order("position")
            .then(({ data }) => { if (data)
            setVideos(data as SiteVideo[]); });
    }, []);
    const v1 = videos.find(v => v.position === 1);
    const v2 = videos.find(v => v.position === 2);
    return (<section className="e-section e-section--white">
      <div ref={s2ref} className="e-container">

        <div style={{
            textAlign: "center", marginBottom: 64,
            transition: "all .7s cubic-bezier(.4,0,.2,1)",
            opacity: s2on ? 1 : 0, transform: s2on ? "none" : "translateY(20px)",
        }}>
          <p className="e-label">ისტორიები</p>
          <h2 className="e-heading" style={{ fontSize: "clamp(1.5rem,3vw,2.1rem)", marginBottom: 12 }}>
            გავრცელებული დაავადებები
          </h2>
          <p style={{ color: C.muted, fontSize: 14, fontWeight: 300 }}>რეალური ისტორიები საქართველოდან</p>
        </div>

        <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(min(400px,100%),1fr))",
            gap: 24,
        }}>
          {[{ slot: v1, n: 1, delay: 0 }, { slot: v2, n: 2, delay: 100 }].map(({ slot, n, delay }) => (<div key={n} style={{
                overflow: "hidden",
                borderRadius: "var(--radius-xl)",
                background: "#fff",
                boxShadow: "var(--shadow-md)",
                border: "1px solid var(--line)",
                transition: "opacity .7s, translate .7s",
                transitionDelay: `${delay}ms`,
                opacity: s2on ? 1 : 0,
                translate: s2on ? "0 0" : "0 20px",
                aspectRatio: "16/9",
                position: "relative",
            }}>
              {slot?.url ? (<video src={slot.url} controls style={{ width: "100%", height: "100%", objectFit: "cover" }} title={slot.title ?? `ვიდეო ${n}`}/>) : (<div style={{
                    width: "100%", height: "100%",
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                    gap: 10, color: C.faint,
                }}>
                  <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"/>
                  </svg>
                  <p style={{ fontSize: 12, margin: 0, fontWeight: 400, letterSpacing: "0.05em" }}>ვიდეო {n}</p>
                </div>)}
            </div>))}
        </div>
      </div>
    </section>);
}
function FCol({ title, items }: {
    title: string;
    items: { label: string; href: string }[];
}) {
    return (<div>
      <p style={{
            fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase",
            fontWeight: 500, color: "rgba(255,255,255,0.3)", marginBottom: 20,
            fontFamily: "'Inter',sans-serif",
        }}>
        {title}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {items.map(l => (<a key={l.label} href={l.href} style={{
                color: "rgba(255,255,255,0.45)", fontSize: 13, textDecoration: "none",
                fontWeight: 300, transition: "color .25s",
            }} onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.85)"; }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.45)"; }}>
            {l.label}
          </a>))}
      </div>
    </div>);
}
