import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { supabase, type HelpRequest } from "@/lib/supabase";
import { createCase, notifyAdmin, uploadDocument } from "@/lib/platform";

export const Route = createFileRoute("/request")({
    component: RequestPage,
    head: () => ({ meta: [{ title: "იმედის რუკა × PearTM — დახმარება" }] }),
});

const CITIES = ["თბილისი", "ბათუმი", "ქუთაისი", "რუსთავი", "გორი", "ზუგდიდი", "ფოთი", "თელავი", "ახალციხე", "სხვა"];

function RequestPage() {
    const { t, user } = useApp();
    const [form, setForm] = useState<Omit<HelpRequest, "id" | "firebase_uid" | "status" | "created_at">>({
        user_name: user?.displayName ?? "",
        user_email: user?.email ?? "",
        user_phone: "",
        child_name: "",
        child_age: undefined,
        diagnosis: "",
        medicines_needed: "",
        amount_needed: undefined,
        city: "თბილისი",
        description: "",
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [docs, setDocs] = useState<File[]>([]);
    const [donationUrl, setDonationUrl] = useState("");

    function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
        setForm(f => ({ ...f, [k]: v }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);
        const caseId = await createCase({
            firebase_uid: user?.uid,
            title: form.child_name,
            city: form.city,
            diagnosis: form.diagnosis,
        });
        const docUrls: string[] = [];
        for (const d of docs) {
            const url = await uploadDocument(d, "request");
            if (url) docUrls.push(url);
        }
        const { error: err } = await supabase.from("help_requests").insert({
            ...form,
            firebase_uid: user?.uid ?? null,
            status: "pending",
            verification_status: "pending",
            case_id: caseId,
            donation_url: donationUrl || null,
            document_urls: docUrls.length ? docUrls : null,
        });
        if (err) {
            setError("შეცდომა. სცადეთ თავიდან.");
            setLoading(false);
            return;
        }
        await notifyAdmin({
            type: "help_request",
            title: "ახალი განაცხადი",
            message: `${form.child_name} — ${form.city}`,
            url: "/admin",
        });
        setSuccess(true);
        setLoading(false);
    }

    if (success) {
        return (
            <div className="page" style={{ display: "grid", placeItems: "center", padding: "2rem" }}>
                <div className="page-card page-card--elevated" style={{ maxWidth: 420, textAlign: "center", padding: "48px 32px" }}>
                    <div style={{
                        width: 64, height: 64, borderRadius: "50%",
                        background: "#f0fdf8", border: "1px solid rgba(5,150,105,0.3)",
                        display: "grid", placeItems: "center", fontSize: 28, margin: "0 auto 20px", color: "#059669",
                    }}>✓</div>
                    <h2 className="e-heading" style={{ fontSize: 22, marginBottom: 8 }}>{t.request.successMsg}</h2>
                    <p style={{ color: "var(--ink-muted)", fontSize: 14, marginBottom: 28, fontWeight: 300 }}>ჩვენ მალე დაგიკავშირდებით</p>
                    <button type="button" className="e-btn e-btn--primary" onClick={() => {
                        setSuccess(false);
                        setForm({
                            user_name: "", user_email: "", user_phone: "", child_name: "",
                            child_age: undefined, diagnosis: "", medicines_needed: "",
                            amount_needed: undefined, city: "თბილისი", description: "",
                        });
                    }}>
                        კიდევ ერთი განაცხადი
                    </button>
                </div>
            </div>
        );
    }

    return (
        <main className="page">
            <section className="page-hero page-hero--sos">
                <div className="page-hero__inner">
                    <span className="pill pill--sos" style={{ marginBottom: 16, display: "inline-flex" }}>დახმარება</span>
                    <h1 className="e-heading" style={{ fontSize: "clamp(1.6rem,3.5vw,2.4rem)", marginBottom: 12 }}>{t.request.title}</h1>
                    <p className="page-hero__lead">{t.request.subtitle}</p>
                </div>
            </section>

            <section className="page-body page-body--narrow">
                <div className="page-wrap">
                    <div className="page-card page-card--elevated">
                        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                            <div className="page-grid-2">
                                <Field label={t.request.yourName}>
                                    <input required className="page-input" value={form.user_name} onChange={e => set("user_name", e.target.value)} placeholder="სახელი გვარი" />
                                </Field>
                                <Field label={t.request.yourEmail}>
                                    <input required type="email" className="page-input" value={form.user_email} onChange={e => set("user_email", e.target.value)} placeholder="mail@example.com" />
                                </Field>
                            </div>
                            <div className="page-grid-2">
                                <Field label={t.request.yourPhone}>
                                    <input type="tel" className="page-input" value={form.user_phone} onChange={e => set("user_phone", e.target.value)} placeholder="+995 5xx xxx xxx" />
                                </Field>
                                <Field label={t.request.city}>
                                    <select className="page-input" value={form.city} onChange={e => set("city", e.target.value)}>
                                        {CITIES.map(c => <option key={c}>{c}</option>)}
                                    </select>
                                </Field>
                            </div>

                            <div className="page-divider" />

                            <div className="page-grid-2">
                                <Field label={t.request.childName}>
                                    <input required className="page-input" value={form.child_name} onChange={e => set("child_name", e.target.value)} placeholder="ბავშვის სახელი" />
                                </Field>
                                <Field label={t.request.childAge}>
                                    <input type="number" min={0} max={18} className="page-input" value={form.child_age ?? ""} onChange={e => set("child_age", e.target.value ? +e.target.value : undefined)} placeholder="ასაკი" />
                                </Field>
                            </div>
                            <Field label={t.request.diagnosis}>
                                <input required className="page-input" value={form.diagnosis} onChange={e => set("diagnosis", e.target.value)} placeholder="მაგ. დიუშენი, ლეიკემია..." />
                            </Field>
                            <Field label={t.request.medicines}>
                                <textarea required rows={3} className="page-input" style={{ resize: "vertical" }} value={form.medicines_needed} onChange={e => set("medicines_needed", e.target.value)} placeholder="საჭირო წამლები ან მკურნალობა..." />
                            </Field>
                            <Field label={t.request.amount}>
                                <input type="number" min={0} className="page-input" value={form.amount_needed ?? ""} onChange={e => set("amount_needed", e.target.value ? +e.target.value : undefined)} placeholder="0" />
                            </Field>
                            <Field label="Kisa.ge / დონაციის ლინკი">
                                <input className="page-input" value={donationUrl} onChange={e => setDonationUrl(e.target.value)} placeholder="https://kisa.ge/..." />
                            </Field>
                            <Field label={t.forum.docs}>
                                <input type="file" accept="image/*,.pdf" multiple onChange={e => setDocs(Array.from(e.target.files ?? []))} className="page-input" />
                            </Field>
                            <Field label={t.request.description}>
                                <textarea rows={4} className="page-input" style={{ resize: "vertical" }} value={form.description} onChange={e => set("description", e.target.value)} placeholder="მოგვიყევით მეტი..." />
                            </Field>

                            {error && <p className="page-error" style={{ margin: 0 }}>{error}</p>}

                            <button type="submit" disabled={loading} className="e-btn e-btn--sos e-btn--lg" style={{ width: "100%", justifyContent: "center" }}>
                                {loading ? "იგზავნება..." : t.request.submit}
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </main>
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
