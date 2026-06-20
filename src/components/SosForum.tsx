import { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { supabase, type SosPost } from "@/lib/supabase";
import { useApp } from "@/contexts/AppContext";
import ShareButtons from "@/components/ShareButtons";
import VerificationBadge from "@/components/VerificationBadge";
import { createCase, notifyAdmin, uploadDocument, isVerified } from "@/lib/platform";

type FilterMode = "all" | "verified" | "active";

function useReveal() {
    const ref = useRef<HTMLDivElement>(null);
    const [on, setOn] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setOn(true); }, { threshold: 0.08 });
        obs.observe(el);
        return () => obs.disconnect();
    }, []);
    return { ref, on };
}

export default function SosForum() {
    const { user, t } = useApp();
    const hero = useReveal();
    const [posts, setPosts] = useState<SosPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [filter, setFilter] = useState<FilterMode>("all");

    async function load() {
        setLoading(true);
        const { data } = await supabase
            .from("sos_posts")
            .select("*")
            .order("created_at", { ascending: false });
        if (data) setPosts(data as SosPost[]);
        setLoading(false);
    }

    useEffect(() => { load(); }, []);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return posts.filter(p => {
            if (filter === "verified" && !isVerified(p)) return false;
            if (filter === "active") {
                const reached = (p.raised_amount ?? 0) >= (p.goal_amount ?? Infinity);
                if (p.goal_amount && reached) return false;
            }
            if (!q) return true;
            return [p.recipient, p.purpose, p.description, p.address, p.bank_name]
                .filter(Boolean).join(" ").toLowerCase().includes(q);
        });
    }, [posts, query, filter]);

    const stats = useMemo(() => ({
        total: posts.length,
        verified: posts.filter(isVerified).length,
        collected: posts.reduce((sum, p) => sum + (p.raised_amount ?? 0), 0),
        active: posts.filter(p => {
            const reached = (p.raised_amount ?? 0) >= (p.goal_amount ?? Infinity);
            return !p.goal_amount || !reached;
        }).length,
    }), [posts]);

    return (
        <div className="sos-forum">
            <section className="sos-forum__hero">
                <div className="sos-forum__hero-bg" aria-hidden />
                <div ref={hero.ref} className="e-container sos-forum__hero-inner" style={{
                    opacity: hero.on ? 1 : 0,
                    transform: hero.on ? "none" : "translateY(24px)",
                    transition: "all .8s cubic-bezier(.4,0,.2,1)",
                }}>
                    <p className="e-label e-label--sos">{t.forum.title}</p>
                    <h1 className="e-heading" style={{ fontSize: "clamp(2rem,4.5vw,3rem)", margin: "0 0 16px" }}>
                        გადაუდებელი <em>დახმარება</em>
                    </h1>
                    <p className="sos-forum__lead">
                        დაეხმარე ოჯახებს, რომლებსაც სჭირდებათ შენს მხარდაჭერას.
                    </p>

                    <div className="sos-forum__stats">
                        {[
                            { val: stats.total, lbl: "მოწოდება" },
                            { val: stats.verified, lbl: "გადამოწმებული" },
                            { val: stats.collected.toLocaleString() + " ₾", lbl: "შეგროვებული" },
                        ].map(s => (
                            <div key={s.lbl} className="sos-forum__stat">
                                <span className="sos-forum__stat-val">{s.val}</span>
                                <span className="sos-forum__stat-lbl">{s.lbl}</span>
                            </div>
                        ))}
                    </div>

                    <div className="sos-forum__hero-actions">
                        <button type="button" className="e-btn e-btn--primary sos-forum__cta" onClick={() => setOpen(true)}>
                            {t.forum.addPost}
                        </button>
                        <a
                            href="https://www.facebook.com/ChernovetskyiFund"
                            target="_blank"
                            rel="noreferrer"
                            className="e-btn e-btn--outline-dark"
                        >
                            ჩერნოვეცკის ფონდი
                        </a>
                    </div>
                </div>
            </section>

            <section className="e-section e-section--warm" style={{ paddingTop: 48, paddingBottom: 100 }}>
                <div className="e-container">
                    {!loading && posts.length > 0 && (
                        <div className="sos-forum__tools">
                            <div className="sos-forum__search-wrap">
                                <svg className="sos-forum__search-icon" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z"/>
                                </svg>
                                <input
                                    value={query}
                                    onChange={e => setQuery(e.target.value)}
                                    placeholder="ძებნა — სახელი, დანიშნულება, ქალაქი..."
                                    className="sos-forum__search"
                                />
                            </div>
                            <div className="sos-forum__filters">
                                {([
                                    ["all", t.forum.filters.all],
                                    ["verified", t.forum.filters.verified],
                                    ["active", t.forum.filters.active],
                                ] as const).map(([m, label]) => (
                                    <button
                                        key={m}
                                        type="button"
                                        onClick={() => setFilter(m)}
                                        className={`sos-forum__filter${filter === m ? " sos-forum__filter--on" : ""}`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {loading ? (
                        <div className="sos-forum__empty">
                            <div className="sos-forum__spinner" />
                            <p>იტვირთება...</p>
                        </div>
                    ) : posts.length === 0 ? (
                        <div className="sos-forum__empty sos-forum__empty--card">
                            <div className="sos-forum__empty-icon">🤝</div>
                            <p className="sos-forum__empty-title">{t.forum.empty}</p>
                            <p className="sos-forum__empty-sub">{t.forum.emptySub}</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="sos-forum__empty">
                            <p>ვერაფერი მოიძებნა „{query}"-ზე</p>
                        </div>
                    ) : (
                        <div className="sos-forum__list">
                            {filtered.map((p, i) => (
                                <SosCard key={p.id ?? i} post={p} index={i} reversed={i % 2 === 1} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {open && (
                <SosFormModal
                    user={user}
                    onClose={() => setOpen(false)}
                    onDone={() => { setOpen(false); load(); }}
                />
            )}
        </div>
    );
}

function SosCard({ post, index, reversed }: { post: SosPost; index: number; reversed: boolean }) {
    const reveal = useReveal();
    const date = post.created_at
        ? new Date(post.created_at).toLocaleDateString("ka-GE", { day: "numeric", month: "long", year: "numeric" })
        : null;

    return (
        <article
            ref={reveal.ref}
            className={`sos-card sos-card-row${reversed ? " sos-card-row--rev" : ""}`}
            style={{
                opacity: reveal.on ? 1 : 0,
                transform: reveal.on ? "none" : "translateY(28px)",
                transition: `all .7s cubic-bezier(.4,0,.2,1) ${index * 80}ms`,
            }}
        >
            <div className="sos-card__media-wrap">
                <Link to="/forum/$postId" params={{ postId: post.id! }} className="sos-card__media-link">
                <div className="sos-card__media">
                    {post.media_url ? (
                        post.media_type === "video" ? (
                            <video src={post.media_url} controls className="sos-card__img" />
                        ) : (
                            <img src={post.media_url} alt={post.recipient} className="sos-card__img" />
                        )
                    ) : (
                        <div className="sos-card__no-media">მედია არ არის</div>
                    )}
                    <span className="sos-card__badge">SOS</span>
                </div>
                </Link>
            </div>

            <div className="sos-card__body">
                <div className="sos-card__head">
                    <Link to="/forum/$postId" params={{ postId: post.id! }} className="sos-card__title-link">
                        <h3 className="sos-card__title">{post.recipient}</h3>
                    </Link>
                    <VerificationBadge status={post.verification_status} verified={post.verified} />
                </div>

                {date && <p className="sos-card__date">{date}</p>}

                {post.description && (
                    <p className="sos-card__desc">{post.description}</p>
                )}

                {post.goal_amount ? (
                    <ProgressBar raised={post.raised_amount ?? 0} goal={post.goal_amount} />
                ) : null}

                {post.address && (
                    <div className="sos-card__address">
                        <span>📍</span>
                        <p>{post.address}</p>
                    </div>
                )}

                <div className="sos-card__bank">
                    <div className="sos-card__bank-row">
                        <span className="sos-card__bank-label">{post.bank_name || "ანგარიში"}</span>
                        <span className="sos-card__bank-num">{post.account_number}</span>
                        <button
                            type="button"
                            className="sos-card__copy"
                            onClick={() => navigator.clipboard?.writeText(post.account_number)}
                        >
                            კოპირება
                        </button>
                    </div>
                    <p className="sos-card__purpose">
                        დანიშნულება: <strong>{post.purpose}</strong>
                    </p>
                </div>

                <div className="sos-card__footer">
                    <ShareButtons text={`${post.recipient} — ${post.purpose}`} variant="dark" size="sm" />
                    {post.id && (
                        <Link to="/forum/$postId" params={{ postId: post.id }} className="sos-card__fb-link">
                            დეტალურად →
                        </Link>
                    )}
                </div>
            </div>
        </article>
    );
}

function ProgressBar({ raised, goal }: { raised: number; goal: number }) {
    const pct = Math.min(100, Math.round((raised / goal) * 100));
    const done = pct >= 100;
    return (
        <div className="sos-progress">
            <div className="sos-progress__top">
                <span className={`sos-progress__raised${done ? " sos-progress__raised--done" : ""}`}>
                    {raised.toLocaleString()} ₾
                </span>
                <span className="sos-progress__goal">მიზანი: {goal.toLocaleString()} ₾</span>
            </div>
            <div className="sos-progress__track">
                <div className={`sos-progress__fill${done ? " sos-progress__fill--done" : ""}`} style={{ width: `${pct}%` }} />
            </div>
            <p className={`sos-progress__hint${done ? " sos-progress__hint--done" : ""}`}>
                {done ? "მიზანი მიღწეულია" : `შეგროვდა ${pct}%`}
            </p>
        </div>
    );
}

function SosFormModal({ user, onClose, onDone }: {
    user: ReturnType<typeof useApp>["user"];
    onClose: () => void;
    onDone: () => void;
}) {
    const { t } = useApp();
    const [recipient, setRecipient] = useState("");
    const [personalId, setPersonalId] = useState("");
    const [account, setAccount] = useState("");
    const [bank, setBank] = useState("");
    const [purpose, setPurpose] = useState("");
    const [description, setDescription] = useState("");
    const [address, setAddress] = useState("");
    const [goal, setGoal] = useState("");
    const [phone, setPhone] = useState("");
    const [kisaLink, setKisaLink] = useState("");
    const [docs, setDocs] = useState<File[]>([]);
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState("");
    const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const fileRef = useRef<HTMLInputElement>(null);

    function pickFile(f: File) {
        setFile(f);
        setMediaType(f.type.startsWith("video") ? "video" : "image");
        setPreview(URL.createObjectURL(f));
    }

    const canSubmit = recipient.trim() && account.trim() && purpose.trim();

    async function submit() {
        if (!canSubmit) return;
        setError("");
        setUploading(true);
        try {
            let media_url: string | undefined;
            let media_type: "image" | "video" | undefined;
            if (file) {
                const ext = file.name.split(".").pop();
                const path = `sos/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
                const { error: upErr } = await supabase.storage
                    .from("videos").upload(path, file, { upsert: true, contentType: file.type });
                if (upErr) {
                    setError(`ფაილის ატვირთვა: ${upErr.message}`);
                    setUploading(false);
                    return;
                }
                const { data: urlData } = supabase.storage.from("videos").getPublicUrl(path);
                media_url = urlData.publicUrl;
                media_type = mediaType ?? "image";
            }
            const caseId = await createCase({
                firebase_uid: user?.uid,
                title: recipient,
                city: address || undefined,
                diagnosis: purpose,
            });
            const docUrls: string[] = [];
            for (const d of docs) {
                const url = await uploadDocument(d, "sos");
                if (url) docUrls.push(url);
            }
            const { error: dbErr } = await supabase.from("sos_posts").insert({
                firebase_uid: user?.uid ?? null,
                recipient,
                personal_id: personalId || null,
                account_number: account,
                bank_name: bank || null,
                purpose,
                description: description || null,
                address: address || null,
                goal_amount: goal ? Number(goal) : null,
                raised_amount: 0,
                verified: false,
                verification_status: "pending",
                phone: phone || null,
                media_url: media_url ?? null,
                media_type: media_type ?? null,
                source: "manual",
                case_id: caseId,
                kisa_link: kisaLink || null,
                document_urls: docUrls.length ? docUrls : null,
            });
            if (dbErr) {
                setError(`DB: ${dbErr.message}`);
                setUploading(false);
                return;
            }
            await notifyAdmin({
                type: "sos_post",
                title: "ახალი SOS პოსტი",
                message: `${recipient} — ${purpose}`,
                url: `/forum`,
            });
            onDone();
        }
        catch (e: unknown) {
            setError(e instanceof Error ? e.message : String(e));
        }
        finally {
            setUploading(false);
        }
    }

    return (
        <div className="sos-modal">
            <div className="sos-modal__backdrop" onClick={onClose} />
            <div className="sos-modal__dialog" role="dialog" aria-modal>
                <header className="sos-modal__header">
                    <div>
                        <p className="sos-modal__kicker">ახალი მოწოდება</p>
                        <h2 className="sos-modal__title">SOS ფორუმი</h2>
                    </div>
                    <button type="button" className="sos-modal__close" onClick={onClose}>✕</button>
                </header>

                <div className="sos-modal__body">
                    {error && <div className="sos-modal__error">⚠️ {error}</div>}

                    <label className={`sos-modal__upload${preview ? " sos-modal__upload--filled" : ""}`}>
                        {preview ? (
                            mediaType === "video"
                                ? <video src={preview} muted className="sos-modal__preview" />
                                : <img src={preview} alt="" className="sos-modal__preview" />
                        ) : (
                            <div className="sos-modal__upload-placeholder">
                                <span>📷</span>
                                <p>ატვირთე ფოტო ან ვიდეო</p>
                            </div>
                        )}
                        <input ref={fileRef} type="file" accept="image/*,video/*" hidden onChange={e => {
                            const f = e.target.files?.[0];
                            if (f) pickFile(f);
                        }} />
                    </label>

                    <Field label="მიმღები *" value={recipient} onChange={setRecipient} placeholder="სახელი და გვარი" />
                    <Field label="დანიშნულება *" value={purpose} onChange={setPurpose} placeholder="მაგ: ოპერაცია, წამალი..." />
                    <Field label="IBAN *" value={account} onChange={setAccount} placeholder="GE00XX0000000000000000" mono />
                    <Field label="ბანკი" value={bank} onChange={setBank} placeholder="საქართველოს ბანკი / თიბისი..." />
                    <Field label="საჭირო თანხა (₾)" value={goal} onChange={v => setGoal(v.replace(/\D/g, ""))} placeholder="6000" mono />
                    <Field label="პირადი ნომერი" value={personalId} onChange={setPersonalId} placeholder="01XXXXXXXXX" mono />
                    <Field label="მისამართი" value={address} onChange={setAddress} placeholder="ქალაქი, ქუჩა" />
                    <Field label="Kisa.ge ლინკი" value={kisaLink} onChange={setKisaLink} placeholder="https://kisa.ge/..." />

                    <div className="sos-modal__field">
                        <label>{t.forum.docs}</label>
                        <input type="file" accept="image/*,.pdf" multiple onChange={e => setDocs(Array.from(e.target.files ?? []))} />
                    </div>

                    <div className="sos-modal__field">
                        <label>ტელეფონი</label>
                        <input value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 9))} placeholder="5XX XXX XXX" />
                    </div>

                    <div className="sos-modal__field">
                        <label>აღწერა</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="აღწერეთ სიტუაცია..." rows={4} />
                    </div>
                </div>

                <footer className="sos-modal__footer">
                    <button type="button" className="e-btn e-btn--primary" style={{ width: "100%" }} disabled={!canSubmit || uploading} onClick={submit}>
                        {uploading ? "იგზავნება..." : canSubmit ? "გამოქვეყნება" : "შეავსე საჭირო ველები"}
                    </button>
                </footer>
            </div>
        </div>
    );
}

function Field({ label, value, onChange, placeholder, mono }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    mono?: boolean;
}) {
    return (
        <div className="sos-modal__field">
            <label>{label}</label>
            <input
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                style={mono ? { fontFamily: "'Inter',monospace" } : undefined}
            />
        </div>
    );
}
