import { useState, useEffect } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useApp } from "@/contexts/AppContext";
import { auth, googleProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "@/lib/firebase";

/* ── Auth Modal (inline) ─────────────────────────────── */
type AuthTab = "login" | "register";

function AuthModal({ onClose }: { onClose: () => void }) {
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
    setError(""); setLoading(true);
    try {
      if (tab === "login") {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      onClose();
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code ?? "";
      if (code.includes("wrong-password") || code.includes("invalid-credential") || code.includes("user-not-found"))
        setError(tab === "login" ? "ელფოსტა ან პაროლი არასწორია" : "Error");
      else if (code.includes("email-already-in-use")) setError("ეს ელფოსტა უკვე გამოყენებულია");
      else if (code.includes("weak-password")) setError("პაროლი მინ. 6 სიმბოლო");
      else setError("შეცდომა. სცადეთ თავიდან");
    } finally { setLoading(false); }
  }

  async function handleGoogle() {
    setError(""); setLoading(true);
    try { await signInWithPopup(auth, googleProvider); onClose(); }
    catch { setError("Google-ით შესვლა ვერ მოხერხდა"); }
    finally { setLoading(false); }
  }

  return (
    <div
      className="fixed inset-0 z-[9000] flex items-center justify-center p-4"
      style={{ background: "rgba(10,10,20,0.6)", backdropFilter: "blur(8px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-sm rounded-3xl overflow-hidden border border-white/20 shadow-2xl"
        style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(32px)" }}>
        <div className="px-6 pt-6 pb-3">
          <p className="font-display font-bold text-xl text-white">
            {t.siteName} <span className="text-primary">{t.siteSub}</span>
          </p>
          <p className="text-white/60 text-[13px] mt-0.5">
            {tab === "login" ? "შედით ანგარიშზე" : "შექმენით ანგარიში"}
          </p>
        </div>

        <div className="mx-5 mb-4 p-1 rounded-2xl flex" style={{ background: "rgba(255,255,255,0.12)" }}>
          {(["login", "register"] as AuthTab[]).map((tp) => (
            <button key={tp} onClick={() => switchTab(tp)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === tp ? "bg-white text-foreground shadow" : "text-white/70 hover:text-white"}`}>
              {tp === "login" ? "შესვლა" : "რეგისტრაცია"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="px-5 pb-5 space-y-3">
          {tab === "register" && (
            <GInput placeholder="სახელი და გვარი" value={name} onChange={(e) => setName(e.target.value)} required />
          )}
          <GInput placeholder="ელფოსტა" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <GInput placeholder="პაროლი" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />

          {error && <p className="text-red-300 text-[12px] bg-red-500/20 px-3 py-2 rounded-xl border border-red-400/30">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-2xl bg-primary text-white font-bold text-sm hover:brightness-110 transition disabled:opacity-60">
            {loading ? "..." : tab === "login" ? "შესვლა" : "რეგისტრაცია"}
          </button>

          <div className="flex items-center gap-3"><div className="flex-1 h-px bg-white/20" /><span className="text-white/40 text-[11px]">ან</span><div className="flex-1 h-px bg-white/20" /></div>

          <button type="button" onClick={handleGoogle} disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold text-white/90 border border-white/25 hover:bg-white/20 transition"
            style={{ background: "rgba(255,255,255,0.1)" }}>
            <GoogleIcon /> Google-ით შესვლა
          </button>
        </form>

        <button onClick={onClose} className="mx-auto mb-4 flex items-center gap-1 text-white/40 hover:text-white/70 text-xs transition px-3 py-1">
          ✕ დახურვა
        </button>
      </div>
    </div>
  );
}

function GInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input {...props}
      className="w-full px-4 py-3 rounded-2xl text-sm text-white placeholder:text-white/40 outline-none transition focus:ring-2 focus:ring-primary/50"
      style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)" }} />
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

/* ── Main Navbar ─────────────────────────────────────── */
export default function Navbar() {
  const { theme, toggleTheme, lang, setLang, t, user, logout } = useApp();
  const [authOpen, setAuthOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const router = useRouterState();
  const currentPath = router.location.pathname;

  const isMap = currentPath === "/map";

  const navLinks = [
    { to: "/", label: t.nav.home },
    { to: "/map", label: t.nav.map },
    { to: "/forum", label: "სიკეთის ფორუმი" },
  ];

  const BLUE = "#5B8FFF";

  return (
    <>
      <nav style={{
        position: "sticky", top: 0, zIndex: 500,
        height: 68,
        display: "flex", alignItems: "center",
        padding: "0 1.5rem",
        background: "rgba(255,255,255,0.72)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderBottom: "1px solid rgba(91,143,255,0.12)",
        boxShadow: "0 2px 24px rgba(91,143,255,0.08)",
        fontFamily: "'Noto Sans Georgian','Inter',sans-serif",
        transition: "background .3s",
      }}>

        {/* Logo + site name */}
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0, textDecoration: "none" }}>
          <img src="/logo.png" alt="იმედის რუკა × PearTM"
            style={{ height: 40, width: "auto", objectFit: "contain" }} />
          <div className="hidden sm:block">
            <p style={{ fontFamily: "'Noto Serif Georgian',serif", fontWeight: 700, fontSize: 14, color: "#1A2340", margin: 0, lineHeight: 1.2 }}>
              იმედის რუკა
            </p>
            <p style={{ fontSize: 11, color: BLUE, fontWeight: 600, margin: 0 }}>× PearTM</p>
          </div>
        </Link>

        {/* Centered nav links */}
        <div style={{
          position: "absolute", left: "50%", transform: "translateX(-50%)",
          display: "flex", alignItems: "center", gap: 4,
        }} className="nav-links-desktop">
          {navLinks.map((l) => {
            const active = currentPath === l.to;
            return (
              <Link key={l.to} to={l.to} style={{
                padding: "7px 18px", borderRadius: 12,
                fontSize: 14, fontWeight: active ? 700 : 500,
                textDecoration: "none",
                color: active ? BLUE : "#4A5568",
                background: active ? `${BLUE}12` : "transparent",
                border: active ? `1px solid ${BLUE}25` : "1px solid transparent",
                transition: "all .2s",
              }}
                onMouseEnter={e => { if (!active) Object.assign((e.currentTarget as HTMLElement).style, { background: `${BLUE}08`, color: BLUE }); }}
                onMouseLeave={e => { if (!active) Object.assign((e.currentTarget as HTMLElement).style, { background: "transparent", color: "#4A5568" }); }}>
                {l.label}
              </Link>
            );
          })}
        </div>

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>

          {/* Lang */}
          <button onClick={() => setLang(lang === "ge" ? "en" : "ge")} style={{
            padding: "6px 12px", borderRadius: 10,
            fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
            color: "#6B82A0", background: "transparent",
            border: "1px solid rgba(91,143,255,0.2)",
            cursor: "pointer", transition: "all .2s",
            fontFamily: "'Inter',sans-serif",
          }}
            onMouseEnter={e => Object.assign((e.currentTarget as HTMLElement).style, { background: `${BLUE}10`, color: BLUE })}
            onMouseLeave={e => Object.assign((e.currentTarget as HTMLElement).style, { background: "transparent", color: "#6B82A0" })}>
            {lang === "ge" ? "EN" : "GE"}
          </button>

          {/* Theme */}
          <button onClick={toggleTheme} style={{
            width: 36, height: 36, borderRadius: 10,
            display: "grid", placeItems: "center",
            background: "transparent",
            border: "1px solid rgba(91,143,255,0.2)",
            color: "#6B82A0", cursor: "pointer", transition: "all .2s",
          }}
            onMouseEnter={e => Object.assign((e.currentTarget as HTMLElement).style, { background: `${BLUE}10`, color: BLUE })}
            onMouseLeave={e => Object.assign((e.currentTarget as HTMLElement).style, { background: "transparent", color: "#6B82A0" })}>
            {mounted && (theme === "dark" ? (
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
              </svg>
            ) : (
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            ))}
          </button>

          {/* User / Login */}
          {user ? (
            <div style={{ position: "relative" }}>
              <button onClick={() => setMenuOpen(o => !o)} style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "6px 14px 6px 6px", borderRadius: 12,
                border: "1px solid rgba(91,143,255,0.2)",
                background: "transparent", cursor: "pointer", transition: "all .2s",
              }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = `${BLUE}08`}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
                <div style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: `linear-gradient(135deg,${BLUE},#7B9FFF)`,
                  display: "grid", placeItems: "center",
                  fontSize: 12, fontWeight: 800, color: "#fff",
                  boxShadow: `0 2px 8px ${BLUE}40`,
                }}>
                  {(user.displayName || user.email || "?")[0].toUpperCase()}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#1A2340", maxWidth: 90, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                  className="hidden sm:block">
                  {user.displayName || user.email?.split("@")[0]}
                </span>
              </button>

              {menuOpen && (
                <div style={{
                  position: "absolute", right: 0, top: "calc(100% + 8px)",
                  width: 192, borderRadius: 18,
                  background: "rgba(255,255,255,0.95)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(91,143,255,0.15)",
                  boxShadow: "0 8px 32px rgba(91,143,255,0.15)",
                  overflow: "hidden", zIndex: 50,
                }}>
                  <Link to="/profile" onClick={() => setMenuOpen(false)} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "12px 16px", fontSize: 13, fontWeight: 600,
                    color: "#1A2340", textDecoration: "none", transition: "background .15s",
                  }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = `${BLUE}08`}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
                    <span style={{ fontSize: 16 }}>👤</span> {t.nav.profile}
                  </Link>
                  {(user.email === "admin@imedisruka.ge" || user.email?.includes("admin")) && (
                    <Link to="/admin" onClick={() => setMenuOpen(false)} style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "12px 16px", fontSize: 13, fontWeight: 600,
                      color: "#1A2340", textDecoration: "none",
                      borderTop: "1px solid rgba(91,143,255,0.1)", transition: "background .15s",
                    }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = `${BLUE}08`}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
                      <span style={{ fontSize: 16 }}>⚙️</span> {t.nav.admin}
                    </Link>
                  )}
                  <button onClick={() => { logout(); setMenuOpen(false); }} style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 10,
                    padding: "12px 16px", fontSize: 13, fontWeight: 600,
                    color: "#EF4444", background: "none", border: "none",
                    borderTop: "1px solid rgba(91,143,255,0.1)",
                    cursor: "pointer", transition: "background .15s",
                    fontFamily: "'Noto Sans Georgian','Inter',sans-serif",
                  }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#FEF2F2"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
                    <span style={{ fontSize: 16 }}>↩</span> {t.nav.logout}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button onClick={() => setAuthOpen(true)} style={{
              padding: "8px 20px", borderRadius: 12,
              background: `linear-gradient(135deg,${BLUE},#3D70FF)`,
              color: "#fff", fontWeight: 700, fontSize: 13,
              border: "none", cursor: "pointer",
              boxShadow: `0 4px 16px ${BLUE}40`,
              transition: "transform .2s, box-shadow .2s",
              fontFamily: "'Noto Sans Georgian','Inter',sans-serif",
            }}
              onMouseEnter={e => Object.assign((e.currentTarget as HTMLElement).style, { transform: "translateY(-1px)", boxShadow: `0 6px 20px ${BLUE}55` })}
              onMouseLeave={e => Object.assign((e.currentTarget as HTMLElement).style, { transform: "", boxShadow: `0 4px 16px ${BLUE}40` })}>
              {t.nav.login}
            </button>
          )}

          {/* Mobile hamburger */}
          <button onClick={() => setMenuOpen(o => !o)} style={{
            width: 36, height: 36, borderRadius: 10,
            display: "grid", placeItems: "center",
            background: "transparent",
            border: "1px solid rgba(91,143,255,0.2)",
            color: "#6B82A0", cursor: "pointer",
          }} className="nav-hamburger">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          position: "fixed", top: 68, left: 0, right: 0, zIndex: 499,
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(91,143,255,0.12)",
          boxShadow: "0 8px 24px rgba(91,143,255,0.1)",
          padding: "10px 16px 14px",
        }} className="nav-mobile-menu">
          {navLinks.map(l => {
            const active = currentPath === l.to;
            return (
              <Link key={l.to} to={l.to} onClick={() => setMenuOpen(false)} style={{
                display: "block", padding: "11px 16px", borderRadius: 12,
                fontSize: 14, fontWeight: active ? 700 : 500,
                color: active ? BLUE : "#1A2340",
                background: active ? `${BLUE}10` : "transparent",
                textDecoration: "none", marginBottom: 4,
              }}>
                {l.label}
              </Link>
            );
          })}
        </div>
      )}

      <style>{`
        @media (min-width: 768px) { .nav-hamburger { display: none !important; } }
        @media (max-width: 767px) { .nav-links-desktop { display: none !important; } .nav-mobile-menu { display: block; } }
      `}</style>

      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
    </>
  );
}
