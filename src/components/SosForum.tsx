import { useState, useEffect, useRef } from "react";
import { supabase, type SosPost } from "@/lib/supabase";
import { useApp } from "@/contexts/AppContext";

/* ════════════════════════════════════════════════════════
   Community SOS board — users post fundraising appeals that
   render in the same card style as the homepage SOS section.
   ════════════════════════════════════════════════════════ */
export default function SosForum() {
  const { user } = useApp();
  const [posts, setPosts] = useState<SosPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

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

  return (
    <div style={{
      minHeight: "calc(100vh - 64px)",
      background: "linear-gradient(180deg,#FFF7F7 0%,#FFFFFF 100%)",
      fontFamily: "'Noto Sans Georgian','Inter',sans-serif",
    }}>
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "56px 1.5rem 60px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <span style={{
            display: "inline-block", background: "rgba(230,57,70,0.12)",
            border: "1px solid rgba(230,57,70,0.3)", borderRadius: 50,
            padding: "6px 20px", fontSize: 13, fontWeight: 800,
            color: "#e63946", letterSpacing: "0.2em", marginBottom: 14,
            fontFamily: "'Inter',sans-serif",
          }}>🆘 SOS ფორუმი</span>
          <h2 style={{
            fontFamily: "'Noto Serif Georgian',serif",
            fontSize: "clamp(1.6rem,3.5vw,2.3rem)",
            fontWeight: 700, color: "#1A2340", margin: "0 0 10px",
          }}>
            გადაუდებელი დახმარება სჭირდებათ
          </h2>
          <p style={{ color: "#5A6E8C", fontSize: 14, margin: "0 auto 22px", maxWidth: 560, lineHeight: 1.7 }}>
            დადეთ თქვენი მოწოდება — მიუთითეთ მიმღები, ანგარიშის ნომერი და დანიშნულება,
            ატვირთეთ ფოტო ან ვიდეო. ყველა მოწოდება მაშინვე გამოჩნდება აქ.
          </p>
          <button onClick={() => setOpen(true)} style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "13px 26px", borderRadius: 14,
            background: "linear-gradient(135deg,#e63946,#c41e3a)",
            border: "none", color: "#fff", fontWeight: 700, fontSize: 15,
            cursor: "pointer", boxShadow: "0 8px 28px rgba(230,57,70,0.4)",
            fontFamily: "'Noto Sans Georgian','Inter',sans-serif",
            transition: "transform .2s",
          }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = ""}>
            ➕ დაამატე მოწოდება
          </button>
        </div>

        {/* Board */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#9AAAC2", fontSize: 14 }}>
            იტვირთება…
          </div>
        ) : posts.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "50px 24px",
            background: "#fff", borderRadius: 22,
            border: "1px dashed #FFD0D0", color: "#8B9BB4",
          }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>🤝</div>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#1A2340" }}>ჯერ არცერთი მოწოდება არ არის</p>
            <p style={{ margin: "6px 0 0", fontSize: 13 }}>იყავი პირველი, ვინც დახმარებას მოითხოვს</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
            {posts.map((p, i) => <SosCard key={p.id ?? i} post={p} reversed={i % 2 === 1} />)}
          </div>
        )}
      </div>

      {open && <SosFormModal user={user} onClose={() => setOpen(false)} onDone={() => { setOpen(false); load(); }} />}

      <style>{`@media(max-width:768px){.sosf-row{grid-template-columns:1fr !important;direction:ltr !important}}`}</style>
    </div>
  );
}

/* ── Single appeal card (homepage SOS style) ─────────────── */
function SosCard({ post, reversed }: { post: SosPost; reversed: boolean }) {
  return (
    <div className="sosf-row" style={{
      display: "grid", gridTemplateColumns: "1fr 1fr",
      gap: 28, alignItems: "center",
      direction: reversed ? "rtl" : "ltr",
    }}>
      {/* Media */}
      <div style={{ direction: "ltr" }}>
        <div style={{
          borderRadius: 22, overflow: "hidden",
          boxShadow: "0 16px 44px rgba(230,57,70,0.16)",
          border: "1px solid rgba(230,57,70,0.14)",
          aspectRatio: "16/10", background: "#000", position: "relative",
        }}>
          {post.media_url ? (
            post.media_type === "video" ? (
              <video src={post.media_url} controls style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <img src={post.media_url} alt={post.recipient} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            )
          ) : (
            <div style={{
              width: "100%", height: "100%", display: "grid", placeItems: "center",
              background: "rgba(230,57,70,0.06)", color: "#e6394680", fontSize: 13,
            }}>მედია არ არის</div>
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
          fontSize: 24, fontWeight: 700, color: "#1A2340", margin: "0 0 12px",
        }}>{post.recipient}</h3>

        {post.description && (
          <p style={{ color: "#5A6E8C", fontSize: 14, lineHeight: 1.85, margin: "0 0 16px" }}>
            {post.description}
          </p>
        )}

        {/* Address */}
        {post.address && (
          <div style={{
            display: "flex", alignItems: "flex-start", gap: 8,
            background: "rgba(230,57,70,0.06)",
            border: "1px solid rgba(230,57,70,0.15)",
            borderRadius: 14, padding: "11px 15px", marginBottom: 16,
          }}>
            <span style={{ fontSize: 15 }}>📍</span>
            <p style={{ color: "#4A5568", fontSize: 13, margin: 0, lineHeight: 1.5 }}>{post.address}</p>
          </div>
        )}

        {/* Account row(s) */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 12,
            background: "#fff", border: "1px solid #FFE0E0",
            borderRadius: 12, padding: "11px 15px",
          }}>
            <span style={{ fontSize: 13, color: "#6B82A0", fontWeight: 600, minWidth: 120, flexShrink: 0 }}>
              {post.bank_name || "ანგარიში"}
            </span>
            <span style={{
              fontSize: 13, color: "#1A2340", fontWeight: 700, flex: 1,
              fontFamily: "'Inter',monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>{post.account_number}</span>
            <button onClick={() => navigator.clipboard?.writeText(post.account_number)} title="კოპირება" style={{
              background: "rgba(230,57,70,0.1)", border: "none",
              borderRadius: 8, padding: "6px 9px", cursor: "pointer",
              fontSize: 12, color: "#e63946", fontWeight: 600, flexShrink: 0,
            }}>📋</button>
          </div>

          <p style={{ color: "#8B9BB4", fontSize: 12, margin: "6px 0 0" }}>
            👉 დანიშნულება: <strong style={{ color: "#e63946" }}>{post.purpose}</strong>
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Submit form modal ───────────────────────────────────── */
function SosFormModal({ user, onClose, onDone }: {
  user: ReturnType<typeof useApp>["user"];
  onClose: () => void;
  onDone: () => void;
}) {
  const [recipient, setRecipient]   = useState("");
  const [personalId, setPersonalId] = useState("");
  const [account, setAccount]       = useState("");
  const [bank, setBank]             = useState("");
  const [purpose, setPurpose]       = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress]       = useState("");
  const [phone, setPhone]           = useState("");
  const [file, setFile]             = useState<File | null>(null);
  const [preview, setPreview]       = useState<string>("");
  const [mediaType, setMediaType]   = useState<"image" | "video" | null>(null);
  const [uploading, setUploading]   = useState(false);
  const [error, setError]           = useState("");
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
        if (upErr) { setError(`ფაილის ატვირთვა: ${upErr.message}`); setUploading(false); return; }
        const { data: urlData } = supabase.storage.from("videos").getPublicUrl(path);
        media_url = urlData.publicUrl;
        media_type = mediaType ?? "image";
      }
      const { error: dbErr } = await supabase.from("sos_posts").insert({
        firebase_uid: user?.uid ?? null,
        recipient, personal_id: personalId || null,
        account_number: account, bank_name: bank || null,
        purpose, description: description || null,
        address: address || null,
        phone: phone || null,
        media_url: media_url ?? null,
        media_type: media_type ?? null,
      });
      if (dbErr) { setError(`DB: ${dbErr.message}`); setUploading(false); return; }
      onDone();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setUploading(false);
    }
  }

  return (
    <>
      <div onClick={onClose} style={{
        position: "fixed", inset: 0, zIndex: 3000,
        background: "rgba(0,0,15,0.7)", backdropFilter: "blur(10px)",
      }} />
      <div style={{
        position: "fixed", inset: 0, zIndex: 3001,
        display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
        pointerEvents: "none",
      }}>
        <div style={{
          width: "100%", maxWidth: 480, maxHeight: "92vh",
          borderRadius: 28, overflow: "hidden",
          background: "rgba(16,16,28,0.94)", backdropFilter: "blur(48px)",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
          display: "flex", flexDirection: "column", pointerEvents: "auto",
          fontFamily: "'Noto Sans Georgian','Inter',sans-serif",
        }}>
          {/* Header */}
          <div style={{
            padding: "18px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)",
            display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 12,
                background: "rgba(230,57,70,0.2)", border: "1px solid rgba(230,57,70,0.4)",
                display: "grid", placeItems: "center", fontSize: 18,
              }}>🆘</div>
              <p style={{ color: "#fff", fontWeight: 700, fontSize: 15, margin: 0 }}>ახალი მოწოდება</p>
            </div>
            <button onClick={onClose} style={{
              width: 30, height: 30, borderRadius: "50%",
              background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: 14,
            }}>✕</button>
          </div>

          {/* Body */}
          <div style={{ overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: 14, flex: 1 }}>
            {error && (
              <div style={{
                background: "rgba(230,57,70,0.12)", border: "1px solid rgba(230,57,70,0.4)",
                borderRadius: 12, padding: "10px 14px", color: "#ff8a94", fontSize: 12,
              }}>⚠️ {error}</div>
            )}

            {/* Media upload */}
            <label style={{
              borderRadius: 18, overflow: "hidden", cursor: "pointer",
              border: `2px dashed ${preview ? "transparent" : "rgba(255,255,255,0.18)"}`,
              background: "rgba(255,255,255,0.04)",
              aspectRatio: preview ? "16/9" : undefined,
              minHeight: preview ? undefined : 120,
              display: "flex", alignItems: "center", justifyContent: "center",
              position: "relative",
            }}>
              {preview ? (
                mediaType === "video"
                  ? <video src={preview} style={{ width: "100%", height: "100%", objectFit: "cover" }} muted />
                  : <img src={preview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div style={{ textAlign: "center", color: "rgba(255,255,255,0.5)" }}>
                  <div style={{ fontSize: 30, marginBottom: 6 }}>📷</div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>ატვირთე ფოტო ან ვიდეო</p>
                  <p style={{ margin: "2px 0 0", fontSize: 11, opacity: 0.6 }}>JPG · PNG · MP4 · MOV</p>
                </div>
              )}
              {preview && (
                <span style={{
                  position: "absolute", bottom: 8, right: 8,
                  background: "rgba(0,0,0,0.6)", color: "#fff",
                  fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 50,
                }}>🔄 შეცვლა</span>
              )}
              <input ref={fileRef} type="file" accept="image/*,video/*" style={{ display: "none" }}
                onChange={e => { const f = e.target.files?.[0]; if (f) pickFile(f); }} />
            </label>

            <Field label="მიმღები *"            icon="👤" value={recipient}  onChange={setRecipient}  placeholder="სახელი და გვარი" />
            <Field label="რა სჭირდება / დანიშნულება *" icon="🎯" value={purpose}    onChange={setPurpose}    placeholder="მაგ: ოპერაცია, წამალი..." />
            <Field label="ანგარიშის ნომერი (IBAN) *"   icon="🏦" value={account}    onChange={setAccount}    placeholder="GE00XX0000000000000000" mono />
            <Field label="ბანკი"                 icon="💳" value={bank}       onChange={setBank}       placeholder="საქართველოს ბანკი / თიბისი..." />
            <Field label="პირადი ნომერი"          icon="🪪" value={personalId} onChange={setPersonalId} placeholder="01XXXXXXXXX" mono />
            <Field label="მისამართი"             icon="📍" value={address}    onChange={setAddress}    placeholder="ქალაქი, ქუჩა, ნომერი" />

            {/* phone */}
            <div>
              <p style={labelStyle}>📞 ტელეფონი</p>
              <input value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 9))}
                placeholder="5XX XXX XXX" style={inputStyle} />
            </div>

            {/* description */}
            <div>
              <p style={labelStyle}>📝 დამატებითი ტექსტი</p>
              <textarea value={description} onChange={e => setDescription(e.target.value)}
                placeholder="აღწერეთ სიტუაცია..." rows={4}
                style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }} />
            </div>
          </div>

          {/* Footer */}
          <div style={{
            padding: "12px 20px 18px", flexShrink: 0,
            borderTop: "1px solid rgba(255,255,255,0.07)", background: "rgba(16,16,28,0.96)",
          }}>
            <button onClick={submit} disabled={!canSubmit || uploading} style={{
              width: "100%", padding: 15, borderRadius: 16,
              background: canSubmit ? "linear-gradient(135deg,#e63946,#c41e3a)" : "rgba(255,255,255,0.08)",
              border: "none", cursor: canSubmit && !uploading ? "pointer" : "not-allowed",
              color: canSubmit ? "#fff" : "rgba(255,255,255,0.3)",
              fontSize: 15, fontWeight: 700,
              fontFamily: "'Noto Sans Georgian','Inter',sans-serif",
              boxShadow: canSubmit ? "0 6px 24px rgba(230,57,70,0.45)" : "none",
            }}>
              {uploading ? "იგზავნება..." : canSubmit ? "🆘 გამოქვეყნება" : "შეავსე საჭირო ველები (*)"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

const labelStyle: React.CSSProperties = {
  color: "rgba(255,255,255,0.8)", fontWeight: 600, fontSize: 13, margin: "0 0 6px",
};
const inputStyle: React.CSSProperties = {
  width: "100%", padding: "12px 14px", borderRadius: 14,
  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
  color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box",
  fontFamily: "'Noto Sans Georgian','Inter',sans-serif",
};

function Field({ label, icon, value, onChange, placeholder, mono }: {
  label: string; icon: string; value: string;
  onChange: (v: string) => void; placeholder?: string; mono?: boolean;
}) {
  return (
    <div>
      <p style={labelStyle}>{icon} {label}</p>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ ...inputStyle, fontFamily: mono ? "'Inter',monospace" : inputStyle.fontFamily }} />
    </div>
  );
}
