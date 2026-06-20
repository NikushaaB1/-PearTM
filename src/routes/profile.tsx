import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useApp } from "@/contexts/AppContext";
import { supabase, type Profile, type HelpRequest, type SosPost } from "@/lib/supabase";
import VerificationBadge from "@/components/VerificationBadge";
import CaseLinks from "@/components/CaseLinks";

export const Route = createFileRoute("/profile")({
    component: ProfilePage,
    head: () => ({ meta: [{ title: "იმედის რუკა × PearTM — პროფილი" }] }),
});

function ProfilePage() {
    const { t, user } = useApp();
    const [profile, setProfile] = useState<Omit<Profile, "firebase_uid">>({
        name: "", email: "", phone: "", city: "", bio: "",
    });
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        if (!user) { setFetching(false); return; }
        supabase.from("profiles").select("*").eq("firebase_uid", user.uid).maybeSingle()
            .then(({ data }) => {
                if (data) {
                    setProfile({
                        name: data.name ?? "",
                        email: data.email ?? user.email ?? "",
                        phone: data.phone ?? "",
                        city: data.city ?? "",
                        bio: data.bio ?? "",
                    });
                } else {
                    setProfile(p => ({ ...p, email: user.email ?? "" }));
                }
                setFetching(false);
            });
    }, [user]);

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        if (!user) return;
        setLoading(true);
        setSaved(false);
        await supabase.from("profiles").upsert({
            firebase_uid: user.uid,
            ...profile,
            updated_at: new Date().toISOString(),
        }, { onConflict: "firebase_uid" });
        setLoading(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    }

    if (!user) {
        return (
            <div className="page" style={{ display: "grid", placeItems: "center" }}>
                <div className="page-empty">
                    <p style={{ marginBottom: 16 }}>შესვლა საჭიროა</p>
                    <Link to="/" className="e-btn e-btn--primary">მთავარი</Link>
                </div>
            </div>
        );
    }

    return (
        <main className="page">
            <section className="page-hero page-hero--warm">
                <div className="page-hero__inner">
                    <div className="page-avatar">
                        {(user.displayName || user.email || "?")[0].toUpperCase()}
                    </div>
                    <h1 className="e-heading" style={{ fontSize: "clamp(1.4rem,3vw,2rem)", marginBottom: 6 }}>{t.profile.title}</h1>
                    <p className="page-hero__lead" style={{ fontSize: 13 }}>{user.email}</p>
                </div>
            </section>

            <section className="page-body page-body--narrow">
                <div className="page-wrap" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                    <div className="page-card page-card--elevated">
                        {fetching ? (
                            <div className="page-empty" style={{ padding: "32px 0" }}>იტვირთება...</div>
                        ) : (
                            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                <Field label={t.profile.name}>
                                    <input value={profile.name ?? ""} onChange={e => setProfile({ ...profile, name: e.target.value })} className="page-input" placeholder={t.profile.name} />
                                </Field>
                                <Field label={t.profile.phone}>
                                    <input value={profile.phone ?? ""} onChange={e => setProfile({ ...profile, phone: e.target.value })} type="tel" className="page-input" placeholder="+995 5xx xxx xxx" />
                                </Field>
                                <Field label={t.profile.city}>
                                    <input value={profile.city ?? ""} onChange={e => setProfile({ ...profile, city: e.target.value })} className="page-input" placeholder="თბილისი" />
                                </Field>
                                <Field label={t.profile.bio}>
                                    <textarea value={profile.bio ?? ""} onChange={e => setProfile({ ...profile, bio: e.target.value })} rows={3} className="page-input" style={{ resize: "vertical" }} placeholder="რამდენიმე სიტყვა თქვენ შესახებ..." />
                                </Field>
                                {saved && <p className="page-success" style={{ margin: 0 }}>✓ {t.profile.savedMsg}</p>}
                                <button type="submit" disabled={loading} className="e-btn e-btn--primary" style={{ width: "100%", justifyContent: "center" }}>
                                    {loading ? "..." : t.profile.saveBtn}
                                </button>
                            </form>
                        )}
                    </div>

                    <MyRequests uid={user.uid} />
                </div>
            </section>
        </main>
    );
}

function MyRequests({ uid }: { uid: string }) {
    const [reqs, setReqs] = useState<HelpRequest[]>([]);
    const [sos, setSos] = useState<SosPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            supabase.from("help_requests").select("*").eq("firebase_uid", uid).order("created_at", { ascending: false }),
            supabase.from("sos_posts").select("*").eq("firebase_uid", uid).order("created_at", { ascending: false }),
        ]).then(([r, s]) => {
            if (r.data) setReqs(r.data as HelpRequest[]);
            if (s.data) setSos(s.data as SosPost[]);
            setLoading(false);
        });
    }, [uid]);

    async function deleteSos(id: string) {
        if (!window.confirm("წავშალო ეს მოწოდება?")) return;
        await supabase.from("sos_posts").delete().eq("id", id);
        setSos(s => s.filter(x => x.id !== id));
    }

    const total = reqs.length + sos.length;

    return (
        <div className="page-card">
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                <h2 className="e-heading" style={{ fontSize: 17, margin: 0 }}>ჩემი მოთხოვნები</h2>
                <span className="page-badge" style={{ marginLeft: "auto" }}>{total}</span>
            </div>

            {loading ? (
                <div className="page-empty" style={{ padding: "24px 0" }}>იტვირთება...</div>
            ) : total === 0 ? (
                <div className="page-empty">
                    <div className="page-empty__icon">🕊️</div>
                    <p style={{ marginBottom: 16, fontSize: 14 }}>ჯერ არ გაქვს მოთხოვნა</p>
                    <Link to="/forum" className="e-btn e-btn--sos">დაამატე მოწოდება</Link>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {sos.map(p => (
                        <div key={p.id} className="page-list-item">
                            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontWeight: 600, fontSize: 14, margin: "0 0 4px", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                                        <Link to="/forum/$postId" params={{ postId: p.id! }} style={{ color: "inherit", textDecoration: "none" }}>
                                            {p.recipient}
                                        </Link>
                                        <VerificationBadge status={p.verification_status} verified={p.verified} />
                                    </p>
                                    <p style={{ fontSize: 12, color: "var(--ink-muted)", margin: 0 }}>{p.purpose}</p>
                                    {p.goal_amount && (
                                        <p style={{ fontSize: 12, color: "var(--sos)", fontWeight: 600, margin: "6px 0 0" }}>
                                            {(p.raised_amount ?? 0).toLocaleString()} / {p.goal_amount.toLocaleString()} ₾
                                        </p>
                                    )}
                                    <CaseLinks caseId={p.case_id} sosPostId={p.id} helpRequestId={p.help_request_id} />
                                </div>
                                <button type="button" onClick={() => deleteSos(p.id!)} className="page-badge page-badge--sos" style={{ cursor: "pointer", border: "1px solid rgba(181,69,74,0.3)" }}>
                                    წაშლა
                                </button>
                            </div>
                        </div>
                    ))}
                    {reqs.map(r => (
                        <div key={r.id} className="page-list-item">
                            <p style={{ fontWeight: 600, fontSize: 14, margin: "0 0 4px" }}>{r.child_name} · {r.city}</p>
                            <p style={{ fontSize: 12, color: "var(--ink-muted)", margin: "0 0 8px" }}>{r.diagnosis}</p>
                            <VerificationBadge status={r.verification_status} verified={r.verified} />
                            <CaseLinks caseId={r.case_id} sosPostId={r.sos_post_id} helpRequestId={r.id} />
                            <span className={`page-badge ${r.status === "completed" ? "page-badge--ok" : r.status === "approved" ? "page-badge--ok" : "page-badge--wait"}`} style={{ marginTop: 8, display: "inline-block" }}>
                                {r.status === "completed" ? "დასრულდა" : r.status === "approved" ? "აქტიური" : "მოლოდინში"}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="page-field">
            <label>{label}</label>
            {children}
        </div>
    );
}
