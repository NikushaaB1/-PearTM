import { useState, useEffect } from "react";
import ThemePicker from "@/components/ThemePicker";
import { Link, useRouterState } from "@tanstack/react-router";
import { useApp } from "@/contexts/AppContext";
import { auth, googleProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "@/lib/firebase";
type AuthTab = "login" | "register";
function AuthModal({ onClose }: {
    onClose: () => void;
}) {
    const { t } = useApp();
    const [tab, setTab] = useState<AuthTab>("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    function reset() { setEmail(""); setPassword(""); setName(""); setError(""); }
    function switchTab(t: AuthTab) { setTab(t); reset(); }
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            if (tab === "login") {
                await signInWithEmailAndPassword(auth, email, password);
            }
            else {
                await createUserWithEmailAndPassword(auth, email, password);
            }
            onClose();
        }
        catch (err: unknown) {
            const code = (err as {
                code?: string;
            })?.code ?? "";
            if (code.includes("wrong-password") || code.includes("invalid-credential") || code.includes("user-not-found"))
                setError(tab === "login" ? "ელფოსტა ან პაროლი არასწორია" : "Error");
            else if (code.includes("email-already-in-use"))
                setError("ეს ელფოსტა უკვე გამოყენებულია");
            else if (code.includes("weak-password"))
                setError("პაროლი მინ. 6 სიმბოლო");
            else
                setError("შეცდომა. სცადეთ თავიდან");
        }
        finally {
            setLoading(false);
        }
    }
    async function handleGoogle() {
        setError("");
        setLoading(true);
        try {
            await signInWithPopup(auth, googleProvider);
            onClose();
        }
        catch {
            setError("Google-ით შესვლა ვერ მოხერხდა");
        }
        finally {
            setLoading(false);
        }
    }
    return (<div className="auth-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="auth-dialog">
        <div className="auth-header">
          <p className="auth-title">{t.siteName} <span style={{ color: "var(--accent)" }}>{t.siteSub}</span></p>
          <p className="auth-sub">{tab === "login" ? "შედით ანგარიშზე" : "შექმენით ანგარიში"}</p>
        </div>

        <div className="auth-tabs">
          {(["login", "register"] as AuthTab[]).map((tp) => (
            <button key={tp} type="button" onClick={() => switchTab(tp)} className={`auth-tab${tab === tp ? " auth-tab--on" : ""}`}>
              {tp === "login" ? "შესვლა" : "რეგისტრაცია"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="auth-body">
          {tab === "register" && <GInput placeholder="სახელი და გვარი" value={name} onChange={(e) => setName(e.target.value)} required />}
          <GInput placeholder="ელფოსტა" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <GInput placeholder="პაროლი" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />

          {error && <p className="page-error" style={{ margin: 0 }}>{error}</p>}

          <button type="submit" disabled={loading} className="e-btn e-btn--primary" style={{ width: "100%", justifyContent: "center" }}>
            {loading ? "..." : tab === "login" ? "შესვლა" : "რეგისტრაცია"}
          </button>

          <div className="auth-or">ან</div>

          <button type="button" onClick={handleGoogle} disabled={loading} className="auth-google">
            <GoogleIcon /> Google-ით შესვლა
          </button>
        </form>

        <button type="button" onClick={onClose} className="auth-close">დახურვა</button>
      </div>
    </div>);
}
function GInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
    return <input {...props} className="auth-input" />;
}
function GoogleIcon() {
    return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>);
}
export default function Navbar() {
    const { theme, toggleTheme, lang, setLang, t, user, logout } = useApp();
    const [authOpen, setAuthOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    useEffect(() => setMounted(true), []);
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);
    const router = useRouterState();
    const currentPath = router.location.pathname;
    const isMap = currentPath === "/map";
    const navLinks = [
        { to: "/", label: t.nav.home },
        { to: "/map", label: t.nav.map },
        { to: "/forum", label: t.nav.forum },
        { to: "/partners", label: t.nav.partners },
        { to: "/about", label: lang === "ge" ? "ჩვენ შესახებ" : "About" },
    ];
    const INK = "#141B2D";
    const MUTED = "#6B7280";
    return (<>
      <nav className={`e-nav${scrolled ? " e-nav--scrolled" : ""}`}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0, textDecoration: "none" }}>
          <img src="/logo.png" alt="იმედის რუკა × PearTM" style={{ height: 36, width: "auto", objectFit: "contain" }}/>
          <div className="hidden sm:block">
            <p style={{ fontFamily: "'Noto Serif Georgian',serif", fontWeight: 600, fontSize: 14, color: INK, margin: 0, lineHeight: 1.3, letterSpacing: "-0.01em" }}>
              იმედის რუკა
            </p>
            <p style={{ fontSize: 10, color: MUTED, fontWeight: 400, margin: 0, letterSpacing: "0.08em" }}>× PearTM</p>
          </div>
        </Link>

        <div style={{
            position: "absolute", left: "50%", transform: "translateX(-50%)",
            display: "flex", alignItems: "center",
        }} className="nav-links-desktop">
          {navLinks.map((l) => {
            const active = currentPath === l.to;
            return (<Link key={l.to} to={l.to} className={`e-nav__link${active ? " e-nav__link--active" : ""}`}>
                {l.label}
              </Link>);
        })}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: "auto" }}>
          <button onClick={() => setLang(lang === "ge" ? "en" : "ge")} style={{
            padding: "5px 10px", fontSize: 10, fontWeight: 500,
            letterSpacing: "0.12em", color: MUTED, background: "transparent",
            border: "none", cursor: "pointer", transition: "color .25s",
            fontFamily: "'Inter',sans-serif",
        }} onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = INK} onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = MUTED}>
            {lang === "ge" ? "EN" : "GE"}
          </button>

          <div style={{ width: 1, height: 16, background: "rgba(20,27,45,0.1)", margin: "0 4px" }}/>

          <ThemePicker />

          <button onClick={toggleTheme} style={{
            width: 32, height: 32, display: "grid", placeItems: "center",
            background: "transparent", border: "none",
            color: MUTED, cursor: "pointer", transition: "color .25s",
        }} onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = INK} onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = MUTED}>
            {mounted && (theme === "dark" ? (
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
              </svg>
            ) : (
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            ))}
          </button>

          <Link to="/request" className="e-btn e-btn--outline-dark hidden md:inline-flex" style={{ fontSize: 12, padding: "10px 22px", marginLeft: 8 }}>
            დახმარება
          </Link>

          {user ? (<div style={{ position: "relative" }}>
              <button onClick={() => setMenuOpen(o => !o)} style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "4px 12px 4px 4px",
                border: "none", background: "transparent",
                cursor: "pointer", transition: "opacity .2s",
            }} onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = "0.7"} onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = "1"}>
                <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: INK,
                display: "grid", placeItems: "center",
                fontSize: 11, fontWeight: 600, color: "#fff",
            }}>
                  {(user.displayName || user.email || "?")[0].toUpperCase()}
                </div>
                <span style={{ fontSize: 13, fontWeight: 400, color: INK, maxWidth: 90, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} className="hidden sm:block">
                  {user.displayName || user.email?.split("@")[0]}
                </span>
              </button>

              {menuOpen && (<div style={{
                    position: "absolute", right: 0, top: "calc(100% + 12px)",
                    width: 200, background: "#fff",
                    border: "1px solid rgba(20,27,45,0.08)",
                    boxShadow: "0 8px 32px rgba(20,27,45,0.08)",
                    overflow: "hidden", zIndex: 50,
                }}>
                  <Link to="/profile" onClick={() => setMenuOpen(false)} style={{
                    display: "block", padding: "12px 18px", fontSize: 13, fontWeight: 400,
                    color: INK, textDecoration: "none", transition: "background .15s",
                }} onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(20,27,45,0.03)"} onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
                    {t.nav.profile}
                  </Link>
                  {(user.email === "admin@imedisruka.ge" || user.email?.includes("admin")) && (<Link to="/admin" onClick={() => setMenuOpen(false)} style={{
                        display: "block", padding: "12px 18px", fontSize: 13, fontWeight: 400,
                        color: INK, textDecoration: "none",
                        borderTop: "1px solid rgba(20,27,45,0.06)", transition: "background .15s",
                    }} onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(20,27,45,0.03)"} onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
                      {t.nav.admin}
                    </Link>)}
                  <button onClick={() => { logout(); setMenuOpen(false); }} style={{
                    width: "100%", display: "block", textAlign: "left",
                    padding: "12px 18px", fontSize: 13, fontWeight: 400,
                    color: "#B5454A", background: "none", border: "none",
                    borderTop: "1px solid rgba(20,27,45,0.06)",
                    cursor: "pointer", transition: "background .15s",
                    fontFamily: "'Noto Sans Georgian','Inter',sans-serif",
                }} onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(181,69,74,0.04)"} onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
                    {t.nav.logout}
                  </button>
                </div>)}
            </div>) : (<button type="button" onClick={() => setAuthOpen(true)} className="e-btn e-btn--sos" style={{ fontSize: 12, padding: "10px 22px" }}>
              {t.nav.login}
            </button>)}

          <button onClick={() => setMenuOpen(o => !o)} style={{
            width: 32, height: 32, display: "grid", placeItems: "center",
            background: "transparent", border: "none",
            color: MUTED, cursor: "pointer", marginLeft: 4,
        }} className="nav-hamburger">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
        </div>
      </nav>

      
      {menuOpen && (<div style={{
                position: "fixed", top: 72, left: 0, right: 0, zIndex: 499,
                background: "rgba(250,250,248,0.97)",
                backdropFilter: "blur(20px)",
                borderBottom: "1px solid rgba(20,27,45,0.08)",
                padding: "16px 2rem 20px",
            }} className="nav-mobile-menu">
          {navLinks.map(l => {
                const active = currentPath === l.to;
                return (<Link key={l.to} to={l.to} onClick={() => setMenuOpen(false)} style={{
                        display: "block", padding: "12px 0",
                        fontSize: 14, fontWeight: active ? 500 : 400,
                        color: active ? INK : MUTED,
                        borderBottom: active ? `1px solid ${INK}` : "1px solid transparent",
                        textDecoration: "none", marginBottom: 2,
                        width: "fit-content",
                    }}>
                {l.label}
              </Link>);
            })}
        </div>)}

      <style>{`
        @media (min-width: 768px) { .nav-hamburger { display: none !important; } }
        @media (max-width: 767px) { .nav-links-desktop { display: none !important; } .nav-mobile-menu { display: block; } }
      `}</style>

      {authOpen && <AuthModal onClose={() => setAuthOpen(false)}/>}
    </>);
}
